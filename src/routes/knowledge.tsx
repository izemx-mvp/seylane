import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit3, Copy, Upload, Download, FileText, Phone, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Faq, ServiceFiche, DocFile, Contact } from "@/lib/mock-data";
import { PaginationBar, usePagination } from "@/components/pagination-bar";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Base de Connaissances — Seylane" }] }),
  component: Knowledge,
});


const TABS = [
  { id: "faq", label: "FAQ" },
  { id: "services", label: "Fiches services" },
  { id: "docs", label: "Documents" },
  { id: "contacts", label: "Contacts" },
] as const;

function Knowledge() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("faq");
  return (
    <AppShell title="Base de Connaissances" subtitle="Sources qui alimentent l'agent IA du service client Seylane">
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-muted/60 p-1 rounded-full border border-border/60">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-5 py-2 text-sm font-medium rounded-full transition-all",
                tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === "faq" && <FAQTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "docs" && <DocsTab />}
      {tab === "contacts" && <ContactsTab />}
    </AppShell>
  );
}

function FAQTab() {
  const { state, set } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Faq | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<{ q: string; a: string; category: Faq["category"] }>({ q: "", a: "", category: "Général" });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10);
  const filtered = state.faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()));
  const { slice, pageCount } = usePagination(filtered, pageSize, page);


  const openEdit = (f: Faq) => { setEdit(f); setForm({ q: f.q, a: f.a, category: f.category }); };
  const openNew = () => { setShowNew(true); setForm({ q: "", a: "", category: "Général" }); };
  const close = () => { setEdit(null); setShowNew(false); };
  const save = () => {
    if (!form.q.trim()) { toast.error("Question requise"); return; }
    if (edit) {
      set("faqs", state.faqs.map((f) => f.id === edit.id ? { ...f, ...form } : f));
      toast.success("FAQ mise à jour");
    } else {
      set("faqs", [{ id: `faq-${Date.now()}`, ...form, status: "Actif" }, ...state.faqs]);
      toast.success("FAQ créée");
    }
    close();
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans les FAQs…" className="pl-9" /></div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>
      <Card className="soft-shadow overflow-hidden"><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider"><tr>{["Question", "Catégorie", "Statut", ""].map((h) => <th key={h} className="text-left p-3">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-t hover:bg-muted/30">
                <td className="p-3 max-w-md"><div className="font-medium">{f.q}</div><div className="text-xs text-muted-foreground line-clamp-1">{f.a}</div></td>
                <td className="p-3"><Badge variant="secondary">{f.category}</Badge></td>
                <td className="p-3"><Badge className={f.status === "Actif" ? "bg-success text-white" : ""}>{f.status}</Badge></td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(f)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { set("faqs", [{ ...f, id: `faq-${Date.now()}` }, ...state.faqs]); toast.success("Dupliqué"); }}><Copy className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Supprimer cette FAQ ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => { set("faqs", state.faqs.filter((x) => x.id !== f.id)); toast.success("Supprimé"); }}>Supprimer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={!!edit || showNew} onOpenChange={(v) => !v && close()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Modifier la FAQ" : "Nouvelle FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Question</Label><Input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} /></div>
            <div><Label>Réponse</Label><Textarea rows={4} value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} /></div>
            <div><Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Faq["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Entreprises", "Candidats", "Général"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Annuler</Button>
            <Button onClick={save}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ServicesTab() {
  const services = [
    { brand: "Seylane Executive", tag: "Chasse de tête & Management de transition",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
      desc: "Cadres dirigeants et managers confirmés. Approche discrète, méthodique, résultats mesurables.",
      benefits: ["Cartographie précise du marché", "Approche directe et confidentielle", "Short-list qualitative", "Accompagnement jusqu'à l'intégration"] },
    { brand: "Seylane Staffing", tag: "Recrutement volumique & profils opérationnels",
      img: "https://images.unsplash.com/photo-1590650046871-92c887180603?auto=format&fit=crop&w=800&q=80",
      desc: "Techniciens, agents de maîtrise, cadres intermédiaires sur l'industrie, l'aéronautique, l'automobile et l'énergie.",
      benefits: ["Campagnes 20 à 200+ postes", "Sourcing multi-canal", "Assessment centers", "Reporting hebdomadaire"] },
    { brand: "Seylane Advisory", tag: "Conseil RH & performance",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      desc: "Talent Management, Outplacement, Formation, Salary Benchmarking, Team Building, Bilan de compétences.",
      benefits: ["Diagnostic RH sur-mesure", "Benchmarks Maroc & Afrique", "Accompagnement transformation", "Coaching confidentiel"] },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {services.map((s) => (
        <Card key={s.brand} className="overflow-hidden soft-shadow hover-lift hover:-translate-y-1 hover:shadow-xl">
          <div className="aspect-video bg-muted"><img src={s.img} className="w-full h-full object-cover" alt="" /></div>
          <CardContent className="p-5">
            <Badge className="gold-gradient text-primary mb-2">{s.brand}</Badge>
            <h3 className="font-display text-lg tracking-tight">{s.tag}</h3>
            <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            <div className="mt-3">
              <div className="text-xs font-semibold mb-1">Bénéfices</div>
              <ul className="text-xs space-y-1 text-muted-foreground">{s.benefits.map((b) => <li key={b}>• {b}</li>)}</ul>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success("Fiche mise à jour")}><Edit3 className="h-3 w-3 mr-1" /> Modifier</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DocsTab() {
  const { state, set } = useStore();
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">{state.documents.length} documents</div>
        <Button onClick={() => toast.success("Fichier uploadé")}><Upload className="h-4 w-4 mr-2" /> Uploader</Button>
      </div>
      <Card className="soft-shadow overflow-hidden"><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider"><tr>{["Nom", "Catégorie", "Date", "Taille", ""].map((h) => <th key={h} className="text-left p-3">{h}</th>)}</tr></thead>
          <tbody>
            {state.documents.map((d) => (
              <tr key={d.id} className="border-t hover:bg-muted/30">
                <td className="p-3 flex items-center gap-2"><FileText className="h-4 w-4 text-slate-brand" />{d.name}</td>
                <td className="p-3"><Badge variant="secondary">{d.category}</Badge></td>
                <td className="p-3 text-muted-foreground">{d.date}</td>
                <td className="p-3 text-muted-foreground">{d.size}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.success("Téléchargement…")}><Download className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { set("documents", state.documents.filter((x) => x.id !== d.id)); toast.success("Supprimé"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </>
  );
}

function ContactsTab() {
  const { state } = useStore();
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      {state.contacts.map((c) => (
        <Card key={c.id} className="soft-shadow hover-lift hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-4">
            <Badge className="gold-gradient text-primary">{c.department}</Badge>
            <div className="font-display text-lg mt-2 tracking-tight">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.role}</div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {c.phone}</div>
              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {c.email}</div>
              <div className="flex items-center gap-2"><MessageCircle className="h-3 w-3" /> {c.whatsapp}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}