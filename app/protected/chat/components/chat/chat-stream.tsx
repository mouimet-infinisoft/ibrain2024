"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "@/components/markdown";
import { useEffect, useState } from "react";
import { BotIcon, Brain } from "lucide-react";
import { TextToSpeech } from "@/components/ui/text-to-speech";

interface ChatStreamProps {
  message: string;
  conversationId: string;
}

const BrainLoader = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center gap-4"
      initial={{ scale: 0 }}
      animate={{ 
        scale: [0, 1.2, 1],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration: 1.6,  // Doubled from 0.8
        ease: "easeOut",
      }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,  // Doubled from 1.5
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={{
            filter: [
              "hue-rotate(0deg) brightness(1)",
              "hue-rotate(180deg) brightness(1.2)",
              "hue-rotate(360deg) brightness(1)"
            ],
          }}
          transition={{
            duration: 4,  // Doubled from 2
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Brain className="w-32 h-32 text-primary" />
        </motion.div>
      </motion.div>
      <motion.p
        className="text-lg font-medium text-primary"
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 3,  // Doubled from 1.5
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        iBrain is thinking...
      </motion.p>
    </motion.div>
  );
};

export function ChatStream({ message, conversationId }: ChatStreamProps) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    let mounted = true;

    async function startStreaming() {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, conversationId }),
          signal,
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
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log("Fetch aborted:", error);
        } else {
          console.error("Error reading stream:", error);
        }
        setIsStreaming(false);
      }
    }

    startStreaming();

    return () => {
      mounted = false;
      abortController.abort();
      setContent("");
      setIsStreaming(true);
      setIsExiting(false);
    };
  }, [message, conversationId]);

  if (!content && !isStreaming) return null;

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" onExitComplete={() => setIsExiting(false)}>
        {!content && isStreaming ? (
          <motion.div
            key="loader"
            className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              scale: 20,
              opacity: [1, 1, 0],
              rotate: 720,
              filter: [
                "hue-rotate(0deg) brightness(1) blur(0px)",
                "hue-rotate(180deg) brightness(1.5) blur(2px)",
                "hue-rotate(360deg) brightness(2) blur(4px)"
              ]
            }}
            transition={{ 
              exit: {
                duration: 3.2,  // Doubled from 1.6
                ease: [0.4, 0, 0.2, 1],
                scale: {
                  duration: 3.2,  // Doubled from 1.6
                  ease: [0.4, 0, 0.2, 1]
                },
                rotate: {
                  duration: 3.2,  // Doubled from 1.6
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 3.2,  // Doubled from 1.6
                  times: [0, 0.8, 1],
                  ease: "easeOut"
                },
                filter: {
                  duration: 3.2,  // Doubled from 1.6
                  ease: "linear"
                }
              }
            }}
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
            onAnimationStart={() => {
              if (!content) setIsExiting(true);
            }}
          >
            <BrainLoader />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="flex flex-row gap-4 px-4 w-full md:w-[800px] md:px-0 first-of-type:pt-20"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1.4,  // Doubled from 0.7
              ease: [0.2, 0.8, 0.2, 1],
              delay: isExiting ? 1.6 : 0  // Doubled from 0.8
            }}
          >
            <div
              className={`size-[36px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400 ${
                isStreaming ? "animate-pulse" : ""
              }`}
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
                {!isStreaming && <TextToSpeech text={content} />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}