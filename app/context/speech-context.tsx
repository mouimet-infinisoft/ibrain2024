"use client";

import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

interface SpeechContextType {
  speak: (text: string, language?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export const SpeechContext = createContext<SpeechContextType | null>(null);

