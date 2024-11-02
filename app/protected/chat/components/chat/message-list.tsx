import { Message } from "../../lib/types";
import { EmptyState } from "../ui/empty-state";
import { MessageItem } from "./message-item";

export function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
