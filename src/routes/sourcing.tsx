import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Sparkles, RefreshCw, Send, UserPlus, ArrowLeft, Building2, Briefcase, MapPin } from "lucide-react";
import type { Candidate, SourcingSearch, Campaign } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sourcing")({
  head: () => ({ meta: [{ title: "Agent IA de Sourcing — Seylane" }] }),
  component: SourcingPage,
});

function SourcingPage() {
  const { state, set } = useStore();
  const [openSearch, setOpenSearch] = useState<SourcingSearch | null>(null);
  const [detail, setDetail] = useState<Candidate | null>(null);
  const [showNew, setShowNew] = useState(false);

  const pushToHuntTool = (s: SourcingSearch, c: Candidate) => {
    // Auto-create/append a HuntTool campaign for this specific poste/client
    const existing = state.campaigns.find((cm) => cm.linkedPoste === s.poste && cm.linkedClient === s.client);
    const contact = {
      id: `auto-${Date.now()}`, name: c.name,
      channel: "LinkedIn" as const, sendStatus: "Envoyé" as const,
      classification: "En attente" as const, lastAt: new Date().toISOString(),
    };
    if (existing) {
      const upd = { ...existing, contacts: [contact, ...existing.contacts] };
      set("campaigns", state.campaigns.map((cm) => cm.id === existing.id ? upd : cm));
    } else {
      const camp: Campaign = {
        id: `camp-${Date.now()}`, name: `${s.brand} — ${s.poste}`, target: `Vivier — ${s.poste}`,
        channels: ["LinkedIn", "Email"], message: `Bonjour {prenom}, chez Seylane ${s.brand} nous accompagnons ${s.client} sur le poste ${s.poste}…`,
        status: "Active", maxRelances: 3, window: "9h-18h · Lun–Ven",
        createdAt: new Date().toISOString(), origin: "auto",
        linkedPoste: s.poste, linkedClient: s.client, contacts: [contact],
      };
      set("campaigns", [camp, ...state.campaigns]);
    }
    toast.success(`${c.name} envoyé vers HuntTool CRM`);
  };

  if (openSearch) return (
    <SearchDetail
      search={openSearch}
      onBack={() => setOpenSearch(null)}
      onOpenCandidate={setDetail}
      onPushHunt={(c) => pushToHuntTool(openSearch, c)}
      candidateSheet={<CandidateSheet detail={detail} onClose={() => setDetail(null)} onPush={(c) => pushToHuntTool(openSearch, c)} />}
    />
  );

  return (
    <AppShell title="Agent IA de Sourcing" subtitle="Une recherche = un poste pour un client. L'IA identifie et score les candidats."
      actions={<NewSearchDialog open={showNew} setOpen={setShowNew} />}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.searches.map((s) => {
          const avg = Math.round(s.candidates.reduce((a, c) => a + c.matchScore, 0) / Math.max(1, s.candidates.length));
          return (
            <Card key={s.id} onClick={() => setOpenSearch(s)}
              className="soft-shadow hover-lift hover:-translate-y-1 hover:shadow-xl cursor-pointer transition-all">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Badge className="gold-gradient text-primary">{s.brand}</Badge>
                  <Badge variant="outline">{s.status}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(s.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <h3 className="font-display text-lg mt-3 tracking-tight">{s.poste}</h3>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" /> {s.client}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {s.seniority}</span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t pt-3">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Candidats</div>
                    <div className="text-2xl font-display font-semibold text-primary">{s.candidates.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Score moyen</div>
                    <div className={cn("text-2xl font-display font-semibold", avg >= 75 ? "text-success" : avg >= 55 ? "text-gold" : "text-muted-foreground")}>{avg}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

/* -------- Search detail -------- */
function SearchDetail({ search, onBack, onOpenCandidate, onPushHunt, candidateSheet }: {
  search: SourcingSearch; onBack: () => void; onOpenCandidate: (c: Candidate) => void; onPushHunt: (c: Candidate) => void; candidateSheet: React.ReactNode;
}) {
  return (
    <AppShell title={search.poste} subtitle={`Recherche pour ${search.client}`}
      actions={<Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-3 w-3 mr-1" /> Retour</Button>}>
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4 soft-shadow h-fit sticky top-24">
          <CardContent className="p-5 space-y-3 text-sm">
            <Badge className="gold-gradient text-primary">{search.brand}</Badge>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Client</div>
              <div className="font-medium flex items-center gap-2"><Building2 className="h-4 w-4" /> {search.client}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Poste</div>
              <div className="font-medium">{search.poste}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Brief</div>
              <p className="text-xs mt-1 text-muted-foreground">{search.jobDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><div className="text-muted-foreground">Localisation</div><div className="font-medium">{search.location}</div></div>
              <div><div className="text-muted-foreground">Séniorité</div><div className="font-medium">{search.seniority}</div></div>
              <div><div className="text-muted-foreground">Contrat</div><div className="font-medium">{search.contract}</div></div>
              <div><div className="text-muted-foreground">Salaire</div><div className="font-medium">{search.salary}</div></div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Compétences clés</div>
              <div className="flex flex-wrap gap-1">{search.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Langues</div>
              <div className="flex flex-wrap gap-1">{search.languages.map((l) => <Badge key={l} variant="outline">{l}</Badge>)}</div>
            </div>
            <div className="pt-2 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success("Recherche relancée")}><RefreshCw className="h-3 w-3 mr-1" /> Relancer</Button>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg tracking-tight">Candidats identifiés · {search.candidates.length}</h2>
          </div>
          {search.candidates.sort((a, b) => b.matchScore - a.matchScore).map((c) => (
            <Card key={c.id} className="soft-shadow hover-lift hover:shadow-lg cursor-pointer" onClick={() => onOpenCandidate(c)}>
              <CardContent className="p-4 flex items-center gap-4">
                <img src={c.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.currentRole} · {c.currentCompany}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{c.location} · {c.languages.join(" / ")}</div>
                </div>
                <div className="text-center min-w-[64px]">
                  <div className={cn("text-lg font-semibold", c.matchScore >= 80 ? "text-success" : c.matchScore >= 60 ? "text-gold" : "text-muted-foreground")}>{c.matchScore}%</div>
                  <div className="text-[10px] uppercase text-muted-foreground">match</div>
                </div>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onPushHunt(c); }}><Send className="h-3 w-3 mr-1" /> HuntTool</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {candidateSheet}
    </AppShell>
  );
}

function CandidateSheet({ detail, onClose, onPush }: { detail: Candidate | null; onClose: () => void; onPush: (c: Candidate) => void }) {
  return (
    <Sheet open={!!detail} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[560px] sm:max-w-none overflow-y-auto">
        {detail && (
          <>
            <SheetHeader><SheetTitle className="font-display tracking-tight">Profil candidat</SheetTitle></SheetHeader>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-4">
                <img src={detail.avatar} className="w-16 h-16 rounded-full object-cover" alt="" />
                <div>
                  <div className="font-display text-lg tracking-tight">{detail.name}</div>
                  <div className="text-sm text-muted-foreground">{detail.currentRole} · {detail.currentCompany}</div>
                  <div className="text-xs text-muted-foreground">{detail.location}</div>
                </div>
                <div className="ml-auto text-center">
                  <div className="text-3xl font-display font-semibold text-gold">{detail.matchScore}%</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Match IA</div>
                </div>
              </div>
              <div className="border rounded-lg p-3 bg-muted/40">
                <div className="text-xs font-semibold mb-2">Décomposition du score</div>
                {detail.breakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-xs mb-1">
                    <div className="w-40 text-muted-foreground">{b.label}</div>
                    <div className="flex-1 h-1.5 bg-background rounded"><div className="h-1.5 gold-gradient rounded" style={{ width: `${(b.value / 35) * 100}%` }} /></div>
                    <div className="w-8 text-right font-medium">{b.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm"><b>Parcours :</b> {detail.experience}</div>
              <div className="text-sm"><b>Compétences :</b><div className="flex flex-wrap gap-1 mt-1">{detail.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{detail.availability}</Badge>
                <Badge variant="outline">Source : {detail.source}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => toast.success("Ajouté au vivier")}><UserPlus className="h-4 w-4 mr-2" /> Vivier</Button>
                <Button onClick={() => { onPush(detail); onClose(); }}><Send className="h-4 w-4 mr-2" /> Envoyer HuntTool</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------- New search dialog -------- */
function NewSearchDialog({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { state, set } = useStore();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState("");
  const [poste, setPoste] = useState("");
  const [desc, setDesc] = useState("");
  const [brand, setBrand] = useState<"Executive" | "Staffing">("Executive");
  const [location, setLocation] = useState("Casablanca");

  const launch = () => {
    if (!client.trim() || !poste.trim()) { toast.error("Client et poste requis"); return; }
    setLoading(true);
    setTimeout(() => {
      const s: SourcingSearch = {
        id: `s-${Date.now()}`, title: `${poste} — ${location}`,
        client, poste, jobDescription: desc || "Brief à compléter.",
        brand, sector: "Industries", seniority: "Confirmé",
        location, skills: [], languages: ["Français"], contract: "CDI",
        salary: "Selon profil", sources: { linkedin: true, web: true, network: true },
        createdAt: new Date().toISOString(), status: "En cours",
        candidates: state.searches[0].candidates.slice(0, 8).map((c, i) => ({ ...c, id: `c-new-${Date.now()}-${i}` })),
      };
      set("searches", [s, ...state.searches]);
      setLoading(false); setOpen(false);
      setClient(""); setPoste(""); setDesc("");
      toast.success("Recherche lancée · 8 candidats trouvés");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Sparkles className="h-4 w-4" /> Nouvelle recherche</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Nouvelle recherche</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Client</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Ex : Atlas Industries" /></div>
          <div><Label>Poste</Label><Input value={poste} onChange={(e) => setPoste(e.target.value)} placeholder="Ex : Directeur Industriel" /></div>
          <div><Label>Marque</Label>
            <Select value={brand} onValueChange={(v) => setBrand(v as typeof brand)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Executive", "Staffing"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Localisation</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
          <div className="col-span-2"><Label>Brief de la mission</Label><Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Contexte du poste, enjeux, culture d'entreprise…" /></div>
          <div className="col-span-2"><Label>Sources</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["LinkedIn", "Web", "Réseau Seylane"].map((x) => (
                <div key={x} className="flex items-center justify-between border rounded px-3 py-2 text-sm"><span>{x}</span><Switch defaultChecked /></div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={launch} disabled={loading}>
            {loading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Recherche IA…</> : <><Search className="h-4 w-4 mr-2" /> Lancer</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}