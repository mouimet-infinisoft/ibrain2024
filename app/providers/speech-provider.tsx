"use client";

import { SpeechProvider as CoreSpeechProvider } from "@/app/context/speech-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CoreSpeechProvider>{children}</CoreSpeechProvider>;
}