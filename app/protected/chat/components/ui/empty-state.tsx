import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
      <MessageSquare className="h-12 w-12 text-muted-foreground" />
      <h3 className="font-semibold text-lg">No messages yet</h3>
      <p className="text-sm text-muted-foreground">
        Send a message to start the conversation
      </p>
    </div>
  );
}
