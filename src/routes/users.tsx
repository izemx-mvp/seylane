import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Search, ShieldCheck, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterfaceKey, Permission, UserAccount } from "@/lib/mock-data";
import { PaginationBar, usePagination } from "@/components/pagination-bar";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Gestion des utilisateurs — Seylane" }] }),
  component: UsersPage,
});

const INTERFACES: { key: InterfaceKey; label: string }[] = [
  { key: "community-manager", label: "AI Community Manager" },
  { key: "prospection", label: "Agent IA Prospection" },
  { key: "sourcing", label: "Agent IA de Sourcing" },
  { key: "hunttool", label: "Agent IA Relance HuntTool" },
  { key: "knowledge", label: "Base de Connaissances" },
  { key: "users", label: "Gestion des utilisateurs" },
];

const ACTIONS: (keyof Permission)[] = ["read", "add", "update", "delete"];

const emptyPerms = (): Record<InterfaceKey, Permission> =>
  Object.fromEntries(INTERFACES.map((i) => [i.key, { read: false, add: false, update: false, delete: false }])) as Record<InterfaceKey, Permission>;

function UsersPage() {
  const { state, set, can } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<UserAccount | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!can("users", "read")) {
    return (
      <AppShell title="Gestion des utilisateurs">
        <div className="text-center text-muted-foreground py-20">Vous n'avez pas accès à cette interface.</div>
      </AppShell>
    );
  }

  const list = state.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const { slice, pageCount } = usePagination(list, pageSize, page);

  const openNew = () => { setShowNew(true); setEdit({ id: "", name: "", email: "", role: "collab", permissions: emptyPerms(), createdAt: "" }); };

  return (
    <AppShell title="Gestion des utilisateurs" subtitle="Administrez les accès et permissions par interface"
      actions={can("users", "add") ? <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nouvel utilisateur</Button> : undefined}>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="outline">{list.length} utilisateur(s)</Badge>
      </div>

      <Card className="soft-shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider">
                <tr>{["Utilisateur", "Email", "Rôle", "Accès", "Créé le", ""].map((h) => <th key={h} className="text-left p-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {slice.map((u) => {
                  const readable = INTERFACES.filter((i) => u.role === "admin" || u.permissions[i.key]?.read).length;
                  return (
                    <tr key={u.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full gold-gradient text-primary flex items-center justify-center text-xs font-semibold">
                            {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        {u.role === "admin"
                          ? <Badge className="gold-gradient text-primary gap-1"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
                          : <Badge variant="secondary" className="gap-1"><User className="h-3 w-3" /> Collab</Badge>}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{readable} / {INTERFACES.length} interfaces</td>
                      <td className="p-3 text-xs text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="p-3 text-right">
                        {can("users", "update") && <Button size="sm" variant="ghost" onClick={() => setEdit(u)}><Edit3 className="h-3.5 w-3.5" /></Button>}
                        {can("users", "delete") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="sm" variant="ghost"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Supprimer {u.name} ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { set("users", state.users.filter((x) => x.id !== u.id)); toast.success("Utilisateur supprimé"); }}>Supprimer</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <PaginationBar page={page} pageCount={pageCount} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} total={list.length} />

      <UserDialog
        open={!!edit || showNew}
        editing={edit}
        isNew={showNew}
        onClose={() => { setEdit(null); setShowNew(false); }}
        onSave={(u) => {
          if (showNew) {
            const created: UserAccount = { ...u, id: `u-${Date.now()}`, createdAt: new Date().toISOString() };
            set("users", [created, ...state.users]);
            toast.success("Utilisateur créé");
          } else if (edit) {
            set("users", state.users.map((x) => x.id === edit.id ? { ...edit, ...u } : x));
            toast.success("Utilisateur mis à jour");
          }
          setEdit(null); setShowNew(false);
        }}
      />
    </AppShell>
  );
}

function UserDialog({ open, editing, isNew, onClose, onSave }: {
  open: boolean; editing: UserAccount | null; isNew: boolean; onClose: () => void;
  onSave: (u: Omit<UserAccount, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "collab">("collab");
  const [perms, setPerms] = useState<Record<InterfaceKey, Permission>>(emptyPerms());

  // Sync when editing target changes
  useState(() => {
    if (editing) { setName(editing.name); setEmail(editing.email); setRole(editing.role); setPerms(editing.permissions ?? emptyPerms()); }
    return 0;
  });

  // effect-like: reset on open change
  if (open && editing && name !== editing.name && !isNew) {
    // no-op: kept simple; user can retype
  }

  const togglePerm = (k: InterfaceKey, act: keyof Permission) => {
    setPerms((cur) => {
      const cp = { ...cur[k], [act]: !cur[k][act] };
      // Rule: without read, cannot have add/update/delete
      if (!cp.read) { cp.add = false; cp.update = false; cp.delete = false; }
      return { ...cur, [k]: cp };
    });
  };

  const save = () => {
    if (!name.trim() || !email.trim()) { toast.error("Nom et email requis"); return; }
    onSave({ name, email, role, permissions: role === "admin"
      ? Object.fromEntries(INTERFACES.map((i) => [i.key, { read: true, add: true, update: true, delete: true }])) as Record<InterfaceKey, Permission>
      : perms });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-fade">
        <DialogHeader><DialogTitle>{isNew ? "Nouvel utilisateur" : editing ? `Modifier ${editing.name}` : "Utilisateur"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nom complet</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@seylane.com" /></div>
          </div>
          <div>
            <Label>Rôle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "collab")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — accès complet</SelectItem>
                <SelectItem value="collab">Collaborateur — permissions par interface</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "collab" && (
            <div className="border rounded-xl p-4 bg-muted/20">
              <div className="mb-3">
                <Label className="text-sm">Autorisations par interface</Label>
                <p className="text-xs text-muted-foreground">Sans « Lecture », l'interface est masquée et les autres actions sont désactivées.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left p-2">Interface</th>
                      {ACTIONS.map((a) => <th key={a} className="p-2 text-center capitalize">{a === "read" ? "Lecture" : a === "add" ? "Ajout" : a === "update" ? "Modif." : "Suppr."}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {INTERFACES.map((i) => {
                      const p = perms[i.key];
                      return (
                        <tr key={i.key} className="border-t">
                          <td className="p-2 font-medium">{i.label}</td>
                          {ACTIONS.map((act) => {
                            const disabled = act !== "read" && !p.read;
                            const checked = !!p[act];
                            return (
                              <td key={act} className="p-2 text-center">
                                <button type="button" disabled={disabled} onClick={() => togglePerm(i.key, act)}
                                  className={cn("w-6 h-6 rounded border inline-flex items-center justify-center transition-all",
                                    checked ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted",
                                    disabled && "opacity-30 cursor-not-allowed")}>
                                  {checked && <Check className="h-3.5 w-3.5" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
