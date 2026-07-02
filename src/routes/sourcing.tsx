import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PaginationBar } from "@/components/pagination-bar";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search, Sparkles, RefreshCw, Send, UserPlus, ArrowLeft, Building2, Briefcase, MapPin, Globe2,
  X, Plus, Mail, Phone, Linkedin, GraduationCap, Award, Clock, Wallet, TrendingUp, Target,
} from "lucide-react";
import type { Candidate, SourcingSearch, Campaign, ScoringCriterion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sourcing")({
  head: () => ({ meta: [{ title: "Agent IA de Sourcing — Seylane" }] }),
  component: SourcingPage,
});

function scoreColor(v: number) {
  return v >= 80 ? "text-success" : v >= 60 ? "text-gold" : "text-muted-foreground";
}

function SourcingPage() {
  const { state, set } = useStore();
  const [openSearch, setOpenSearch] = useState<SourcingSearch | null>(null);
  const [detail, setDetail] = useState<Candidate | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fBrand, setFBrand] = useState("all");

  // keep the open search in sync with store updates
  const liveSearch = openSearch ? state.searches.find((s) => s.id === openSearch.id) ?? null : null;

  const filtered = useMemo(() => {
    return state.searches.filter((s) => {
      if (fStatus !== "all" && s.status !== fStatus) return false;
      if (fBrand !== "all" && s.brand !== fBrand) return false;
      if (q && !`${s.poste} ${s.client} ${s.location} ${s.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.searches, q, fStatus, fBrand]);

  const pushToHuntTool = (s: SourcingSearch, c: Candidate) => {
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
        status: "Active", maxRelances: state.huntConfig.maxRelances, window: "9h-18h · Lun–Ven",
        createdAt: new Date().toISOString(), origin: "auto",
        linkedPoste: s.poste, linkedClient: s.client, contacts: [contact],
      };
      set("campaigns", [camp, ...state.campaigns]);
    }
    toast.success(`${c.name} envoyé vers HuntTool CRM`);
  };

  if (liveSearch) return (
    <SearchDetail
      search={liveSearch}
      onBack={() => setOpenSearch(null)}
      onOpenCandidate={setDetail}
      onPushHunt={(c) => pushToHuntTool(liveSearch, c)}
      candidateSheet={<CandidateSheet detail={detail} search={liveSearch} onClose={() => setDetail(null)} onPush={(c) => pushToHuntTool(liveSearch, c)} />}
    />
  );

  return (
    <AppShell title="Agent IA de Sourcing" subtitle="Une recherche = un poste pour un client. L'IA identifie et score les candidats."
      actions={<NewSearchDialog open={showNew} setOpen={setShowNew} />}>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un poste, client, ville, compétence…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes marques</SelectItem>{["Executive", "Staffing"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous statuts</SelectItem>{["En cours", "Short-list", "Placé", "Clôturée"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const avg = Math.round(s.candidates.reduce((a, c) => a + c.matchScore, 0) / Math.max(1, s.candidates.length));
          return (
            <Card key={s.id} onClick={() => setOpenSearch(s)}
              className="soft-shadow hover-lift hover:-translate-y-1 hover:shadow-xl cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-2">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Badge className="gold-gradient text-primary">{s.brand}</Badge>
                  <Badge variant="outline">{s.status}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(s.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <h3 className="font-display text-lg mt-3 tracking-tight">{s.poste}</h3>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" /> {s.client}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> {s.countries.join(", ")}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.cities.join(", ")}</span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t pt-3">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Candidats</div>
                    <div className="text-2xl font-display font-semibold text-primary">{s.candidates.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Score moyen</div>
                    <div className={cn("text-2xl font-display font-semibold", scoreColor(avg))}>{avg}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground text-sm py-16 border rounded-xl bg-muted/20">
            Aucune recherche ne correspond. Lancez une nouvelle recherche.
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* -------- Search detail -------- */
function SearchDetail({ search, onBack, onOpenCandidate, onPushHunt, candidateSheet }: {
  search: SourcingSearch; onBack: () => void; onOpenCandidate: (c: Candidate) => void; onPushHunt: (c: Candidate) => void; candidateSheet: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<"score" | "exp">("score");
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10);

  const list = useMemo(() => {
    return [...search.candidates]
      .filter((c) => c.matchScore >= minScore)
      .filter((c) => !q || `${c.name} ${c.currentRole} ${c.currentCompany} ${c.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (sort === "score" ? b.matchScore - a.matchScore : b.yearsExperience - a.yearsExperience));
  }, [search.candidates, q, minScore, sort]);

  return (
    <AppShell title={search.poste} subtitle={`Recherche pour ${search.client}`}
      actions={<Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-3 w-3 mr-1" /> Retour</Button>}>
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4 soft-shadow h-fit lg:sticky lg:top-24">
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
              <div><div className="text-muted-foreground">Pays</div><div className="font-medium">{search.countries.join(", ")}</div></div>
              <div><div className="text-muted-foreground">Villes</div><div className="font-medium">{search.cities.join(", ")}</div></div>
              <div><div className="text-muted-foreground">Séniorité</div><div className="font-medium">{search.seniority}</div></div>
              <div><div className="text-muted-foreground">Contrat</div><div className="font-medium">{search.contract}</div></div>
              <div className="col-span-2"><div className="text-muted-foreground">Rémunération</div><div className="font-medium">{search.salary}</div></div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Compétences requises</div>
              <div className="flex flex-wrap gap-1">{search.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Grille de scoring</div>
              <div className="space-y-1.5">
                {search.scoring.map((cr) => (
                  <div key={cr.id} className="flex items-center gap-2 text-xs">
                    <div className="flex-1">{cr.label}</div>
                    <div className="w-24 h-1.5 bg-muted rounded overflow-hidden"><div className="h-full gold-gradient" style={{ width: `${cr.weight}%` }} /></div>
                    <div className="w-9 text-right font-medium">{cr.weight}%</div>
                  </div>
                ))}
                <div className="flex justify-between text-[11px] pt-1 border-t text-muted-foreground">
                  <span>Total pondération</span><span className="font-semibold text-foreground">{search.scoring.reduce((a, c) => a + c.weight, 0)}%</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success("Recherche relancée · nouveaux profils en cours")}><RefreshCw className="h-3 w-3 mr-1" /> Relancer l'IA</Button>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filtrer les candidats…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as "score" | "exp")}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="score">Tri : score IA</SelectItem><SelectItem value="exp">Tri : expérience</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
            <span className="whitespace-nowrap">Score min. {minScore}%</span>
            <Slider value={[minScore]} onValueChange={(v) => setMinScore(v[0])} max={100} step={5} className="max-w-[220px]" />
            <span className="ml-auto font-medium text-foreground">{list.length} candidat(s)</span>
          </div>

          {list.slice((page - 1) * pageSize, page * pageSize).map((c) => (
            <Card key={c.id} className="soft-shadow hover-lift hover:shadow-lg cursor-pointer transition-all" onClick={() => onOpenCandidate(c)}>
              <CardContent className="p-4 flex items-center gap-4">
                <img src={c.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-border" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.currentRole} · {c.currentCompany}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}, {c.country}</span>
                    <span>· {c.yearsExperience} ans</span>
                  </div>
                </div>
                <div className="text-center min-w-[64px]">
                  <div className={cn("text-lg font-semibold", scoreColor(c.matchScore))}>{c.matchScore}%</div>
                  <div className="text-[10px] uppercase text-muted-foreground">match IA</div>
                </div>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onPushHunt(c); }}><Send className="h-3 w-3 mr-1" /> HuntTool</Button>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && <div className="text-center text-muted-foreground text-sm py-12 border rounded-xl bg-muted/20">Aucun candidat à ce niveau de filtre.</div>}
          <PaginationBar page={page} pageCount={Math.max(1, Math.ceil(list.length / pageSize))} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={list.length} />

        </div>
      </div>
      {candidateSheet}
    </AppShell>
  );
}

function CandidateSheet({ detail, search, onClose, onPush }: { detail: Candidate | null; search: SourcingSearch; onClose: () => void; onPush: (c: Candidate) => void }) {
  return (
    <Sheet open={!!detail} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:w-[92vw] sm:max-w-[1100px] overflow-y-auto">
        {detail && (
          <>
            <SheetHeader><SheetTitle className="font-display tracking-tight">Profil candidat détaillé</SheetTitle></SheetHeader>
            <div className="mt-5 space-y-5">
              <div className="flex items-center gap-4">
                <img src={detail.avatar} className="w-20 h-20 rounded-full object-cover ring-2 ring-gold/40" alt="" />
                <div className="min-w-0">
                  <div className="font-display text-xl tracking-tight">{detail.name}</div>
                  <div className="text-sm text-muted-foreground">{detail.currentRole}</div>
                  <div className="text-xs text-muted-foreground">{detail.currentCompany} · {detail.location}, {detail.country}</div>
                </div>
                <div className="ml-auto text-center shrink-0">
                  <div className={cn("text-3xl font-display font-semibold", scoreColor(detail.matchScore))}>{detail.matchScore}%</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Match IA</div>
                </div>
              </div>

              <div className="rounded-lg border p-3 bg-muted/30 text-sm">{detail.summary}</div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 border rounded-lg p-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {detail.email}</div>
                <div className="flex items-center gap-2 border rounded-lg p-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {detail.phone}</div>
                <div className="flex items-center gap-2 border rounded-lg p-2"><Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" /> {detail.linkedinUrl}</div>
                <div className="flex items-center gap-2 border rounded-lg p-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Préavis : {detail.noticePeriod}</div>
                <div className="flex items-center gap-2 border rounded-lg p-2"><Wallet className="h-3.5 w-3.5 text-muted-foreground" /> Actuel : {detail.currentSalary}</div>
                <div className="flex items-center gap-2 border rounded-lg p-2"><TrendingUp className="h-3.5 w-3.5 text-muted-foreground" /> Cible : {detail.expectedSalary}</div>
              </div>

              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-gold" /> Décomposition du score (pondérée)</div>
                {detail.breakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-xs mb-1.5">
                    <div className="w-44 text-muted-foreground truncate">{b.label} <span className="opacity-60">({b.weight}%)</span></div>
                    <div className="flex-1 h-2 bg-background rounded overflow-hidden"><div className="h-full gold-gradient rounded" style={{ width: `${(b.value / Math.max(1, b.weight)) * 100}%` }} /></div>
                    <div className="w-12 text-right font-medium">{b.value}/{b.weight}</div>
                  </div>
                ))}
                <div className="flex justify-between text-[11px] pt-1.5 mt-1 border-t">
                  <span className="text-muted-foreground">Score total pondéré</span>
                  <span className="font-semibold">{detail.matchScore}/100</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold mb-2">Parcours professionnel</div>
                <div className="space-y-3 border-l-2 border-border pl-4">
                  {detail.timeline.map((t, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gold ring-2 ring-background" />
                      <div className="text-sm font-medium">{t.role}</div>
                      <div className="text-xs text-muted-foreground">{t.company} · {t.period}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Formation</div>
                  <ul className="text-xs text-muted-foreground space-y-1">{detail.education.map((e) => <li key={e}>• {e}</li>)}</ul>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Certifications</div>
                  <ul className="text-xs text-muted-foreground space-y-1">{detail.certifications.map((e) => <li key={e}>• {e}</li>)}</ul>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold mb-1.5">Compétences</div>
                <div className="flex flex-wrap gap-1">{detail.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5">Langues</div>
                <div className="flex flex-wrap gap-1">{detail.languages.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{detail.availability}</Badge>
                <Badge variant="outline">Source : {detail.source}</Badge>
                <Badge variant="outline">Poste ciblé : {search.poste}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t sticky bottom-0 bg-background py-3">
                <Button variant="outline" size="sm" onClick={() => toast.success("Ajouté au vivier qualifié")}><UserPlus className="h-4 w-4 mr-1" /> Vivier</Button>
                <Button variant="outline" size="sm" onClick={() => toast("Candidat écarté", { description: "Retiré de la short-list." })}><X className="h-4 w-4 mr-1" /> Écarter</Button>
                <Button size="sm" onClick={() => { onPush(detail); onClose(); }}><Send className="h-4 w-4 mr-1" /> HuntTool</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------- New search dialog -------- */
const COUNTRY_OPTIONS = ["Maroc", "France", "Tunisie", "Algérie", "Sénégal", "Côte d'Ivoire", "Émirats Arabes Unis", "Canada", "Espagne"];
const CITY_OPTIONS = ["Casablanca", "Rabat", "Tanger", "Kénitra", "Marrakech", "Paris", "Lyon", "Dubaï", "Tunis", "Dakar", "Abidjan", "Montréal"];

function TokenField({ label, placeholder, tokens, setTokens, suggestions }: {
  label: string; placeholder: string; tokens: string[]; setTokens: (t: string[]) => void; suggestions?: string[];
}) {
  const [val, setVal] = useState("");
  const add = (t: string) => { const v = t.trim(); if (!v || tokens.includes(v)) return; setTokens([...tokens, v]); setVal(""); };
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1 mb-1.5 mt-1">
        {tokens.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1 pr-1">
            {t}<button onClick={() => setTokens(tokens.filter((x) => x !== t))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
          </Badge>
        ))}
        {tokens.length === 0 && <span className="text-xs text-muted-foreground">Aucun élément.</span>}
      </div>
      <div className="flex gap-2">
        <Input value={val} placeholder={placeholder} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(val); } }} />
        <Button type="button" variant="outline" onClick={() => add(val)}><Plus className="h-4 w-4" /></Button>
      </div>
      {suggestions && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {suggestions.filter((s) => !tokens.includes(s)).slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="text-[11px] px-2 py-0.5 rounded-full border hover:bg-muted transition-colors">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewSearchDialog({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { state, set } = useStore();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState("");
  const [poste, setPoste] = useState("");
  const [desc, setDesc] = useState("");
  const [brand, setBrand] = useState<"Executive" | "Staffing">("Executive");
  const [seniority, setSeniority] = useState("Confirmé");
  const [skills, setSkills] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>(["Maroc"]);
  const [cities, setCities] = useState<string[]>([]);
  const [scoring, setScoring] = useState<ScoringCriterion[]>([
    { id: "sk", label: "Adéquation compétences", weight: 40 },
    { id: "sen", label: "Séniorité / expérience", weight: 30 },
    { id: "sec", label: "Expérience secteur", weight: 15 },
    { id: "loc", label: "Localisation / mobilité", weight: 10 },
    { id: "dispo", label: "Disponibilité", weight: 5 },
  ]);

  const totalWeight = scoring.reduce((a, c) => a + (Number(c.weight) || 0), 0);
  const balanced = totalWeight === 100;

  const setWeight = (id: string, w: number) => setScoring((cur) => cur.map((c) => c.id === id ? { ...c, weight: Math.max(0, Math.min(100, w)) } : c));
  const setLabel = (id: string, label: string) => setScoring((cur) => cur.map((c) => c.id === id ? { ...c, label } : c));
  const addCriterion = () => setScoring((cur) => [...cur, { id: `cr-${Date.now()}`, label: "Nouveau critère", weight: 0 }]);
  const removeCriterion = (id: string) => setScoring((cur) => cur.filter((c) => c.id !== id));
  const normalize = () => {
    if (totalWeight === 0) return;
    let running = 0;
    const next = scoring.map((c, i) => {
      if (i === scoring.length - 1) return { ...c, weight: 100 - running };
      const w = Math.round((c.weight / totalWeight) * 100);
      running += w;
      return { ...c, weight: w };
    });
    setScoring(next);
    toast.success("Pondérations normalisées à 100%");
  };

  const launch = () => {
    if (!client.trim() || !poste.trim()) { toast.error("Client et poste requis"); return; }
    if (!balanced) { toast.error("La somme des pondérations doit être égale à 100%"); return; }
    setLoading(true);
    setTimeout(() => {
      const base = state.searches[0].candidates.slice(0, 8);
      const candidates = base.map((c, i) => {
        const perc = scoring.map((_, k) => 45 + ((i * 13 + k * 29) % 56));
        const breakdown = scoring.map((cr, k) => ({ label: cr.label, weight: cr.weight, value: Math.round((perc[k] * cr.weight) / 100) }));
        const matchScore = breakdown.reduce((a, b) => a + b.value, 0);
        return { ...c, id: `c-new-${Date.now()}-${i}`, breakdown, matchScore, skills: skills.length ? skills : c.skills };
      });
      const s: SourcingSearch = {
        id: `s-${Date.now()}`, title: `${poste} — ${cities[0] ?? countries[0] ?? "Maroc"}`,
        client, poste, jobDescription: desc || "Brief à compléter.",
        brand, sector: "Industries", seniority,
        location: cities[0] ?? countries[0] ?? "Maroc", countries: countries.length ? countries : ["Maroc"], cities,
        skills, languages: ["Français", "Anglais"], contract: "CDI",
        salary: "Selon profil", scoring, sources: { linkedin: true, web: true, network: true },
        createdAt: new Date().toISOString(), status: "En cours", candidates,
      };
      set("searches", [s, ...state.searches]);
      set("notifications", [{ id: `n-${Date.now()}`, kind: "sourcing", title: "Sourcing terminé", body: `${candidates.length} candidats identifiés pour ${poste}.`, at: new Date().toISOString(), read: false }, ...state.notifications]);
      setLoading(false); setOpen(false);
      setClient(""); setPoste(""); setDesc(""); setSkills([]); setCities([]);
      toast.success(`Recherche lancée · ${candidates.length} candidats trouvés`);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Sparkles className="h-4 w-4" /> Nouvelle recherche</Button></DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto scroll-fade">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" /> Nouvelle recherche de sourcing IA</DialogTitle>
          <p className="text-xs text-muted-foreground">Décrivez le poste, la géographie et la grille de scoring — l'IA identifie les meilleurs profils.</p>
        </DialogHeader>

        <div className="space-y-5">
          <section className="rounded-xl border border-border/70 bg-card/40 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-gold" /> Mission & client</div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Client</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Ex : Atlas Industries" /></div>
              <div><Label>Nom du poste à sourcer</Label><Input value={poste} onChange={(e) => setPoste(e.target.value)} placeholder="Ex : Directeur Industriel" /></div>
              <div><Label>Marque</Label>
                <Select value={brand} onValueChange={(v) => setBrand(v as typeof brand)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Executive", "Staffing"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Séniorité</Label>
                <Select value={seniority} onValueChange={setSeniority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Junior", "Confirmé", "Senior", "Cadre dirigeant"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Brief de la mission</Label><Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Contexte du poste, enjeux, culture d'entreprise…" /></div>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/40 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Search className="h-3.5 w-3.5 text-gold" /> Compétences & géographie</div>
            <TokenField label="Compétences requises" placeholder="Ajouter une compétence…" tokens={skills} setTokens={setSkills}
              suggestions={["Lean", "Leadership", "P&L", "SAP", "Six Sigma", "Anglais", "Gestion de projet", "QSE"]} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <TokenField label="Pays (multi-choix)" placeholder="Ajouter un pays…" tokens={countries} setTokens={setCountries} suggestions={COUNTRY_OPTIONS} />
              <TokenField label="Villes (multi-choix)" placeholder="Ajouter une ville…" tokens={cities} setTokens={setCities} suggestions={CITY_OPTIONS} />
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-gold" /> Critères de scoring & pondération</div>
                <p className="text-xs text-muted-foreground mt-1">La somme des pondérations doit être exactement 100%.</p>
              </div>
              <span className={cn("text-sm font-semibold px-3 py-1 rounded-full", balanced ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}>
                {totalWeight}%
              </span>
            </div>
            <div className="space-y-2">
              {scoring.map((c) => (
                <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2 py-1.5">
                  <Input value={c.label} onChange={(e) => setLabel(c.id, e.target.value)} className="flex-1 h-9 border-transparent bg-transparent focus-visible:bg-card" />
                  <Input type="number" min={0} max={100} value={c.weight} onChange={(e) => setWeight(c.id, Number(e.target.value))} className="w-20 h-9" />
                  <span className="text-xs text-muted-foreground">%</span>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeCriterion(c.id)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button type="button" variant="outline" size="sm" onClick={addCriterion}><Plus className="h-3 w-3 mr-1" /> Critère</Button>
              <Button type="button" variant="outline" size="sm" onClick={normalize} disabled={totalWeight === 0}>Normaliser à 100%</Button>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/40 p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Send className="h-3.5 w-3.5 text-gold" /> Sources de recherche</div>
            <div className="grid grid-cols-3 gap-2">
              {["LinkedIn", "Web", "Réseau Seylane"].map((x) => (
                <div key={x} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-background/60"><span>{x}</span><Switch defaultChecked /></div>
              ))}
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={launch} disabled={loading || !balanced} className="gap-2">
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Recherche IA…</> : <><Search className="h-4 w-4" /> Lancer la recherche</>}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
