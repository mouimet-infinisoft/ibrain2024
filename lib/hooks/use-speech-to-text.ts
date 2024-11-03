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
