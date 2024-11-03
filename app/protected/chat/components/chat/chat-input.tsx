'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { sendMessage } from '../../actions/chat-actions';
import { useRef } from 'react';
import { SpeechToText } from '../speech/speech-to-text';

export function ChatInput({ conversationId }: { conversationId: string }) {
  const { pending } = useFormStatus();
  const sendMessageWithConversationId = sendMessage.bind(null, conversationId);

  // Create a ref for the input
  const inputRef = useRef<HTMLInputElement>(null);

  // Callback to handle transcript updates
  const handleTranscript = (transcript: string) => {
    if (inputRef.current) {
      inputRef.current.value = transcript; // Set the input's value directly
    }
  };

  return (
    <form
      action={sendMessageWithConversationId}
      className="flex items-center gap-2 p-4 border-t"
    >
      <Input
        name="message"
        placeholder="Type a message..."
        disabled={pending}
        className="flex-1"
        ref={inputRef} 
        required
      />
      <SpeechToText onTranscript={handleTranscript} />
      <Button type="submit" disabled={pending}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
