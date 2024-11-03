"use client";

import { SpeechContext } from "@/app/context/speech-context";
import { useContext } from "react";

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
}