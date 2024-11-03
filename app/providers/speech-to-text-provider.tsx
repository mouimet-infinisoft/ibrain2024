"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpeechToTextContext, TranscriptCallback, SpeechToTextContextType } from '@/app/context/speech-to-text-context';

enum InitializationState {
  Uninitialized,
  Initialized,
  Unsupported,
}

interface SpeechToTextProviderProps {
  children: React.ReactNode;
  onTranscript?: (text: string) => void;
}

export function SpeechToTextProvider({ 
  children, 
  onTranscript 
}: SpeechToTextProviderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState<InitializationState>(
    InitializationState.Uninitialized
  );
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const listenersRef = useRef<Set<TranscriptCallback>>(new Set());

  useEffect(() => {
    if (onTranscript) {
      listenersRef.current.add(onTranscript);
      return () => {
        listenersRef.current.delete(onTranscript);
      };
    }
  }, [onTranscript]);

  const notifyListeners = useCallback((text: string) => {
    listenersRef.current.forEach(listener => {
      try {
        listener(text);
      } catch (error) {
        console.error('Error in transcript listener:', error);
      }
    });
  }, []);

  const addTranscriptListener = useCallback((callback: TranscriptCallback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      const recognition = recognitionRef.current;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const newTranscript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");

        setTranscript(newTranscript);
        notifyListeners(newTranscript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onnomatch = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      setIsInitialized(InitializationState.Initialized);
    } else {
      setIsInitialized(InitializationState.Unsupported);
    }

    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.stop();
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onnomatch = null;
        recognition.onerror = null;
        recognitionRef.current = null;
      }
    };
  }, [notifyListeners]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
    } catch {}
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, [isListening]);

  const value: SpeechToTextContextType = {
    isListening,
    isSupported: isInitialized === InitializationState.Initialized,
    startListening,
    stopListening,
    transcript,
    addTranscriptListener,
  };

  return (
    <SpeechToTextContext.Provider value={value}>
      {children}
    </SpeechToTextContext.Provider>
  );
}
