'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { sendMessage } from '../../actions/chat-actions';

export function ChatInput({ 
  conversationId 
}: { 
  conversationId: string 
}) {
  const { pending } = useFormStatus();
  const sendMessageWithConversationId = sendMessage.bind(null, conversationId);

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
      />
      <Button type="submit" disabled={pending}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
