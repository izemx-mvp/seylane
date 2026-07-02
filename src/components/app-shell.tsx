import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  LayoutDashboard, Sparkles, Users, Search, Send, BookOpen, Sun, Moon, Bell, ChevronDown,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SEYLANE_LOGO = "https://www.seylane.com/_next/image?url=%2FLOGO%2520SEYLANE%2520-%2520BLANC_.png&w=384&q=75";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/community-manager", label: "AI Community Manager", icon: Sparkles },
  { to: "/prospection", label: "Prospection", icon: Users },
  { to: "/sourcing", label: "Agent IA de Sourcing", icon: Search },
  { to: "/hunttool", label: "HuntTool CRM", icon: Send },
  { to: "/knowledge", label: "Base de Connaissances", icon: BookOpen },
];

export function AppShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggleTheme } = useStore();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="px-6 pt-7 pb-6 border-b border-sidebar-border">
          <img
            src={SEYLANE_LOGO}
            alt="Seylane"
            className="h-11 w-auto object-contain select-none"
            draggable={false}
          />
          <div className="text-[10px] uppercase tracking-[0.28em] text-sidebar-foreground/60 mt-3">AI Backoffice</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner border-l-2 border-gold pl-[10px]"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold text-primary flex items-center justify-center text-xs font-semibold">NZ</div>
            <div className="flex-1">
              <div className="font-medium text-sidebar-foreground">Nabila Zerouali</div>
              <div className="opacity-70">Admin · Seylane</div>
            </div>
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-8 gap-4 sticky top-0 z-20">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-semibold truncate tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Thème">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 animate-in fade-in duration-300">{children}</main>
      </div>
    </div>
  );
}
