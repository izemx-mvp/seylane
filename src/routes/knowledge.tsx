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
            {slice.map((f) => (
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
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={filtered.length} />


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
  const { state, set } = useStore();
  const [edit, setEdit] = useState<ServiceFiche | null>(null);
  const [showNew, setShowNew] = useState(false);
  const empty = { brand: "", tag: "", description: "", benefits: "" };
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(9);

  const items = (state.serviceFiches ?? []).filter((s) => `${s.brand} ${s.tag} ${s.description}`.toLowerCase().includes(q.toLowerCase()));
  const { slice, pageCount } = usePagination(items, pageSize, page);

  const openNew = () => { setForm(empty); setShowNew(true); };
  const openEdit = (s: ServiceFiche) => { setEdit(s); setForm({ brand: s.brand, tag: s.tag, description: s.description, benefits: s.benefits.join("\n") }); };
  const close = () => { setEdit(null); setShowNew(false); };
  const save = () => {
    if (!form.brand.trim() || !form.tag.trim()) { toast.error("Marque et titre requis"); return; }
    const benefits = form.benefits.split("\n").map((b) => b.trim()).filter(Boolean);
    if (edit) {
      set("serviceFiches", (state.serviceFiches ?? []).map((s) => s.id === edit.id ? { ...s, ...form, benefits } : s));
      toast.success("Fiche mise à jour");
    } else {
      set("serviceFiches", [{ id: `sf-${Date.now()}`, brand: form.brand, tag: form.tag, description: form.description, benefits }, ...(state.serviceFiches ?? [])]);
      toast.success("Fiche créée");
    }
    close();
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une fiche…" className="pl-9" /></div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nouvelle fiche</Button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {slice.map((s) => (
          <Card key={s.id} className="overflow-hidden soft-shadow hover-lift hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-5">
              <Badge className="gold-gradient text-primary mb-2">{s.brand}</Badge>
              <h3 className="font-display text-lg tracking-tight">{s.tag}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{s.description}</p>
              <div className="mt-3">
                <div className="text-xs font-semibold mb-1">Bénéfices</div>
                <ul className="text-xs space-y-1 text-muted-foreground">{s.benefits.map((b) => <li key={b}>• {b}</li>)}</ul>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(s)}><Edit3 className="h-3 w-3 mr-1" /> Modifier</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer cette fiche ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => { set("serviceFiches", (state.serviceFiches ?? []).filter((x) => x.id !== s.id)); toast.success("Supprimé"); }}>Supprimer</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-10 text-sm">Aucune fiche.</div>}
      </div>
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={items.length} />

      <Dialog open={!!edit || showNew} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit ? "Modifier la fiche" : "Nouvelle fiche"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Marque</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Seylane Executive" /></div>
            <div><Label>Titre / positionnement</Label><Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Bénéfices (un par ligne)</Label><Textarea rows={4} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></div>
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

function DocsTab() {
  const { state, set } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10);
  const items = state.documents.filter((d) => `${d.name} ${d.category}`.toLowerCase().includes(q.toLowerCase()));
  const { slice, pageCount } = usePagination(items, pageSize, page);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const doc: DocFile = {
        id: `doc-${Date.now()}`, name: file.name, category: file.type.split("/")[0] || "Fichier",
        date: new Date().toISOString().slice(0, 10),
        size: file.size > 1e6 ? `${(file.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        dataUrl: reader.result as string,
      };
      set("documents", [doc, ...state.documents]);
      toast.success(`${file.name} uploadé`);
    };
    reader.readAsDataURL(file);
  };

  const download = (d: DocFile) => {
    if (!d.dataUrl) { toast.info("Aperçu simulé — fichier de démonstration"); return; }
    const a = document.createElement("a"); a.href = d.dataUrl; a.download = d.name; a.click();
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un document…" className="pl-9" /></div>
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <Button onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Uploader</Button>
      </div>
      <Card className="soft-shadow overflow-hidden"><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider"><tr>{["Nom", "Catégorie", "Date", "Taille", ""].map((h) => <th key={h} className="text-left p-3">{h}</th>)}</tr></thead>
          <tbody>
            {slice.map((d) => (
              <tr key={d.id} className="border-t hover:bg-muted/30">
                <td className="p-3 flex items-center gap-2"><FileText className="h-4 w-4 text-slate-brand" />{d.name}</td>
                <td className="p-3"><Badge variant="secondary">{d.category}</Badge></td>
                <td className="p-3 text-muted-foreground">{d.date}</td>
                <td className="p-3 text-muted-foreground">{d.size}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => download(d)}><Download className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => { set("documents", state.documents.filter((x) => x.id !== d.id)); toast.success("Supprimé"); }}>Supprimer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground text-sm">Aucun document.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={items.length} />
    </>
  );
}

function ContactsTab() {
  const { state, set } = useStore();
  const empty = { department: "Direction", name: "", role: "", phone: "", email: "", whatsapp: "" };
  const [form, setForm] = useState<Omit<Contact, "id">>(empty);
  const [edit, setEdit] = useState<Contact | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(9);
  const items = state.contacts.filter((c) => `${c.name} ${c.role} ${c.department} ${c.email}`.toLowerCase().includes(q.toLowerCase()));
  const { slice, pageCount } = usePagination(items, pageSize, page);

  const openNew = () => { setForm(empty); setShowNew(true); };
  const openEdit = (c: Contact) => { setEdit(c); setForm({ department: c.department, name: c.name, role: c.role, phone: c.phone, email: c.email, whatsapp: c.whatsapp }); };
  const close = () => { setEdit(null); setShowNew(false); };
  const save = () => {
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    if (edit) { set("contacts", state.contacts.map((c) => c.id === edit.id ? { ...c, ...form } : c)); toast.success("Contact mis à jour"); }
    else { set("contacts", [{ id: `ct-${Date.now()}`, ...form }, ...state.contacts]); toast.success("Contact créé"); }
    close();
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un contact…" className="pl-9" /></div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nouveau contact</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {slice.map((c) => (
          <Card key={c.id} className="soft-shadow hover-lift hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <Badge className="gold-gradient text-primary">{c.department}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Supprimer ce contact ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => { set("contacts", state.contacts.filter((x) => x.id !== c.id)); toast.success("Supprimé"); }}>Supprimer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
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
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-10 text-sm">Aucun contact.</div>}
      </div>
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={items.length} />

      <Dialog open={!!edit || showNew} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit ? "Modifier le contact" : "Nouveau contact"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rôle</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              <div><Label>Département</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Direction", "Executive", "Staffing", "Advisory", "Support"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
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
