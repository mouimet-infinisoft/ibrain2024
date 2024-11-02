"use client";

import { motion } from "framer-motion";
import { Markdown } from "@/components/markdown";
import { useEffect, useState } from "react";
import { BotIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatStreamProps {
  message: string;
  conversationId: string;
}

export function ChatStream({ message, conversationId }: ChatStreamProps) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function startStreaming() {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, conversationId }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        while (mounted) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const { content, done } = JSON.parse(line);
              if (done) {
                setIsStreaming(false);
                break;
              }
              if (mounted) {
                setContent((prev) => prev + content);
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error reading stream:", error);
        setIsStreaming(false);
      }
    }

    startStreaming();

    return () => {
      mounted = false;
      setContent("");
      setIsStreaming(true);
    };
  }, [message, conversationId]);

  if (!content && !isStreaming) return null;

  return (
    <motion.div
      className="flex flex-row gap-4 px-4 w-full md:w-[800px] md:px-0 first-of-type:pt-20"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div
        className={`size-[36px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400 ${isStreaming ? "animate-pulse " : ""}`}
      >
        <BotIcon size={36} />
      </div>
      <div className="flex flex-col gap-1 items-start w-full">
        <div className="p-4 rounded-lg max-w-[80%] bg-muted">
          <Markdown>{content}</Markdown>
          {isStreaming && (
            <span className="inline-block animate-pulse ml-1 vertical-align-text-top">
              ▋
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
