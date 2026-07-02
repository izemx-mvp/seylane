import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignContact } from "@/lib/mock-data";

export const Route = createFileRoute("/hunttool")({
  head: () => ({ meta: [{ title: "HuntTool CRM — Seylane" }] }),
  component: HuntTool,
});

type Row = {
  contact: CampaignContact;
  campaign: Campaign;
};

function classifStyle(c: CampaignContact["classification"]) {
  switch (c) {
    case "Intéressé": return "bg-success/15 text-success border border-success/30";
    case "Refusé":    return "bg-destructive/10 text-destructive border border-destructive/30";
    case "Ambigu":    return "bg-gold/15 text-gold-foreground border border-gold/30";
    default:          return "bg-muted text-muted-foreground border border-border";
  }
}

function HuntTool() {
  const { state, set } = useStore();
  const [q, setQ] = useState("");
  const [fClass, setFClass] = useState<string>("all");
  const [fChannel, setFChannel] = useState<string>("all");
  const [fCampaign, setFCampaign] = useState<string>("all");
  const [selected, setSelected] = useState<Row | null>(null);

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

  return (
    <AppShell title="HuntTool CRM" subtitle="Messagerie automatique multi-canal — Email · LinkedIn · WhatsApp">
      <Card className="soft-shadow mb-4 border-l-4 border-l-gold bg-gold/5">
        <CardContent className="p-4 flex items-start gap-3 text-sm">
          <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Campagnes détectées automatiquement</div>
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
                {rows.map((r) => (
                  <tr key={r.contact.id} onClick={() => setSelected(r)} className="border-t hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-3 font-medium">{r.contact.name}</td>
                    <td className="p-3">{r.campaign.linkedPoste ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{r.campaign.linkedClient ?? "—"}</td>
                    <td className="p-3"><Badge variant="outline">{r.contact.channel}</Badge></td>
                    <td className="p-3 text-xs">{r.contact.sendStatus}</td>
                    <td className="p-3">
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full", classifStyle(r.contact.classification))}>{r.contact.classification}</span>
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

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-[520px] sm:max-w-none overflow-y-auto">
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
                  <div className="pt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Info className="h-3 w-3" /> Campagne {selected.campaign.origin === "auto" ? "créée automatiquement" : "créée manuellement"}.</div>
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
    </AppShell>
  );
}