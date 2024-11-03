"use client";

import { motion } from "framer-motion";
import { Markdown } from "@/components/markdown";
import { Message } from "../../lib/types";
import { cn } from "@/lib/utils";
import { BotIcon, UserIcon } from "lucide-react";
import { TextToSpeech } from "@/components/ui/text-to-speech";

export function MessageItem({ message }: { message: Message }) {
  return (
    <motion.div
      className={cn(
        "flex gap-4 px-4 w-full md:w-[800px] md:px-0 first-of-type:pt-20",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[36px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {message.role === "user" ? (
          <UserIcon size={36} />
        ) : (
          <BotIcon size={36} />
        )}
      </div>
      <div
        className={cn(
          "flex flex-col gap-1",
          message.role === "user" ? "items-end" : "items-start",
          "w-full"
        )}
      >
        <div
          className={cn(
            "p-4 rounded-lg",
            "max-w-[80%]",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <Markdown>{message.content}</Markdown>
          {message.role === "assistant" && (
            <TextToSpeech text={message.content}  />
          )}
        </div>
      </div>
    </motion.div>
  );
}
