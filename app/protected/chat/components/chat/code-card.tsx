import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeCardProps {
  code: string;
  language: string;
  title: string;
  timestamp: string;
}

export function CodeCard({ code, language, title, timestamp }: CodeCardProps) {
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
            <pre className="language-{language}">
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
            <pre className="language-{language}">
              <code>{code}</code>
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}