import { useState, useRef, useEffect } from "react";
import { SpeechContext } from "../context/speech-context";

interface SpeechProviderProps {
    children: React.ReactNode;
    defaultLanguage?: string;
  }
  
  export function SpeechProvider({ 
    children, 
    defaultLanguage = 'en-CA' 
  }: SpeechProviderProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
    const synthesis = useRef<SpeechSynthesis | null>(null);
    const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  
    // Initialize speech synthesis
    useEffect(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        synthesis.current = window.speechSynthesis;
        setIsSupported(true);
      }
  
      return () => {
        if (currentUtterance.current) {
          stop();
        }
      };
    }, []);
  
    // Handle voice selection
    useEffect(() => {
      if (!synthesis.current) return;
  
      const handleVoicesChanged = () => {
        const voices = synthesis.current!.getVoices();
        const selectedVoice = voices.find(
          (v) => v.lang === defaultLanguage && v.name.toLowerCase().includes('natural')
        ) || voices.find((v) => v.lang === defaultLanguage);
        
        setVoice(selectedVoice || null);
      };
  
      handleVoicesChanged();
      synthesis.current.addEventListener('voiceschanged', handleVoicesChanged);
  
      return () => {
        synthesis.current?.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }, [defaultLanguage]);
  
    const stop = () => {
      if (synthesis.current) {
        synthesis.current.cancel();
        setIsSpeaking(false);
        if (currentUtterance.current) {
          currentUtterance.current.onend = null;
          currentUtterance.current.onstart = null;
          currentUtterance.current.onerror = null;
        }
        currentUtterance.current = null;
      }
    };
  
    const speak = (text: string, language?: string) => {
      if (!synthesis.current || !voice) return;
  
      stop();
  
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = language || defaultLanguage;
  
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
  
      currentUtterance.current = utterance;
      synthesis.current.speak(utterance);
    };
  
    return (
      <SpeechContext.Provider
        value={{
          speak,
          stop,
          isSpeaking,
          isSupported,
        }}
      >
        {children}
      </SpeechContext.Provider>
    );
  }
  