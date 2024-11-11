import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInput } from "../components/chat/chat-input";
import { ChatStream } from "../components/chat/chat-stream";
import { MessageList } from "../components/chat/message-list";
import { getMessages } from "../actions/chat-actions";
import { Message } from "../lib/types";
import { createTaskSendMessageAI } from "@/lib/features/task-manager/task";

export type TSendMessage = typeof createTaskSendMessageAI

interface ChatPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params;
  const messages: Message[] = await getMessages(conversationId);

  return (
    // Remove any margin/padding as it's handled by the parent layout
    <div className="w-full">
      {/* Chat container that takes up available vertical space */}
      <div className="relative h-[calc(100vh-8rem)]">
        {/* Messages container with scroll */}
        <div className="absolute inset-0 bottom-16">
          <div className="h-[calc(100vh-15rem)] overflow-y-auto flex flex-col-reverse">
            <div className="flex-1 max-w-5xl mx-auto px-5">
              <Suspense fallback={<Skeleton />}>
                <MessageList messages={messages} />
              </Suspense>

              <Suspense fallback={<Skeleton />}>
                <ChatStream
                  // message={
                  //   lastMessage?.content ??
                  //   "The user just created this new discussion and you will weclome him."
                  // }
                  // content={""}
                  conversationId={conversationId}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Fixed chat input at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-5xl mx-auto px-5">
            <ChatInput
              conversationId={conversationId}
              sendMessage={createTaskSendMessageAI}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
