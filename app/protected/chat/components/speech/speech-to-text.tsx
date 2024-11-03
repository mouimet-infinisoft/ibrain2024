"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

// Define an enum for the initialization states
enum InitializationState {
  Uninitialized,
  Initialized,
  Unsupported,
}

export function SpeechToText({ onTranscript }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState<InitializationState>(
    InitializationState.Uninitialized
  );
  const recognitionRef = useRef<typeof window.SpeechRecognition>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // Register event handlers
      const recognition = recognitionRef.current;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");

        onTranscript(transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onnomatch = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      // Mark as initialized after successful setup
      setIsInitialized(InitializationState.Initialized);
    } else {
      // Mark as unsupported if SpeechRecognition is not available
      setIsInitialized(InitializationState.Unsupported);
    }

    return () => {
      // Cleanup function to stop recognition and remove event handlers
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
  }, [onTranscript]);

  const handleStart = () => {
    if (!recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
    } catch {}
  };

  const handleStop = () => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch {}
  };

  // Conditional rendering based on initialization state
  if (isInitialized === InitializationState.Uninitialized) {
    return (
      <Button type="button" disabled variant="ghost" size="icon">
        {/* Loading indicator or a circle button */}
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 animate-spin" />
      </Button>
    );
  }

  if (isInitialized === InitializationState.Unsupported) {
    return (
      <Button type="button" disabled variant="ghost" size="icon">
        {/* Display unsupported message or icon */}
        <div className="text-gray-500">Speech Recognition Unsupported</div>
      </Button>
    );
  }

  return (
    <>
      {isListening ? (
        <Button
          type="button"
          onClick={handleStop}
          variant="ghost"
          size="icon"
          className="text-red-500"
        >
          <MicOff className="h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" onClick={handleStart} variant="ghost" size="icon">
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
