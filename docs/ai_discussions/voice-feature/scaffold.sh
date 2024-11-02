#!/bin/bash

# Set error handling
set -e

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "app/chat" ]; then
    log_error "Please run this script from the project root directory (where 'app/chat' directory exists)"
    exit 1
}

# Create necessary directories
log_info "Creating speech components directory..."
mkdir -p app/chat/components/speech

# Create speech-to-text component
log_info "Creating speech-to-text component..."
cat > app/chat/components/speech/speech-to-text.tsx << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
}

export function SpeechToText({ onTranscript, isListening: externalIsListening }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        onTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  useEffect(() => {
    if (externalIsListening !== undefined && externalIsListening !== isListening) {
      toggleListening();
    }
  }, [externalIsListening, isListening, toggleListening]);

  if (!recognition) {
    return null;
  }

  return (
    <Button
      onClick={toggleListening}
      variant="ghost"
      size="icon"
      className={isListening ? 'text-red-500' : ''}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
EOL

# Create text-to-speech component
log_info "Creating text-to-speech component..."
cat > app/chat/components/speech/text-to-speech.tsx << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
}

export function TextToSpeech({ text, autoPlay = false }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const speak = useCallback(() => {
    if (!speechSynthesis) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, [speechSynthesis, text]);

  const stop = useCallback(() => {
    if (!speechSynthesis) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [speechSynthesis]);

  useEffect(() => {
    if (autoPlay) {
      speak();
    }
  }, [autoPlay, speak]);

  if (!speechSynthesis) {
    return null;
  }

  return (
    <Button
      onClick={isSpeaking ? stop : speak}
      variant="ghost"
      size="icon"
      className={isSpeaking ? 'text-blue-500' : ''}
    >
      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
}
EOL

# Update types.ts
log_info "Updating types.ts..."
cat >> app/chat/lib/types.ts << 'EOL'

// Speech recognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
EOL

# Update message-item.tsx
log_info "Updating message-item component..."
# Create a backup first
cp app/chat/components/chat/message-item.tsx app/chat/components/chat/message-item.tsx.bak

# Update the file using sed
sed -i.bak '
  /^import/a\
import { TextToSpeech } from "../speech/text-to-speech";
  /<div className="flex-1">/a\
      {message.role === "assistant" && (\
        <TextToSpeech text={message.content} />\
      )}
' app/chat/components/chat/message-item.tsx

# Update chat-input.tsx
log_info "Updating chat-input component..."
# Create a backup first
cp app/chat/components/chat/chat-input.tsx app/chat/components/chat/chat-input.tsx.bak

cat > app/chat/components/chat/chat-input.tsx << 'EOL'
'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { sendMessage } from '../../actions/chat-actions';
import { useState } from 'react';
import { SpeechToText } from '../speech/speech-to-text';

export function ChatInput({ 
  conversationId 
}: { 
  conversationId: string 
}) {
  const { pending } = useFormStatus();
  const [inputValue, setInputValue] = useState('');
  const sendMessageWithConversationId = sendMessage.bind(null, conversationId);

  const handleTranscript = (text: string) => {
    setInputValue(text);
  };

  const handleSubmit = async (formData: FormData) => {
    await sendMessageWithConversationId(formData);
    setInputValue('');
  };

  return (
    <form 
      action={handleSubmit}
      className="flex items-center gap-2 p-4 border-t"
    >
      <Input
        name="message"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        disabled={pending}
        className="flex-1"
      />
      <SpeechToText onTranscript={handleTranscript} />
      <Button type="submit" disabled={pending}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
EOL

# Install required dependencies
log_info "Installing required dependencies..."
npm install --save lucide-react

# Cleanup backup files
log_info "Cleaning up backup files..."
rm -f app/chat/components/chat/*.bak

log_info "Installation complete! New features have been added:"
echo "✓ Speech-to-text component"
echo "✓ Text-to-speech component"
echo "✓ Updated message item with speech synthesis"
echo "✓ Updated chat input with voice recognition"
echo "✓ Added required type definitions"

log_warning "Please make sure to:"
echo "1. Run 'npm install' if you haven't already"
echo "2. Restart your development server"
echo "3. Test the new speech features in your browser"
echo "4. Check browser console for any potential errors"

exit 0