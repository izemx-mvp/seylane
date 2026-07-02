import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Send, Edit3, Trash2, StickyNote, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prospect } from "@/lib/mock-data";
import { PaginationBar, usePagination } from "@/components/pagination-bar";

export const Route = createFileRoute("/prospection")({
  head: () => ({ meta: [{ title: "Agent IA Prospection — Seylane" }] }),
  component: ProspectionPage,
});

const STATUSES: Prospect["status"][] = ["Nouveau", "Qualifié IA", "Contacté", "RDV Planifié", "En négociation", "Client", "Perdu"];

function scorePill(s: number) {
  if (s >= 70) return { label: "Chaud", cls: "bg-success/15 text-success border border-success/30" };
  if (s >= 40) return { label: "Tiède", cls: "bg-gold/15 text-gold-foreground border border-gold/30" };
  return { label: "Froid", cls: "bg-destructive/10 text-destructive border border-destructive/30" };
}

type SortKey = "name" | "score" | "receivedAt" | "status";

function ProspectionPage() {
  const { state, set } = useStore();
  const [q, setQ] = useState("");
  const [source, setSource] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [brand, setBrand] = useState<string>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "receivedAt", dir: "desc" });
  const [detail, setDetail] = useState<Prospect | null>(null);
  const [note, setNote] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const filtered = useMemo(() => {
    const list = state.prospects.filter((p) => {
      if (source !== "all" && p.source !== source) return false;
      if (status !== "all" && p.status !== status) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (q && !`${p.firstName} ${p.lastName} ${p.company ?? ""} ${p.message}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "name") return dir * (`${a.lastName}${a.firstName}`).localeCompare(`${b.lastName}${b.firstName}`);
      if (sort.key === "score") return dir * (a.score - b.score);
      if (sort.key === "status") return dir * a.status.localeCompare(b.status);
      return dir * (a.receivedAt < b.receivedAt ? -1 : 1);
    });
    return list;
  }, [state.prospects, source, status, brand, q, sort]);

  const move = (p: Prospect, to: Prospect["status"]) => {
    const upd = { ...p, status: to };
    set("prospects", state.prospects.map((x) => x.id === p.id ? upd : x));
    if (detail?.id === p.id) setDetail(upd);
    toast.success(`${p.firstName} → ${to}`);
  };

  const remove = (p: Prospect) => {
    set("prospects", state.prospects.filter((x) => x.id !== p.id));
    if (detail?.id === p.id) setDetail(null);
    toast.success("Prospect supprimé");
  };

  const toggleSort = (k: SortKey) => setSort((s) => s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" });
  const SortIcon = ({ k }: { k: SortKey }) => sort.key !== k ? <ArrowUpDown className="h-3 w-3 opacity-40" /> : sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;

  const { slice: pageSlice, pageCount } = usePagination(filtered, pageSize, page);



  return (
    <AppShell title="Agent IA Prospection" subtitle={`${state.prospects.length} prospects entrants — site web, Instagram, LinkedIn`}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un prospect, une société…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={source} onValueChange={setSource}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes sources</SelectItem>{["Site web", "Instagram", "LinkedIn"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous statuts</SelectItem>{STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={brand} onValueChange={setBrand}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Marque" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes marques</SelectItem>{["Executive", "Staffing", "Advisory", "Non défini"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card className="soft-shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="text-left p-3"><button className="inline-flex items-center gap-1" onClick={() => toggleSort("name")}>Nom <SortIcon k="name" /></button></th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Entreprise</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Marque</th>
                  <th className="text-left p-3"><button className="inline-flex items-center gap-1" onClick={() => toggleSort("score")}>Score IA <SortIcon k="score" /></button></th>
                  <th className="text-left p-3"><button className="inline-flex items-center gap-1" onClick={() => toggleSort("status")}>Statut <SortIcon k="status" /></button></th>
                  <th className="text-left p-3"><button className="inline-flex items-center gap-1" onClick={() => toggleSort("receivedAt")}>Reçu <SortIcon k="receivedAt" /></button></th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.map((p) => {
                  const sc = scorePill(p.score);
                  return (
                    <tr key={p.id} onClick={() => setDetail(p)}
                      className="border-t hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[240px]">{p.message}</div>
                      </td>
                      <td className="p-3"><Badge variant="outline">{p.type}</Badge></td>
                      <td className="p-3 text-muted-foreground">{p.company || "—"}</td>
                      <td className="p-3">{p.source}</td>
                      <td className="p-3">{p.brand}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-xs font-semibold text-primary">{p.score}</div>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", sc.cls)}>{sc.label}</span>
                        </div>
                      </td>
                      <td className="p-3"><Badge variant="secondary">{p.status}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(p.receivedAt).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-10 text-center text-muted-foreground text-sm">Aucun prospect ne correspond à ces filtres.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={filtered.length} />



      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent className="w-full sm:w-[92vw] sm:max-w-[1100px] overflow-y-auto">
          {detail && (() => {
            const sc = scorePill(detail.score);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="font-display tracking-tight">{detail.firstName} {detail.lastName}</SheetTitle>
                </SheetHeader>
                <div className="mt-5 space-y-5 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{detail.type}</Badge>
                    <Badge variant="secondary">{detail.source}</Badge>
                    <Badge>{detail.brand}</Badge>
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full", sc.cls)}>Score {detail.score} · {sc.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 rounded-lg p-3">
                    <div><div className="text-muted-foreground">Entreprise</div><div className="font-medium">{detail.company || "—"}</div></div>
                    <div><div className="text-muted-foreground">Fonction</div><div className="font-medium">{detail.role || "—"}</div></div>
                    <div><div className="text-muted-foreground">Email</div><div className="font-medium truncate">{detail.email}</div></div>
                    <div><div className="text-muted-foreground">Téléphone</div><div className="font-medium">{detail.phone}</div></div>
                    <div><div className="text-muted-foreground">Secteur</div><div className="font-medium">{detail.sector}</div></div>
                    <div><div className="text-muted-foreground">Reçu le</div><div className="font-medium">{new Date(detail.receivedAt).toLocaleString("fr-FR")}</div></div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Message initial</div>
                    <div className="border rounded-lg p-3 bg-card">{detail.message}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2">Décomposition du scoring IA</div>
                    <div className="space-y-1.5 text-xs">
                      {[
                        { l: "Complétude du message", v: Math.min(20, Math.floor(detail.score * 0.2)) },
                        { l: "Correspondance secteur/marque", v: Math.min(25, Math.floor(detail.score * 0.25)) },
                        { l: "Taille d'entreprise estimée", v: Math.min(20, Math.floor(detail.score * 0.2)) },
                        { l: "Urgence détectée", v: Math.min(20, Math.floor(detail.score * 0.2)) },
                        { l: "Historique d'interactions", v: Math.min(15, Math.floor(detail.score * 0.15)) },
                      ].map((x) => (
                        <div key={x.l} className="flex items-center gap-2">
                          <div className="w-40 text-muted-foreground">{x.l}</div>
                          <div className="flex-1 h-1.5 bg-muted rounded"><div className="h-1.5 gold-gradient rounded" style={{ width: `${(x.v / 25) * 100}%` }} /></div>
                          <div className="w-8 text-right font-medium">{x.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2">Statut</div>
                    <Select value={detail.status} onValueChange={(v) => move(detail, v as Prospect["status"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2">Notes ({detail.notes.length})</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {detail.notes.map((n, i) => (<div key={i} className="border rounded p-2 text-xs bg-muted/40"><div className="text-muted-foreground">{new Date(n.at).toLocaleString("fr-FR")}</div>{n.text}</div>))}
                    </div>
                    <Textarea className="mt-2" placeholder="Ajouter une note…" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
                    <Button size="sm" className="mt-2" onClick={() => {
                      if (!note.trim()) return;
                      const upd = { ...detail, notes: [...detail.notes, { at: new Date().toISOString(), text: note }] };
                      set("prospects", state.prospects.map((p) => p.id === detail.id ? upd : p));
                      setDetail(upd); setNote(""); toast.success("Note ajoutée");
                    }}><StickyNote className="h-3 w-3 mr-1" /> Ajouter</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <Button variant="outline"><Edit3 className="h-4 w-4 mr-2" /> Modifier</Button>
                    <Button variant="outline" onClick={() => toast.success("Envoyé vers HuntTool CRM")}><Send className="h-4 w-4 mr-2" /> HuntTool</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="col-span-2"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Supprimer ce prospect ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => remove(detail)}>Supprimer</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}