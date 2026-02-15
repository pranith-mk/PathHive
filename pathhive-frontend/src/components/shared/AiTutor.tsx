import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import api from "@/lib/api"; 

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AiTutor({ pathId }: { pathId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your AI tutor for this path. Stuck on a step? Ask me anything!" }
  ]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/paths/ai-chat/', {
        message: userMsg,
        path_id: pathId
      });

      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating Toggle Button */}
      {/* Hides on mobile when chat is open to avoid overlapping the bottom sheet */}
      <Button
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-40 p-0 transition-transform duration-200 ${
          isOpen ? 'scale-0 sm:scale-100' : 'scale-100'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <MessageCircle className="h-8 w-8" />}
      </Button>

      {/* 2. Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-0 right-0 w-full h-[85dvh] rounded-t-xl rounded-b-none sm:bottom-24 sm:right-6 sm:w-80 md:w-[400px] sm:h-[500px] sm:rounded-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-10 fade-in border-t sm:border">
          
          <CardHeader className="bg-primary text-primary-foreground py-3 rounded-t-xl flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Tutor
            </CardTitle>
            {/* 3. Mobile Close Button (Hidden on desktop) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 sm:hidden" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border shadow-sm text-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border p-3 rounded-lg shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </CardContent>

          {/* 4. Input Area */}
          <div className="p-3 border-t bg-white sm:rounded-b-xl pb-6 sm:pb-3">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}