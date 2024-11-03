#!/bin/bash

# Define base paths
BASE_DIR="/home/nitr0gen/ibrain2024/ibrain2024"
CONTEXT_DIR="$BASE_DIR/app/context"
PROVIDERS_DIR="$BASE_DIR/app/providers"
HOOKS_DIR="$BASE_DIR/lib/hooks"

# Create directories if they don't exist
mkdir -p "$CONTEXT_DIR"
mkdir -p "$PROVIDERS_DIR"
mkdir -p "$HOOKS_DIR"

# Create speech-to-text-context.ts
cat > "$CONTEXT_DIR/speech-to-text-context.ts" << 'EOF'
"use client";

import { createContext } from 'react';

enum InitializationState {
  Uninitialized,
  Initialized,
  Unsupported,
}

export type TranscriptCallback = (text: string) => void;

export interface SpeechToTextContextType {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  addTranscriptListener: (callback: TranscriptCallback) => () => void;
}

export const SpeechToTextContext = createContext<SpeechToTextContextType | null>(null);
EOF

# Create speech-to-text-provider.tsx
cat > "$PROVIDERS_DIR/speech-to-text-provider.tsx" << 'EOF'
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
EOF

# Create use-speech-to-text.ts
cat > "$HOOKS_DIR/use-speech-to-text.ts" << 'EOF'
"use client";

import { useContext } from "react";
import { SpeechToTextContext, SpeechToTextContextType } from "@/app/context/speech-to-text-context";

export function useSpeechToText(): SpeechToTextContextType {
  const context = useContext(SpeechToTextContext);
  
  if (!context) {
    throw new Error("useSpeechToText must be used within a SpeechToTextProvider");
  }
  
  return context;
}
EOF

# Make the script executable
chmod +x "$0"

echo "Speech-to-text context, provider, and hook have been created successfully!"
echo "Files created:"
echo "  - $CONTEXT_DIR/speech-to-text-context.ts"
echo "  - $PROVIDERS_DIR/speech-to-text-provider.tsx"
echo "  - $HOOKS_DIR/use-speech-to-text.ts"
EOF