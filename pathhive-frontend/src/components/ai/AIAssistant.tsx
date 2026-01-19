import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Minimize2,
  Maximize2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleResponses = [
  "That's a great question! Based on the current step you're working on, I'd recommend focusing on understanding the fundamentals first before moving to advanced concepts.",
  "I can help explain that concept! Think of it like building blocks - each piece needs to be in place before adding the next layer.",
  "Here's a quick summary: The main idea is to break down complex problems into smaller, manageable parts. This makes learning more effective and less overwhelming.",
  "That's a common challenge many learners face. Try practicing with smaller examples first, then gradually increase complexity.",
];

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI learning assistant. How can I help you today? I can answer questions, summarize content, or help you understand concepts better.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-card border rounded-2xl shadow-elevated overflow-hidden transition-all duration-300",
        isMinimized ? "w-64 h-14" : "w-96 h-[500px] max-h-[80vh]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-hero">
        <div className="flex items-center gap-2 text-primary-foreground">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold">AI Assistant</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-[calc(100%-130px)] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary"}>
                      {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm",
                      message.role === "assistant"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export function AIAssistantTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="hero"
      size="icon"
      className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-elevated z-40"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}
