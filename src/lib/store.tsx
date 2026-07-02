import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { seedData, type AppState } from "./mock-data";

type Ctx = {
  state: AppState;
  set: <K extends keyof AppState>(k: K, v: AppState[K] | ((prev: AppState[K]) => AppState[K])) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Always seed deterministically for SSR + first client render (avoids hydration
  // mismatch from time-based mock data). localStorage is merged in after mount.
  const [state, setState] = useState<AppState>(() => seedData());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("seylane-state");
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
    const t = (localStorage.getItem("seylane-theme") as "light" | "dark") || "light";
    setTheme(t);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("seylane-state", JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    if (hydrated) localStorage.setItem("seylane-theme", theme);
  }, [theme, hydrated]);

  const set: Ctx["set"] = (k, v) => {
    setState((prev) => ({
      ...prev,
      [k]: typeof v === "function" ? (v as (p: AppState[typeof k]) => AppState[typeof k])(prev[k]) : v,
    }));
  };

  return (
    <StoreCtx.Provider value={{ state, set, theme, toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}>
      {hydrated ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
          <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
        </div>
      )}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}
