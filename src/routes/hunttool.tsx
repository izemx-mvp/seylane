import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Sparkles, Info, Check, Clock, Repeat, Mail, Linkedin, MessageCircle, UserCog, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignContact, HuntConfig } from "@/lib/mock-data";
import { PaginationBar, usePagination } from "@/components/pagination-bar";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/hunttool")({
  head: () => ({ meta: [{ title: "Agent IA Relance HuntTool — Seylane" }] }),
  component: HuntTool,
});

type Row = { contact: CampaignContact; campaign: Campaign };

const TABS = [
  { id: "contacts", label: "Contacts" },
  { id: "config", label: "Configuration" },
] as const;

function classifStyle(c: CampaignContact["classification"]) {
  switch (c) {
    case "Intéressé": return "bg-success/15 text-success border border-success/30";
    case "Refusé":    return "bg-destructive/10 text-destructive border border-destructive/30";
    case "Ambigu":    return "bg-gold/15 text-gold-foreground border border-gold/30";
    default:          return "bg-muted text-muted-foreground border border-border";
  }
}

function HuntTool() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("contacts");
  return (
    <AppShell title="Agent IA Relance HuntTool" subtitle="Messagerie automatique multi-canal — Email · LinkedIn · WhatsApp">
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-muted/60 p-1 rounded-full border border-border/60">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-6 py-2 text-sm font-medium rounded-full transition-all",
                tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === "contacts" && <ContactsTab />}
      {tab === "config" && <ConfigTab />}
    </AppShell>
  );
}

function ContactsTab() {
  const { state, set } = useStore();
  const [q, setQ] = useState("");
  const [fClass, setFClass] = useState<string>("all");
  const [fChannel, setFChannel] = useState<string>("all");
  const [fCampaign, setFCampaign] = useState<string>("all");
  const [selected, setSelected] = useState<Row | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [chatMsg, setChatMsg] = useState("");

  const rows: Row[] = useMemo(() => {
    const all: Row[] = state.campaigns.flatMap((cm) => cm.contacts.map((c) => ({ contact: c, campaign: cm })));
    return all.filter((r) => {
      if (fClass !== "all" && r.contact.classification !== fClass) return false;
      if (fChannel !== "all" && r.contact.channel !== fChannel) return false;
      if (fCampaign !== "all" && r.campaign.id !== fCampaign) return false;
      if (q && !`${r.contact.name} ${r.campaign.name} ${r.campaign.linkedPoste ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (a.contact.lastAt < b.contact.lastAt ? 1 : -1));
  }, [state.campaigns, q, fClass, fChannel, fCampaign]);

  const updateContact = (cmId: string, cId: string, patch: Partial<CampaignContact>) => {
    const camp = state.campaigns.find((c) => c.id === cmId); if (!camp) return;
    const upd = { ...camp, contacts: camp.contacts.map((c) => c.id === cId ? { ...c, ...patch } : c) };
    set("campaigns", state.campaigns.map((c) => c.id === cmId ? upd : c));
    if (selected?.contact.id === cId) setSelected({ campaign: upd, contact: upd.contacts.find((c) => c.id === cId)! });
  };

  const totalAuto = state.campaigns.filter((c) => c.origin === "auto").length;
  const { slice: pageSlice, pageCount } = usePagination(rows, pageSize, page);


  return (
    <>
      <Card className="soft-shadow mb-4 border-l-4 border-l-gold bg-gold/5">
        <CardContent className="p-4 flex items-start gap-3 text-sm">
          <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Campagnes détectées automatiquement depuis HuntTool</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {totalAuto} campagne(s) créée(s) automatiquement dès qu'une offre est envoyée depuis Sourcing ou Prospection. L'IA classe chaque réponse en <span className="text-success font-medium">Intéressé</span>, <span className="text-destructive font-medium">Refusé</span> ou <span className="text-gold-foreground font-medium">Ambigu</span>.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher candidat, poste, campagne…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={fCampaign} onValueChange={setFCampaign}><SelectTrigger className="w-[220px]"><SelectValue placeholder="Campagne" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes campagnes</SelectItem>{state.campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fChannel} onValueChange={setFChannel}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous canaux</SelectItem>{["Email", "LinkedIn", "WhatsApp"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fClass} onValueChange={setFClass}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Classification" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes réponses</SelectItem>{["Intéressé", "Refusé", "Ambigu", "En attente"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card className="soft-shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider">
                <tr>
                  {["Candidat", "Poste lié", "Client", "Canal", "Étape", "Classification IA", "Dernière activité"].map((h) => <th key={h} className="text-left p-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(() => null)()}
                {pageSlice.map((r) => (
                  <tr key={r.contact.id} onClick={() => setSelected(r)} className="border-t hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-3 font-medium">{r.contact.name}</td>
                    <td className="p-3">{r.campaign.linkedPoste ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{r.campaign.linkedClient ?? "—"}</td>
                    <td className="p-3"><Badge variant="outline">{r.contact.channel}</Badge></td>
                    <td className="p-3 text-xs">{r.contact.sendStatus}</td>
                    <td className="p-3">
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full", classifStyle(r.contact.classification))}>{r.contact.classification}</span>
                      {r.contact.assignedHumanId && <Badge variant="outline" className="ml-1 text-[10px]"><UserCog className="h-3 w-3 mr-1" />Humain</Badge>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(r.contact.lastAt).toLocaleString("fr-FR")}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-muted-foreground text-sm">Aucun contact ne correspond à ces filtres.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={rows.length} />


      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:w-[520px] sm:max-w-none overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="font-display tracking-tight">{selected.contact.name}</SheetTitle></SheetHeader>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selected.contact.channel}</Badge>
                  <Badge variant="secondary">{selected.contact.sendStatus}</Badge>
                  <span className={cn("text-[11px] px-2 py-0.5 rounded-full", classifStyle(selected.contact.classification))}>{selected.contact.classification}</span>
                </div>
                <div className="border rounded-lg p-3 bg-muted/40 text-xs space-y-1">
                  <div><span className="text-muted-foreground">Campagne :</span> <span className="font-medium">{selected.campaign.name}</span></div>
                  <div><span className="text-muted-foreground">Poste :</span> <span className="font-medium">{selected.campaign.linkedPoste ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Client :</span> <span className="font-medium">{selected.campaign.linkedClient ?? "—"}</span></div>
                  <div className="pt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Info className="h-3 w-3" /> Campagne {selected.campaign.origin === "auto" ? "détectée automatiquement" : "créée manuellement"}.</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Conversation</div>
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg text-sm">
                    Bonjour {selected.contact.name.split(" ")[0]}, chez Seylane nous accompagnons {selected.campaign.linkedClient ?? "un client"} sur le poste {selected.campaign.linkedPoste ?? "confidentiel"}. Votre parcours pourrait correspondre — êtes-vous ouvert à en échanger ?
                  </div>
                  {selected.contact.rawReply && <div className="bg-muted p-3 rounded-lg text-sm">{selected.contact.rawReply}</div>}
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2">Reclasser la réponse</div>
                  <Select value={selected.contact.classification} onValueChange={(v) => { updateContact(selected.campaign.id, selected.contact.id, { classification: v as CampaignContact["classification"] }); toast.success("Réponse reclassifiée"); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Intéressé", "Refusé", "Ambigu", "En attente"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">Dernière interaction : {new Date(selected.contact.lastAt).toLocaleString("fr-FR")}</div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

const CHANNEL_META = {
  Email: { icon: Mail, color: "text-primary" },
  LinkedIn: { icon: Linkedin, color: "text-[#0A66C2]" },
  WhatsApp: { icon: MessageCircle, color: "text-success" },
} as const;

function ConfigTab() {
  const { state, set } = useStore();
  const [cfg, setCfg] = useState<HuntConfig>(state.huntConfig);

  const save = () => { set("huntConfig", cfg); toast.success("Configuration des relances enregistrée"); };
  const toggleChannel = (ch: HuntConfig["channels"][number]) =>
    setCfg((c) => ({ ...c, channels: c.channels.includes(ch) ? c.channels.filter((x) => x !== ch) : [...c.channels, ch] }));
  const updDay = (day: string, patch: Partial<HuntConfig["days"][number]>) =>
    setCfg((c) => ({ ...c, days: c.days.map((d) => d.day === day ? { ...d, ...patch } : d) }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="soft-shadow">
        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg tracking-tight flex items-center gap-2"><Repeat className="h-4 w-4 text-gold" /> Cadence des relances</h3>
            <p className="text-xs text-muted-foreground">Définit combien de fois l'IA relance un candidat sans réponse et l'intervalle entre chaque relance.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2"><Label className="text-sm">Nombre de relances</Label><span className="text-sm font-semibold">{cfg.maxRelances}</span></div>
              <Slider value={[cfg.maxRelances]} onValueChange={(v) => setCfg((c) => ({ ...c, maxRelances: v[0] }))} min={0} max={6} step={1} />
              <p className="text-[11px] text-muted-foreground mt-1">0 = aucune relance automatique · max 6.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><Label className="text-sm">Délai entre relances</Label><span className="text-sm font-semibold">{cfg.delayDays} j</span></div>
              <Slider value={[cfg.delayDays]} onValueChange={(v) => setCfg((c) => ({ ...c, delayDays: v[0] }))} min={1} max={14} step={1} />
              <p className="text-[11px] text-muted-foreground mt-1">Nombre de jours ouvrés avant la relance suivante.</p>
            </div>
          </div>
          <div>
            <Label className="text-sm">Canaux autorisés</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["Email", "LinkedIn", "WhatsApp"] as const).map((ch) => {
                const M = CHANNEL_META[ch]; const Icon = M.icon; const active = cfg.channels.includes(ch);
                return (
                  <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all", active ? "border-primary bg-primary/5" : "hover:bg-muted opacity-70")}>
                    <Icon className={cn("h-4 w-4", M.color)} /> {ch}{active && <Check className="h-3.5 w-3.5 text-success" />}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-shadow">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-display text-lg tracking-tight flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> Jours & créneaux horaires autorisés</h3>
            <p className="text-xs text-muted-foreground">L'IA n'envoie des messages que pendant les plages activées ci-dessous.</p>
          </div>
          <div className="space-y-2">
            {cfg.days.map((d) => (
              <div key={d.day} className={cn("flex items-center gap-3 border rounded-lg p-3 transition-all", d.enabled ? "bg-card" : "bg-muted/40 opacity-70")}>
                <Switch checked={d.enabled} onCheckedChange={(v) => updDay(d.day, { enabled: v })} />
                <div className="w-24 text-sm font-medium">{d.day}</div>
                <div className="flex items-center gap-2 ml-auto">
                  <Input type="time" value={d.from} disabled={!d.enabled} onChange={(e) => updDay(d.day, { from: e.target.value })} className="w-[120px]" />
                  <span className="text-muted-foreground text-sm">→</span>
                  <Input type="time" value={d.to} disabled={!d.enabled} onChange={(e) => updDay(d.day, { to: e.target.value })} className="w-[120px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={save}><Check className="h-4 w-4" /> Enregistrer la configuration</Button>
      </div>
    </div>
  );
}
