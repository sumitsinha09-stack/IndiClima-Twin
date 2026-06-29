import React, { useState, useRef, useEffect } from "react";
import { useChatClimate } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send, BrainCircuit, Activity } from "lucide-react";

export function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "👋 Namaste! I am the IndiClima Twin Advisor. Ask me how the Digital Twin works, details about simulator algorithms, renewable energy, or disaster logistics!"
    }
  ]);

  const { mutate: sendMessage, isPending } = useChatClimate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    sendMessage(
      { data: { message: userMsg } },
      {
        onSuccess: (res) => {
          setHistory(prev => [...prev, { sender: "bot", text: res.reply }]);
        },
        onError: () => {
          setHistory(prev => [
            ...prev,
            { sender: "bot", text: "⚠️ Server response timed out. Please verify your backend connectivity." }
          ]);
        }
      }
    );
  };

  return (
    <div className="relative">
      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full shadow-lg border border-primary/40 bg-background/80 hover:bg-background/90 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-primary"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-primary" />
        ) : (
          <MessageSquare className="h-5 w-5 text-primary animate-pulse" />
        )}
      </Button>

      {/* Chat Window Panel */}
      {isOpen && (
        <Card className="absolute bottom-14 left-0 w-[340px] sm:w-[380px] h-[450px] shadow-2xl border border-primary/20 bg-background/95 backdrop-blur-xl flex flex-col z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">IndiClima Twin AI Advisor</CardTitle>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">ISRO-Link Active</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          {/* Messages Body */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === "user"
                    ? "self-end bg-primary/10 text-primary border border-primary/20"
                    : "self-start bg-secondary/5 text-foreground border border-secondary/20"
                }`}
              >
                {msg.text.split("\n").map((para, pIdx) => (
                  <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                    {/* Render bold headers nicely */}
                    {para.startsWith("👋") || para.startsWith("🌍") || para.startsWith("🖥️") || para.startsWith("🚨") || para.startsWith("📡") || para.startsWith("⚡") || para.startsWith("🌾")
                      ? para
                      : para}
                  </p>
                ))}
              </div>
            ))}
            {isPending && (
              <div className="self-start bg-secondary/5 text-muted-foreground border border-secondary/20 p-3 rounded-lg text-[10px] font-mono animate-pulse">
                🤖 Simulating response parameters...
              </div>
            )}
            <div ref={chatEndRef} />
          </CardContent>

          {/* Form Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-border/30 bg-background/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about data telemetry, simulator, etc."
              disabled={isPending}
              className="flex-1 bg-background/60 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono"
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 bg-primary hover:bg-primary/95 text-primary-foreground"
              disabled={isPending}
            >
              {isPending ? (
                <Activity className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
