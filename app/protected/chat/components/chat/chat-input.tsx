"use client";

import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { sendMessage } from "../../actions/chat-actions";
import { useEffect, useRef } from "react";
import { SpeechToText } from "@/components/ui/speech-to-text";
import { useSpeechToText } from "@/lib/hooks/use-speech-to-text";

export function ChatInput({ conversationId }: { conversationId: string }) {
  const { pending } = useFormStatus();
  const sendMessageWithConversationId = sendMessage.bind(null, conversationId);
  const { transcript, stopListening } = useSpeechToText();

  // Create a ref for the input
  const inputRef = useRef<HTMLInputElement>(null);

  // Callback to handle transcript updates
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = transcript; // Set the input's value directly
    }
  }, [transcript]);

  return (
    <form
      action={sendMessageWithConversationId}
      className="flex items-center gap-2 p-4"
    >
      <Input
        name="message"
        placeholder="Type a message..."
        disabled={pending}
        className="flex-1"
        ref={inputRef}
        required
      />
      <SpeechToText />
      <Button
        type="submit"
        disabled={pending}
        onClick={() => {
          stopListening();
        }}
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
