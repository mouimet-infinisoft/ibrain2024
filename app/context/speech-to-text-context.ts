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
