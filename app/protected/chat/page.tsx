import { Suspense } from 'react';
import { getConversations } from "./actions/chat-actions";
import { Button } from '@/components/ui/button';
import { createConversation } from './actions/chat-actions';
import { MessageSquarePlus } from 'lucide-react';

export default async function ChatHomePage() {
  const conversations = await getConversations();

  return (
    <div className="container max-w-4xl py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <form action={createConversation}>
          <Button>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </form>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <div className="space-y-2">
          {conversations.map(conversation => (
            <Button
              key={conversation.id}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={`/protected/chat/${conversation.id}`}>
                Chat {new Date(conversation.created_at).toLocaleDateString()}
              </a>
            </Button>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
