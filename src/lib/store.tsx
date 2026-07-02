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
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") return seedData();
    try {
      const raw = localStorage.getItem("seylane-state");
      if (raw) return { ...seedData(), ...JSON.parse(raw) };
    } catch {}
    return seedData();
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("seylane-theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("seylane-state", JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("seylane-theme", theme);
  }, [theme]);

  const set: Ctx["set"] = (k, v) => {
    setState((prev) => ({
      ...prev,
      [k]: typeof v === "function" ? (v as (p: AppState[typeof k]) => AppState[typeof k])(prev[k]) : v,
    }));
  };

  return (
    <StoreCtx.Provider value={{ state, set, theme, toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}
