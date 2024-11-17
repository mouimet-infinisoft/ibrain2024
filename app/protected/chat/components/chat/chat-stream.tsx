"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "@/components/markdown";
import { useEffect, useState, useCallback } from "react";
import { BotIcon, Brain, Code2, Copy, Maximize2 } from "lucide-react";
import { TextToSpeech } from "@/components/ui/text-to-speech";
import { useRouter } from "next/navigation";
import { useSpeech } from "@/lib/hooks/use-speech";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatStreamProps {
  conversationId: string;
}

interface Message {
  action: string;
  payload: string;
  status?: "streaming" | "complete";
  isStreaming?: boolean;
  isComplete?: boolean;
  id?: string;
  chunk?: string;
  taskType?: "REALTIME" | "BACKGROUND";
  backgroundType?: "code" | "research";
  metadata?: {
    language: string;
    title: string;
    timestamp: string;
  };
}

interface CodeCardProps {
  code: string;
  language: string;
  title: string;
  timestamp: string;
}

function CodeCard({ code, language, title, timestamp }: CodeCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <>
      <Card className="w-full max-w-[600px] hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-2">
            Generated at {new Date(timestamp).toLocaleString()}
          </CardDescription>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <pre className={`language-${language}`}>
              <code>{code}</code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full w-full rounded-md border p-4">
            <pre className={`language-${language}`}>
              <code>{code}</code>
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

const BrainLoader = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4"
      initial={{ scale: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 1.6,
        ease: "easeOut",
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          animate={{
            filter: [
              "hue-rotate(0deg) brightness(1)",
              "hue-rotate(180deg) brightness(1.2)",
              "hue-rotate(360deg) brightness(1)",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Brain className="w-32 h-32 text-primary" />
        </motion.div>
      </motion.div>
      <motion.p
        className="text-lg font-medium text-primary"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        iBrain is thinking...
      </motion.p>
    </motion.div>
  );
};

export function ChatStream({ conversationId }: ChatStreamProps) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [codeCards, setCodeCards] = useState<Array<CodeCardProps>>([]);
  const { speak } = useSpeech();
  const router = useRouter();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:7777");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        console.log("Received message:", event.data);
        const message: Message = JSON.parse(event.data);

        if (message.action === "background_update" && message.backgroundType === "code") {
          setCodeCards(prev => [...prev, {
            code: message.payload,
            language: message.metadata?.language || "typescript",
            title: message.metadata?.title || "Generated Code",
            timestamp: message.metadata?.timestamp || new Date().toISOString()
          }]);
        } else if (message.action === "talk") {
          setContent(message.payload);
          setIsStreaming(message.isStreaming || message.status === "streaming");

          if (message.isComplete) {
            console.log("Message complete:", message);
            setIsStreaming(false);
            setContent("");
            router.refresh();
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsStreaming(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsStreaming(false);
    };

    return () => {
      ws.close();
    };
  }, []);

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
                "hue-rotate(360deg) brightness(2) blur(4px)",
              ],
            }}
            transition={{
              exit: {
                duration: 3.2,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
            onAnimationStart={() => {
              if (!content) setIsExiting(true);
            }}
          >
            <BrainLoader />
          </motion.div>
        ) : (
          <>


            {/* Code Cards Section */}
            <div className="mt-8 space-y-4">
              <AnimatePresence>
                {codeCards.slice(1).map((card, index) => (
                  <motion.div
                    key={`${card.timestamp}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CodeCard {...card} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              key="content"
              className="flex flex-row gap-4 px-4 w-full md:w-[800px] md:px-0 first-of-type:pt-20"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1.4,
                ease: [0.2, 0.8, 0.2, 1],
                delay: isExiting ? 1.6 : 0,
              }}
            >
              {content && (
                <>
                  <div
                    className={`size-[36px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400 self-end ${isStreaming ? "animate-pulse" : ""
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
                </>
              )}
            </motion.div>

          </>
        )}
      </AnimatePresence>
    </div>
  );
}