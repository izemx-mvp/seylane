import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Sparkles, Wand2, RefreshCw, CalendarDays, ChevronLeft, ChevronRight, Copy, Trash2, Edit3, Send,
  Linkedin, Instagram, Globe, Upload, ImageIcon, Check, Video, ArrowUp, ArrowDown, Plus, X, Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Idea, Platform, MediaItem } from "@/lib/mock-data";

export const Route = createFileRoute("/community-manager")({
  head: () => ({ meta: [{ title: "AI Community Manager — Seylane" }] }),
  component: CM,
});

const TABS = [
  { id: "config",   label: "Configuration" },
  { id: "ideas",    label: "Idées" },
  { id: "calendar", label: "Calendrier" },
] as const;

const PLATFORM_META: Record<Platform, { name: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  linkedin:  { name: "LinkedIn",  icon: Linkedin,  color: "text-[#0A66C2]", bg: "bg-[#0A66C2]" },
  instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500",  bg: "bg-pink-500" },
  website:   { name: "Site web",  icon: Globe,     color: "text-primary",   bg: "bg-primary" },
};

const TONES = ["Expert & institutionnel", "Humain & inspirant", "Éditorial approfondi", "Corporate international", "Chaleureux & proche"];
const FREQS = ["Quotidienne", "3x semaine", "2x semaine", "Hebdomadaire", "Bi-mensuelle"];
const STOCK_IMGS = ["1521737604893-d14cc237f11d","1600880292203-757bb62b4baf","1521791136064-7986c2920216","1573496359142-b8d87734a5a2","1552664730-d307ca884978","1556761175-5973dc0f32e7","1497215728101-856f4ea42174","1542744173-8e7e53415bb0"];
const stockUrl = (i: number) => `https://images.unsplash.com/photo-${STOCK_IMGS[i % STOCK_IMGS.length]}?auto=format&fit=crop&w=1000&q=80`;

function PlatformDots({ platforms, size = "sm" }: { platforms: Platform[]; size?: "sm" | "md" }) {
  const s = size === "md" ? "h-6 w-6" : "h-5 w-5";
  const ic = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <div className="flex items-center gap-1">
      {platforms.map((p) => {
        const M = PLATFORM_META[p]; const Icon = M.icon;
        return <span key={p} className={cn("rounded-full flex items-center justify-center text-white", s, M.bg)} title={M.name}><Icon className={cn(ic, "text-white")} /></span>;
      })}
    </div>
  );
}

function CM() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("ideas");
  return (
    <AppShell
      title="AI Community Manager"
      subtitle="Génération, planification et publication multi-plateformes"
      actions={<CreatePostButton />}
    >
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-muted/60 p-1 rounded-full border border-border/60">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-full transition-all",
                tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >{t.label}</button>
          ))}
        </div>
      </div>
      {tab === "config"   && <ConfigTab />}
      {tab === "ideas"    && <IdeasTab />}
      {tab === "calendar" && <CalendarTab />}
    </AppShell>
  );
}

/* -------- Configuration -------- */
function ConfigTab() {
  const { state, set } = useStore();
  const c = state.cmConfig;
  const [newObj, setNewObj] = useState("");

  const updPlatform = (p: Platform, patch: Partial<typeof c.platformSettings.linkedin>) =>
    set("cmConfig", { ...c, platformSettings: { ...c.platformSettings, [p]: { ...c.platformSettings[p], ...patch } } });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { set("cmConfig", { ...c, logo: String(reader.result) }); toast.success("Logo mis à jour"); };
    reader.readAsDataURL(f);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="soft-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg tracking-tight">Objectifs</h3>
              <p className="text-xs text-muted-foreground">Guident le ton, les thèmes et le CTA générés par l'IA.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {c.objectives.map((o) => (
              <Badge key={o} variant="secondary" className="gap-2 py-1.5 pl-3 pr-2 text-xs">
                {o}
                <button onClick={() => set("cmConfig", { ...c, objectives: c.objectives.filter((x) => x !== o) })}
                  className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              </Badge>
            ))}
            {c.objectives.length === 0 && <span className="text-xs text-muted-foreground">Aucun objectif défini.</span>}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Ex : Générer 20 leads DRH / mois"
              value={newObj} onChange={(e) => setNewObj(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && newObj.trim()) { set("cmConfig", { ...c, objectives: [...c.objectives, newObj.trim()] }); setNewObj(""); } }} />
            <Button variant="outline" onClick={() => { if (!newObj.trim()) return; set("cmConfig", { ...c, objectives: [...c.objectives, newObj.trim()] }); setNewObj(""); toast.success("Objectif ajouté"); }}>Ajouter</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-shadow">
        <CardContent className="p-6">
          <h3 className="font-display text-lg tracking-tight mb-1">Logo d'entreprise</h3>
          <p className="text-xs text-muted-foreground mb-4">Utilisé sur les visuels IA générés.</p>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl bg-primary flex items-center justify-center border">
              {c.logo ? <img src={c.logo} alt="Logo" className="max-h-24 max-w-28 object-contain" /> : <span className="text-white/50 text-xs">Aucun logo</span>}
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-lg cursor-pointer hover:bg-muted"><Upload className="h-4 w-4" /> Uploader un logo</span>
              </label>
              {c.logo && <Button variant="ghost" size="sm" onClick={() => { set("cmConfig", { ...c, logo: "" }); toast.success("Logo retiré"); }}>Retirer</Button>}
              <p className="text-xs text-muted-foreground">PNG transparent recommandé · idéalement 512×512px.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-shadow">
        <CardContent className="p-6">
          <h3 className="font-display text-lg tracking-tight mb-1">Tonalité et fréquence par plateforme</h3>
          <p className="text-xs text-muted-foreground mb-5">Chaque canal reçoit son propre ton et son propre rythme.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
              const s = c.platformSettings[p]; const M = PLATFORM_META[p]; const Icon = M.icon;
              return (
                <div key={p} className={cn("border rounded-xl p-4 space-y-4 transition-all", s.enabled ? "bg-card" : "bg-muted/40 opacity-70")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Icon className={cn("h-5 w-5", M.color)} /><span className="font-medium">{M.name}</span></div>
                    <Switch checked={s.enabled} onCheckedChange={(v) => updPlatform(p, { enabled: v })} />
                  </div>
                  <div>
                    <Label className="text-xs">Tonalité</Label>
                    <Select value={s.tone} onValueChange={(v) => updPlatform(p, { tone: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Fréquence</Label>
                    <Select value={s.frequency} onValueChange={(v) => updPlatform(p, { frequency: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{FREQS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ServicesConfigCard />

      <div className="flex justify-end">
        <Button className="gap-2" onClick={() => toast.success("Configuration enregistrée")}><Check className="h-4 w-4" /> Enregistrer</Button>
      </div>
    </div>
  );
}

function ServicesConfigCard() {
  const { state, set } = useStore();
  const services = state.cmConfig.services ?? [];
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim(); if (!v) return;
    set("cmConfig", { ...state.cmConfig, services: [...services, v] });
    setVal(""); toast.success("Service ajouté");
  };
  const remove = (s: string) => set("cmConfig", { ...state.cmConfig, services: services.filter((x) => x !== s) });
  return (
    <Card className="soft-shadow">
      <CardContent className="p-6">
        <h3 className="font-display text-lg tracking-tight mb-1">Services de l'entreprise</h3>
        <p className="text-xs text-muted-foreground mb-4">Utilisés par l'IA pour cibler les publications sur vos offres réelles.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {services.map((s) => (
            <Badge key={s} variant="secondary" className="gap-2 py-1.5 pl-3 pr-2 text-xs">
              {s}
              <button onClick={() => remove(s)} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </Badge>
          ))}
          {services.length === 0 && <span className="text-xs text-muted-foreground">Aucun service défini.</span>}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Ex : Chasse de tête, Formation, Outplacement…" value={val} onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
          <Button variant="outline" onClick={add}>Ajouter</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------- Ideas -------- */

function IdeasTab() {
  const { state, set } = useStore();
  const [detail, setDetail] = useState<Idea | null>(null);
  const [gen, setGen] = useState(false);
  const [count, setCount] = useState(3);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");

  const generate = () => {
    setGen(true);
    setTimeout(() => {
      const titles = ["IA & recrutement : ce qui change pour les DRH","Success story : un CFO placé en 6 semaines","Marché de l'emploi Maroc 2026","Outplacement humain : notre méthode","Talents Diaspora : notre approche"];
      const newIdeas: Idea[] = Array.from({ length: count }, (_, i) => ({
        id: `idea-${Date.now()}-${i}`,
        title: titles[i % titles.length],
        caption: `${titles[i % titles.length]}. Seylane accompagne dirigeants et entreprises sur leurs enjeux People Management.`,
        hashtags: ["#Seylane", "#PeopleManagement", "#Maroc"],
        format: "image", platforms: ["linkedin"],
        suggestedAt: new Date().toISOString(),
        score: 78 + Math.floor(Math.random() * 15),
        media: stockUrl(i + 2),
        status: "draft",
      }));
      set("ideas", [...newIdeas, ...state.ideas]);
      setGen(false); setOpen(false); toast.success(`${count} idée(s) générée(s)`);
    }, 1000);
  };

  const list = state.ideas.filter((i) => {
    if (fStatus !== "all" && i.status !== fStatus) return false;
    if (q && !`${i.title} ${i.caption}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl tracking-tight">Idées de contenus</h2>
          <p className="text-sm text-muted-foreground">{list.length} idées · visuels IA générés depuis votre configuration</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="outline" className="gap-2"><Wand2 className="h-4 w-4" /> Générer des idées</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Générer de nouvelles idées</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nombre d'idées</Label><Input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} /></div>
              <p className="text-xs text-muted-foreground border-l-2 border-gold pl-3">L'IA génère des idées adaptées à votre ton et vos objectifs.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={generate} disabled={gen}>{gen ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Génération…</> : "Générer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Input placeholder="Rechercher une idée…" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 min-w-[220px]" />
        <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="scheduled">Programmé</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((idea) => <IdeaCard key={idea.id} idea={idea} onOpen={() => setDetail(idea)} />)}
      </div>
      {list.length === 0 && <div className="text-center text-muted-foreground text-sm py-16 border rounded-xl bg-muted/20">Aucune idée. Créez un post ou générez des idées.</div>}

      <IdeaSheet idea={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function IdeaCard({ idea, onOpen }: { idea: Idea; onOpen: () => void }) {
  const { state, set } = useStore();
  const del = () => { set("ideas", state.ideas.filter((i) => i.id !== idea.id)); toast.success("Idée supprimée"); };
  const dup = () => { set("ideas", [{ ...idea, id: `idea-${Date.now()}`, status: "draft" }, ...state.ideas]); toast.success("Idée dupliquée"); };
  const publish = () => { set("ideas", state.ideas.map((i) => i.id === idea.id ? { ...i, status: "published" } : i)); toast.success("Publié"); };
  const isVideo = idea.format === "video";
  return (
    <Card className="overflow-hidden group hover-lift hover:-translate-y-1 hover:shadow-xl transition-all">
      <div className="relative aspect-video bg-muted cursor-pointer" onClick={onOpen}>
        <img src={idea.media} alt="" className="w-full h-full object-cover" />
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground gap-1">
          {isVideo ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />} {isVideo ? "Vidéo" : "Image"}
        </Badge>
        {idea.mediaItems && idea.mediaItems.length > 1 && (
          <Badge className="absolute top-2 left-[92px] bg-black/60 text-white gap-1"><Film className="h-3 w-3" /> {idea.mediaItems.length}</Badge>
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">IA {idea.score}%</div>
        {idea.status === "published" && <Badge className="absolute bottom-2 left-2 bg-success text-white">Publié</Badge>}
        {idea.status === "scheduled" && <Badge className="absolute bottom-2 left-2 bg-gold text-primary">Programmé</Badge>}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-2 min-h-[2.5rem] text-sm">{idea.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{idea.caption}</p>
        <div className="flex items-center gap-1 mt-3">
          <PlatformDots platforms={idea.platforms} />
          <span className="ml-auto text-[10px] text-muted-foreground">{new Date(idea.suggestedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
        </div>
        <div className="flex items-center gap-1 mt-3 border-t pt-3">
          <Button size="sm" variant="ghost" onClick={onOpen} title="Modifier"><Edit3 className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={dup} title="Dupliquer"><Copy className="h-3.5 w-3.5" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button size="sm" variant="ghost" title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Supprimer cette idée ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={del}>Supprimer</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={onOpen}><CalendarDays className="h-3 w-3 mr-1" /> Planifier</Button>
          <Button size="sm" onClick={publish}><Send className="h-3 w-3 mr-1" /> Publier</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------- Idea edit sheet (full modification) -------- */
function IdeaSheet({ idea, onClose }: { idea: Idea | null; onClose: () => void }) {
  const { state, set } = useStore();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    if (idea) {
      setTitle(idea.title); setCaption(idea.caption); setPlatforms(idea.platforms);
      const d = idea.scheduledFor ? new Date(idea.scheduledFor) : new Date();
      setDateStr(d.toISOString().slice(0, 10));
      setTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
  }, [idea]);

  if (!idea) return null;
  const isVideo = idea.format === "video";
  const togglePlat = (p: Platform) => setPlatforms((cur) => cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);
  const save = (status: Idea["status"]) => {
    const [hh, mm] = timeStr.split(":").map(Number);
    const d = new Date(dateStr); d.setHours(hh || 9, mm || 0, 0, 0);
    set("ideas", state.ideas.map((i) => i.id === idea.id ? { ...i, title, caption, platforms, status, scheduledFor: status === "draft" ? undefined : d.toISOString() } : i));
    toast.success(status === "published" ? "Publié" : status === "scheduled" ? "Programmé" : "Enregistré");
    onClose();
  };

  return (
    <Sheet open={!!idea} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:w-[580px] sm:max-w-none overflow-y-auto">
        <SheetHeader><SheetTitle className="font-display tracking-tight">Modifier le contenu</SheetTitle></SheetHeader>
        <div className="mt-5 space-y-4">
          <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
            <img src={idea.media} alt="" className="w-full h-full object-cover" />
            <Badge className="absolute top-3 left-3 bg-black/70 text-white">{isVideo ? <><Video className="h-3 w-3 mr-1" /> Vidéo IA</> : <><ImageIcon className="h-3 w-3 mr-1" /> Image IA</>}</Badge>
          </div>
          <div>
            <Label className="text-xs">Titre / angle</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Légende</Label>
            <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Plateformes</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
                const M = PLATFORM_META[p]; const Icon = M.icon; const active = platforms.includes(p);
                return (
                  <button key={p} type="button" onClick={() => togglePlat(p)}
                    className={cn("border rounded-lg p-2.5 text-sm flex items-center gap-2 justify-center transition-all", active ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                    <Icon className={cn("h-4 w-4", M.color)} /> {M.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Date</Label><Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} /></div>
            <div><Label className="text-xs">Heure</Label><Input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} /></div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => toast.success(isVideo ? "Vidéo régénérée" : "Visuel régénéré")}><RefreshCw className="h-4 w-4 mr-2" /> Régénérer le média</Button>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => save("draft")}>Brouillon</Button>
            <Button variant="outline" onClick={() => save("scheduled")}><CalendarDays className="h-4 w-4 mr-1" /> Planifier</Button>
            <Button onClick={() => save("published")}><Send className="h-4 w-4 mr-1" /> Publier</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* -------- Calendar -------- */
function CalendarTab() {
  const { state } = useStore();
  const [view, setView] = useState<"mois" | "semaine" | "jour" | "agenda">("mois");
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [selected, setSelected] = useState<Idea | null>(null);

  const now = new Date();

  const evChip = (e: Idea) => (
    <button key={e.id} onClick={() => setSelected(e)}
      className={cn("w-full text-left truncate text-[10px] px-1.5 py-1 rounded flex items-center gap-1.5 hover:opacity-80 transition-opacity",
        e.status === "published" ? "bg-success/15 text-success" : "bg-primary/10 text-primary")}>
      <PlatformDots platforms={e.platforms} />
      <span className="truncate">{e.title}</span>
    </button>
  );

  const eventsOn = (d: Date) => state.ideas.filter((i) => {
    if (!i.scheduledFor) return false;
    const dt = new Date(i.scheduledFor);
    return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth() && dt.getDate() === d.getDate();
  });

  // Month view
  const cur = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthName = cur.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const startDay = (cur.getDay() + 6) % 7;
  const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const cells: Array<{ date: Date | null; events: Idea[] }> = [];
  for (let i = 0; i < startDay; i++) cells.push({ date: null, events: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(cur.getFullYear(), cur.getMonth(), d);
    cells.push({ date, events: eventsOn(date) });
  }

  // Week view — start Monday
  const baseWeek = new Date(now); baseWeek.setDate(now.getDate() + weekOffset * 7);
  const monday = new Date(baseWeek); monday.setDate(baseWeek.getDate() - ((baseWeek.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const weekLabel = `Sem. du ${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;

  // Day view
  const dayDate = new Date(now); dayDate.setDate(now.getDate() + dayOffset);
  const dayLabel = dayDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dayEvents = eventsOn(dayDate);

  // Agenda
  const agenda = [...state.ideas].filter((i) => i.scheduledFor).sort((a, b) => (a.scheduledFor! < b.scheduledFor! ? -1 : 1));

  const nav = () => {
    if (view === "mois") return { prev: () => setMonthOffset(monthOffset - 1), next: () => setMonthOffset(monthOffset + 1), today: () => setMonthOffset(0), label: monthName };
    if (view === "semaine") return { prev: () => setWeekOffset(weekOffset - 1), next: () => setWeekOffset(weekOffset + 1), today: () => setWeekOffset(0), label: weekLabel };
    if (view === "jour") return { prev: () => setDayOffset(dayOffset - 1), next: () => setDayOffset(dayOffset + 1), today: () => setDayOffset(0), label: dayLabel };
    return { prev: () => {}, next: () => {}, today: () => {}, label: "Agenda" };
  };
  const N = nav();

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={N.prev} disabled={view === "agenda"}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-display text-lg capitalize min-w-[200px] text-center tracking-tight">{N.label}</div>
          <Button variant="outline" size="icon" onClick={N.next} disabled={view === "agenda"}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={N.today}>Aujourd'hui</Button>
        </div>
        <div className="inline-flex bg-muted/60 p-1 rounded-full border border-border/60">
          {(["mois", "semaine", "jour", "agenda"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-4 py-1.5 text-xs font-medium rounded-full capitalize transition-all",
                view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "mois" && (
        <Card className="soft-shadow overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="p-2 text-xs font-medium text-muted-foreground text-center uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => (
              <div key={i} className={cn("min-h-[120px] border-b border-r p-1.5 text-xs", !cell.date && "bg-muted/20")}>
                {cell.date && (
                  <>
                    <div className="text-muted-foreground mb-1 text-[11px]">{cell.date.getDate()}</div>
                    <div className="space-y-1">{cell.events.map(evChip)}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {view === "semaine" && (
        <Card className="soft-shadow overflow-hidden">
          <div className="grid grid-cols-7">
            {weekDays.map((d) => {
              const evs = eventsOn(d);
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={d.toISOString()} className="border-r border-b p-2 min-h-[300px]">
                  <div className={cn("text-xs font-medium mb-2 pb-2 border-b", isToday && "text-primary")}>
                    <div className="uppercase tracking-wider text-[10px] text-muted-foreground">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                    <div className="text-lg font-display">{d.getDate()}</div>
                  </div>
                  <div className="space-y-1">{evs.map(evChip)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {view === "jour" && (
        <Card className="soft-shadow"><CardContent className="p-6">
          {dayEvents.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Aucune publication ce jour.</div>
          ) : (
            <div className="space-y-2">{dayEvents.map((e) => (
              <button key={e.id} onClick={() => setSelected(e)} className="w-full text-left border rounded-lg p-3 hover:bg-muted/40 transition-colors flex items-center gap-3">
                <PlatformDots platforms={e.platforms} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.scheduledFor!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
              </button>
            ))}</div>
          )}
        </CardContent></Card>
      )}

      {view === "agenda" && (
        <Card className="soft-shadow"><CardContent className="p-4 space-y-1">
          {agenda.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">Aucune publication planifiée.</div>}
          {agenda.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} className="w-full text-left border rounded-lg p-3 hover:bg-muted/40 transition-colors flex items-center gap-3">
              <div className="w-24 text-xs text-muted-foreground">{new Date(e.scheduledFor!).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</div>
              <PlatformDots platforms={e.platforms} />
              <div className="flex-1 min-w-0 font-medium truncate">{e.title}</div>
              <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
            </button>
          ))}
        </CardContent></Card>
      )}

      <IdeaSheet idea={selected} onClose={() => setSelected(null)} />
    </>
  );
}


/* ================= Create Post — 2 steps with multi-media ================= */
function newMedia(type: "image" | "video", i: number, url?: string): MediaItem {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    url: url ?? (type === "image" ? stockUrl(i) : stockUrl(i + 4)),
    description: "",
    reference: "",
    durationSec: type === "video" ? 10 : undefined,
  };
}

function CreatePostButton() {
  const { state, set } = useStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [media, setMedia] = useState<MediaItem[]>([newMedia("image", 0)]);
  const [platforms, setPlatforms] = useState<Platform[]>(["linkedin"]);
  const [generating, setGenerating] = useState(false);
  const [caption, setCaption] = useState("");
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState("09:00");

  const reset = () => {
    setStep(1); setTitle(""); setPrompt(""); setTone(TONES[0]); setMedia([newMedia("image", 0)]);
    setPlatforms(["linkedin"]); setCaption(""); setMode("now");
  };

  const imgCount = media.filter((m) => m.type === "image").length;
  const vidCount = media.filter((m) => m.type === "video").length;

  const addMedia = (type: "image" | "video") => setMedia((cur) => [...cur, newMedia(type, cur.length)]);
  const removeMedia = (id: string) => setMedia((cur) => cur.filter((m) => m.id !== id));
  const updMedia = (id: string, patch: Partial<MediaItem>) => setMedia((cur) => cur.map((m) => m.id === id ? { ...m, ...patch } : m));
  const move = (idx: number, dir: -1 | 1) => setMedia((cur) => {
    const next = [...cur]; const j = idx + dir;
    if (j < 0 || j >= next.length) return cur;
    [next[idx], next[j]] = [next[j], next[idx]];
    return next;
  });
  const moveTo = (from: number, to: number) => setMedia((cur) => {
    if (from === to || from < 0 || to < 0 || from >= cur.length || to >= cur.length) return cur;
    const next = [...cur]; const [it] = next.splice(from, 1); next.splice(to, 0, it); return next;
  });
  const dragProps = (idx: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.setData("text/plain", String(idx)); e.dataTransfer.effectAllowed = "move"; },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); const from = parseInt(e.dataTransfer.getData("text/plain"), 10); if (!Number.isNaN(from)) moveTo(from, idx); },
  });

  const upload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    updMedia(id, { url, reference: f.name });
    toast.success("Média importé");
  };

  const goPreview = () => {
    if (media.length === 0) { toast.error("Ajoutez au moins un média"); return; }
    setGenerating(true);
    setTimeout(() => {
      setCaption(`${title || "Nouveau post Seylane"}. ${prompt || "Seylane accompagne dirigeants et entreprises sur leurs enjeux People Management."} #Seylane #PeopleManagement`);
      setGenerating(false); setStep(2);
    }, 900);
  };

  const publish = () => {
    if (platforms.length === 0) { toast.error("Choisissez au moins une plateforme"); return; }
    const status: Idea["status"] = mode === "now" ? "published" : "scheduled";
    const [hh, mm] = timeStr.split(":").map(Number);
    const d = new Date(dateStr); d.setHours(hh || 9, mm || 0, 0, 0);
    const format = vidCount > 0 ? "video" : "image";
    const idea: Idea = {
      id: `idea-${Date.now()}`, title: title || "Nouveau post Seylane", caption,
      hashtags: ["#Seylane", "#PeopleManagement"], format, platforms,
      suggestedAt: new Date().toISOString(), score: 88,
      media: media[0].url, mediaItems: media,
      status, scheduledFor: mode === "now" ? new Date().toISOString() : d.toISOString(),
    };
    set("ideas", [idea, ...state.ideas]);
    set("notifications", [{ id: `n-${Date.now()}`, kind: "post", title: mode === "now" ? "Post publié" : "Post planifié", body: `« ${idea.title} » sur ${platforms.map((p) => PLATFORM_META[p].name).join(", ")}.`, at: new Date().toISOString(), read: false }, ...state.notifications]);
    toast.success(mode === "now" ? "Publié" : `Programmé pour le ${d.toLocaleString("fr-FR")}`);
    setOpen(false); reset();
  };

  const togglePlat = (p: Platform) => setPlatforms((cur) => cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild><Button className="gap-2"><Sparkles className="h-4 w-4" /> Nouveau post</Button></DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Créer un post
            <div className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <span className={cn("px-2 py-0.5 rounded", step === 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>1. Configuration</span>
              <ChevronRight className="h-3 w-3" />
              <span className={cn("px-2 py-0.5 rounded", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>2. Preview</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div><Label>Idée / angle du post</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Success story CFO placé en 6 semaines" /></div>
            <div><Label>Description du message</Label><Textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Décrivez le message et l'ambiance souhaitée…" /></div>
            <div>
              <Label>Tonalité</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Médias à générer</Label>
                  <p className="text-xs text-muted-foreground">{imgCount} image(s) · {vidCount} vidéo(s) — réordonnez, décrivez et référencez chaque média.</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addMedia("image")}><ImageIcon className="h-3.5 w-3.5 mr-1" /> Image</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addMedia("video")}><Video className="h-3.5 w-3.5 mr-1" /> Vidéo</Button>
                </div>
              </div>

              <div className="space-y-3">
                {media.map((m, idx) => (
                  <div key={m.id} {...dragProps(idx)} className="border rounded-lg p-3 bg-card flex gap-3 cursor-move hover:border-primary/40 transition-colors">
                    <div className="relative w-28 shrink-0">
                      <img src={m.url} alt="" className="w-28 h-20 object-cover rounded-md" />
                      <Badge className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0 gap-1">
                        {m.type === "video" ? <Video className="h-2.5 w-2.5" /> : <ImageIcon className="h-2.5 w-2.5" />}#{idx + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <Input placeholder="Description du média…" value={m.description} onChange={(e) => updMedia(m.id, { description: e.target.value })} className="h-8 text-xs" />
                      <Input placeholder="Référence / source (URL, marque…)" value={m.reference} onChange={(e) => updMedia(m.id, { reference: e.target.value })} className="h-8 text-xs" />
                      {m.type === "video" && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">Durée {m.durationSec}s</span>
                          <Slider value={[m.durationSec ?? 10]} min={2} max={30} step={1} onValueChange={(v) => updMedia(m.id, { durationSec: v[0] })} className="flex-1" />
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <label className="inline-flex">
                          <input type="file" accept={m.type === "video" ? "video/*" : "image/*"} className="hidden" onChange={(e) => upload(m.id, e)} />
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 border rounded cursor-pointer hover:bg-muted"><Upload className="h-3 w-3" /> Importer</span>
                        </label>
                        <div className="flex-1" />
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(idx, 1)} disabled={idx === media.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMedia(m.id)}><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
                {media.length === 0 && <div className="text-center text-xs text-muted-foreground py-4">Aucun média — ajoutez une image ou une vidéo.</div>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Aperçu des médias (réordonnez pour l'affichage final)</Label>
              <div className="flex gap-2 overflow-x-auto mt-2 pb-2">
                {media.map((m, idx) => (
                  <div key={m.id} className="relative w-40 shrink-0">
                    <img src={m.url} alt="" className="w-40 h-28 object-cover rounded-lg" />
                    <Badge className="absolute top-1 left-1 bg-black/70 text-white text-[10px] gap-1">
                      {m.type === "video" ? <><Video className="h-2.5 w-2.5" /> {m.durationSec}s</> : <ImageIcon className="h-2.5 w-2.5" />}#{idx + 1}
                    </Badge>
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      <button onClick={() => move(idx, -1)} disabled={idx === 0} className="bg-black/60 text-white rounded p-0.5 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                      <button onClick={() => move(idx, 1)} disabled={idx === media.length - 1} className="bg-black/60 text-white rounded p-0.5 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-1" onClick={goPreview}><RefreshCw className="h-3 w-3 mr-1" /> Régénérer</Button>
            </div>
            <div><Label className="text-xs">Légende (modifiable)</Label><Textarea rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1" /></div>
            <div>
              <Label className="text-xs">Plateformes de publication</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
                  const M = PLATFORM_META[p]; const Icon = M.icon; const active = platforms.includes(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePlat(p)}
                      className={cn("border rounded-lg p-3 text-sm flex items-center gap-2 justify-center transition-all", active ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                      <Icon className={cn("h-4 w-4", M.color)} /> {M.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs">Publication</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button type="button" onClick={() => setMode("now")}
                  className={cn("border rounded-lg p-3 text-sm text-left transition-all", mode === "now" ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                  <div className="font-medium flex items-center gap-2"><Send className="h-4 w-4" /> Publier maintenant</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Diffusion immédiate.</div>
                </button>
                <button type="button" onClick={() => setMode("schedule")}
                  className={cn("border rounded-lg p-3 text-sm text-left transition-all", mode === "schedule" ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                  <div className="font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Planifier</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Choisissez date et heure.</div>
                </button>
              </div>
            </div>
            {mode === "schedule" && (
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Date</Label><Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} /></div>
                <div><Label className="text-xs">Heure</Label><Input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} /></div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row gap-2">
          {step === 2 && <Button variant="ghost" onClick={() => setStep(1)}>Précédent</Button>}
          <div className="flex-1" />
          {step === 1 && <Button onClick={goPreview} disabled={generating}>{generating ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Génération…</> : "Générer le preview"}</Button>}
          {step === 2 && <Button onClick={publish}>{mode === "now" ? <><Send className="h-4 w-4 mr-2" /> Publier</> : <><CalendarDays className="h-4 w-4 mr-2" /> Planifier</>}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
