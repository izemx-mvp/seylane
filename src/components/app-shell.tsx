import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard, Sparkles, Users, Search, Send, BookOpen, Sun, Moon, Bell, ChevronDown, Check, ShieldCheck,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { InterfaceKey } from "@/lib/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SEYLANE_LOGO = "https://www.seylane.com/_next/image?url=%2FLOGO%2520SEYLANE%2520-%2520BLANC_.png&w=384&q=75";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; key?: InterfaceKey }[] = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/users", label: "Gestion des utilisateurs", icon: ShieldCheck, key: "users" },
  { to: "/community-manager", label: "AI Community Manager", icon: Sparkles, key: "community-manager" },
  { to: "/prospection", label: "Agent IA Prospection", icon: Users, key: "prospection" },
  { to: "/sourcing", label: "Agent IA de Sourcing", icon: Search, key: "sourcing" },
  { to: "/hunttool", label: "Agent IA Relance HuntTool", icon: Send, key: "hunttool" },
  { to: "/knowledge", label: "Base de connaissances", icon: BookOpen, key: "knowledge" },
];

function NotificationsMenu() {
  const { state, set } = useStore();
  const notifs = state.notifications ?? [];
  const unread = notifs.filter((n) => !n.read).length;
  const markAll = () => set("notifications", notifs.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => set("notifications", notifs.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-gold text-primary text-[9px] font-bold flex items-center justify-center animate-pulse">{unread}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-semibold">Notifications</div>
          {unread > 0 && <button onClick={markAll} className="text-xs text-primary hover:underline flex items-center gap-1"><Check className="h-3 w-3" /> Tout marquer lu</button>}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {notifs.length === 0 && <div className="px-4 py-10 text-center text-xs text-muted-foreground">Aucune notification.</div>}
          {notifs.map((n) => (
            <button key={n.id} onClick={() => markOne(n.id)}
              className={cn("w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors flex gap-3", !n.read && "bg-primary/5")}>
              <span className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", n.read ? "bg-transparent" : "bg-gold")} />
              <span className="min-w-0">
                <span className="block text-xs font-medium">{n.title}</span>
                <span className="block text-[11px] text-muted-foreground mt-0.5">{n.body}</span>
                <span className="block text-[10px] text-muted-foreground mt-1">{new Date(n.at).toLocaleString("fr-FR")}</span>
              </span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggleTheme, currentUser, can } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNav = nav.filter((item) => !item.key || can(item.key, "read"));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-screen flex bg-background overflow-hidden">
        <aside className={cn(
          "shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border relative overflow-hidden h-screen sticky top-0 transition-[width] duration-300 ease-out",
          collapsed ? "w-20" : "w-72",
        )}>
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{
            backgroundImage: "radial-gradient(30rem 30rem at 50% -6%, color-mix(in oklab, var(--color-gold) 30%, transparent), transparent 60%)",
          }} />
          <div className={cn("relative border-b border-sidebar-border transition-all", collapsed ? "px-2 pt-5 pb-4" : "px-6 pt-8 pb-6")}>
            <img
              src={SEYLANE_LOGO}
              alt="Seylane"
              className={cn("w-auto object-contain select-none drop-shadow-lg transition-all mx-auto", collapsed ? "h-10" : "h-24")}
              draggable={false}
            />
            {!collapsed && <div className="text-[10px] uppercase tracking-[0.32em] text-sidebar-foreground/70 mt-4">AI Backoffice</div>}
          </div>

          <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto scroll-fade">
            {visibleNav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              const linkEl = (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner border-l-2 border-gold pl-[10px]"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : linkEl;
            })}
          </nav>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="relative mx-3 mb-2 mt-1 flex items-center justify-center gap-2 rounded-lg border border-sidebar-border/50 py-2 text-[11px] uppercase tracking-wider text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
            title={collapsed ? "Agrandir" : "Réduire"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Réduire</>}
          </button>

          <div className={cn("relative border-t border-sidebar-border text-xs text-sidebar-foreground/70", collapsed ? "p-2" : "p-4")}>
            <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
              <div className="w-9 h-9 rounded-full gold-gradient text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sidebar-foreground truncate">{currentUser.name}</div>
                    <div className="opacity-70 capitalize">{currentUser.role} · Seylane</div>
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-8 gap-4 shrink-0 z-20">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-display font-semibold truncate tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Thème">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <NotificationsMenu />
            </div>
          </header>
          <main className="relative flex-1 overflow-y-auto p-8 animate-in fade-in duration-300 scroll-fade">
            <div className="app-aurora" aria-hidden />
            <div className="app-grid" aria-hidden />
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
