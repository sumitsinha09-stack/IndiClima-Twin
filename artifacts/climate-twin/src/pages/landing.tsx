import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Activity, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden relative flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15)_0,transparent_50%)]"></div>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(hsl(var(--primary)/0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <header className="relative z-10 p-6 flex items-center justify-between border-b border-border/20 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-2 font-display font-bold text-xl tracking-wider text-primary">
          <BrainCircuit className="h-6 w-6" />
          <span>IndiClima Twin</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sensors Online
          </span>
          <span className="hidden sm:inline">Gov-In-Sec-Protocol: Active</span>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Mock Globe / Radar */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-12">
            <div className="absolute inset-0 rounded-full border border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.2)] animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-2 rounded-full border border-dashed border-secondary/40 animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-32 h-32 text-primary opacity-80" strokeWidth={1} />
            </div>
            {/* Blips */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-secondary rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-destructive rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "1.2s" }}></div>
          </div>

          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md">
            Operational Intelligence
          </div>
          
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tighter mb-6 neon-text">
            IndiClima Twin <span className="text-foreground">India</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mb-10 font-light leading-relaxed">
            AI-Powered Digital Twin of India's Climate. 
            Monitor, predict, and simulate mission-critical environmental scenarios with unprecedented precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide text-lg neon-border">
                Launch Dashboard
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="h-14 px-8 border-primary/50 text-primary hover:bg-primary/10 font-bold tracking-wide text-lg">
                <Activity className="mr-2 h-5 w-5" />
                View Live Climate
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 p-6 border-t border-border/20 text-center text-sm font-mono text-muted-foreground uppercase tracking-widest">
        Classified Environmental Data Platform &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}