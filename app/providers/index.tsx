"use client";

import { SpeechProvider as TextToSpeechProvider } from "./SpeechProvider";
import { SpeechToTextProvider } from "./speech-to-text-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TextToSpeechProvider>
      <SpeechToTextProvider>{children}</SpeechToTextProvider>
    </TextToSpeechProvider>
  );
}
