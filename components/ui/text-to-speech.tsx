"use client";

import { useSpeech } from "@/lib/hooks/use-speech";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface TextToSpeechProps {
  text: string;
  language?: string;
}

export function TextToSpeech({ text, language }: TextToSpeechProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  if (!isSupported) return null;

  return (
    <div className="flex space-x-2">
      {!isSpeaking && (
        <Button 
          onClick={() => speak(text, language)} 
          variant="ghost" 
          size="icon"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      )}
      {isSpeaking && (
        <Button 
          onClick={stop} 
          variant="ghost" 
          size="icon"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}