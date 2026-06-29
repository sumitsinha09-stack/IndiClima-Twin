import React from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Map as MapIcon,
  BrainCircuit,
  AlertTriangle,
  Sprout,
  Droplets,
  LineChart,
  SlidersHorizontal,
  Settings,
  Zap,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import { useRefreshManager } from "@/hooks/use-refresh-manager";
import { RefreshTimer } from "@/components/refresh-timer";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { GlobalChatbot } from "@/components/global-chatbot";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Interactive Map", url: "/map", icon: MapIcon },
  { title: "Climate Explorer", url: "/climate-explorer", icon: Compass },
  { title: "AI Predictions", url: "/ai-predictions", icon: BrainCircuit },
  { title: "Disaster Alerts", url: "/disasters", icon: AlertTriangle },
  { title: "Agriculture", url: "/agriculture", icon: Sprout },
  { title: "Water Resources", url: "/water", icon: Droplets },
  { title: "Renewable Energy", url: "/energy", icon: Zap },
  { title: "Climate Analytics", url: "/analytics", icon: LineChart },
  { title: "Scenario Simulator", url: "/simulator", icon: SlidersHorizontal },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const refreshState = useRefreshManager();
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
        <Sidebar variant="sidebar" className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
            <div className="flex items-center gap-2 font-display font-bold text-lg tracking-wide text-primary">
              <BrainCircuit className="h-6 w-6" />
              <span>IndiClima Twin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-4 mb-2">
                Modules
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        tooltip={item.title}
                        className="transition-all duration-200"
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-4 shrink-0 z-10 sticky top-0">
            <SidebarTrigger className="mr-4" />

            {/* Left status indicators */}
            <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                SYSTEM LIVE
              </div>
              <div className="hidden sm:block h-4 w-px bg-border/50" />
              <div className="hidden sm:block">ISRO-04 LINK ACTIVE</div>
            </div>

            <div className="flex-1" />

            {/* Refresh timer & Theme Toggle */}
            <div className="flex items-center gap-3">
              <RefreshTimer {...refreshState} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="h-[1.1rem] w-[1.1rem] text-amber-400" />
                ) : (
                  <Moon className="h-[1.1rem] w-[1.1rem] text-primary" />
                )}
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
            <div className="mx-auto max-w-7xl h-full">
              {children}
            </div>
          </main>

          {/* Floating AI Chatbot at bottom left */}
          <div className="absolute bottom-6 left-6 z-50">
            <GlobalChatbot />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
