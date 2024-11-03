"use client";

import { useSpeechToText } from "@/lib/hooks/use-speech-to-text";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface SpeechToTextProps {
  onTranscript?: (text: string) => void;
  language?: string;
}

export function SpeechToText({
  onTranscript,
  language = "en-US",
}: SpeechToTextProps) {
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  } = useSpeechToText();

  if (!isSupported) return null;

  const handleStart = () => {
    startListening();
  };

  const handleStop = () => {
    stopListening();
    if (onTranscript && transcript) {
      onTranscript(transcript);
    }
  };

  return (
    <div className="flex space-x-2">
      {!isListening && (
        <Button
          type="button"
          onClick={handleStart}
          variant="ghost"
          size="icon"
          aria-label="Start recording"
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}

      {isListening && (
        <Button
          type="button"
          onClick={handleStop}
          variant="ghost"
          size="icon"
          aria-label="Stop recording"
        >
          <MicOff className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}
