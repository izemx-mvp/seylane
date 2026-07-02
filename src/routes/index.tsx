import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Sparkles, Users, Search, Send, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Seylane AI Backoffice" }] }),
  component: Dashboard,
});

function KPI({ label, value, delta, icon: Icon }: { label: string; value: string | number; delta?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="soft-shadow hover-lift hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium">{label}</div>
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-display font-semibold tracking-tight text-primary">{value}</div>
        {delta && (
          <div className="mt-2 text-xs text-success flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> {delta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const trend = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}`,
  contenus: 1 + Math.round(3 + 2 * Math.sin(i / 3) + (i % 5)),
  prospects: 1 + Math.round(2 + 1.5 * Math.cos(i / 4) + (i % 3)),
}));

function Dashboard() {
  const { state } = useStore();
  const publishedMonth = state.ideas.filter((i) => i.status === "published").length;
  const activeProspects = state.prospects.filter((p) => !["Perdu", "Client"].includes(p.status)).length;
  const totalCandidates = state.searches.reduce((a, s) => a + s.candidates.length, 0);
  const activeCampaigns = state.campaigns.filter((c) => c.status === "Active").length;

  const activity: Array<{ label: string; when: string; kind: string }> = [
    ...state.ideas.slice(0, 2).map((i) => ({ label: `Publication : ${i.title}`, when: new Date(i.suggestedAt).toLocaleString("fr-FR"), kind: "Contenu" })),
    ...state.prospects.slice(0, 2).map((p) => ({ label: `Nouveau prospect · ${p.firstName} ${p.lastName}`, when: new Date(p.receivedAt).toLocaleString("fr-FR"), kind: "Prospect" })),
    { label: `Campagne HuntTool relancée · ${state.campaigns[0]?.name ?? ""}`, when: new Date().toLocaleString("fr-FR"), kind: "HuntTool" },
  ].slice(0, 5);

  return (
    <AppShell title="Tableau de bord" subtitle="Vue d'ensemble — Seylane People Management">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Publications ce mois" value={publishedMonth} delta="+18%" icon={Sparkles} />
        <KPI label="Prospects actifs" value={activeProspects} delta="+12" icon={Users} />
        <KPI label="Candidats sourcés" value={totalCandidates} delta="Agent IA" icon={Search} />
        <KPI label="Campagnes en cours" value={activeCampaigns} delta="HuntTool" icon={Send} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 soft-shadow">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base tracking-tight">Activité — 30 derniers jours</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Contenus publiés et prospects reçus</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Temps réel</Badge>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 90% 40%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(217 90% 40%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(195 85% 50%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(195 85% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" vertical={false} />
                <XAxis dataKey="d" fontSize={10} stroke="hsl(220 10% 50%)" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} stroke="hsl(220 10% 50%)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 15% 90%)", fontSize: 12 }} />
                <Area type="monotone" dataKey="contenus" name="Contenus" stroke="hsl(217 90% 30%)" strokeWidth={2} fill="url(#c1)" />
                <Area type="monotone" dataKey="prospects" name="Prospects" stroke="hsl(195 85% 45%)" strokeWidth={2} fill="url(#c2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="text-base tracking-tight">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3 border-b border-border/50 last:border-0 pb-3 last:pb-0">
                <div className="w-1 rounded-full bg-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.kind} · {a.when}</div>
                </div>
              </div>
            ))}
            <div className="pt-2 flex gap-2">
              <Link to="/community-manager" className="flex-1"><Button variant="outline" size="sm" className="w-full">Community Manager</Button></Link>
              <Link to="/prospection" className="flex-1"><Button variant="outline" size="sm" className="w-full">Prospection</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}