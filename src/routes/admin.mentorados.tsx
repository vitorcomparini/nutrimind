import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { inviteMember, deleteMember, resendInvite, sendPasswordReset } from "@/lib/admin.functions";
import { Trash2, UserPlus, Check, X as XIcon, ArrowRight, LayoutDashboard, Mail, KeyRound } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";

export const Route = createFileRoute("/admin/mentorados")({ component: MentoradosPage });

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  last_login_at: string | null;
  invite_accepted_at: string | null;
  created_at: string;
  role: "admin" | "mentorado";
  baseline_revenue: number | null;
  avatar_url: string | null;
};

function MentoradosPage() {
  const invite = useServerFn(inviteMember);
  const removeFn = useServerFn(deleteMember);
  const resendFn = useServerFn(resendInvite);
  const resetPwFn = useServerFn(sendPasswordReset);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"mentorado" | "admin">("mentorado");

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setRows((profiles ?? []).map((p) => ({
      ...p,
      role: adminIds.has(p.id) ? "admin" as const : "mentorado" as const,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await invite({ data: { email, full_name: name, phone, role } });
      toast.success(r.alreadyExisted ? "Mentorado já existia, dados atualizados." : "Convite enviado por e-mail.");
      setEmail(""); setName(""); setPhone(""); setRole("mentorado"); setOpen(false);
      load();
    } catch (err) {
      toast.error((err as Error).message ?? "Erro ao convidar");
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (id: string, v: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: v }).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((p) => p.map((r) => r.id === id ? { ...r, is_active: v } : r));
  };

  const toggleRole = async (id: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      await supabase.from("user_roles").upsert({ user_id: id, role: "admin" }, { onConflict: "user_id,role" });
      await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "mentorado");
    } else {
      await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
      await supabase.from("user_roles").upsert({ user_id: id, role: "mentorado" }, { onConflict: "user_id,role" });
    }
    load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Excluir ${name}? Essa ação não pode ser desfeita.`)) return;
    try {
      await removeFn({ data: { user_id: id } });
      toast.success("Mentorado excluído.");
      load();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">Equipe & mentorados</span>
          <h1 className="font-serif text-4xl mt-2 text-primary">Mentorados</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {rows.length} cadastros · {rows.filter((r) => r.role === "mentorado" && r.is_active).length} mentorados ativos
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><UserPlus className="h-4 w-4 mr-2" /> Novo mentorado</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Convidar para a plataforma</DialogTitle></DialogHeader>
            <form onSubmit={submitInvite} className="space-y-4">
              <div>
                <Label>Nome completo</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="mt-2" />
              </div>
              <div>
                <Label>Atribuição</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "mentorado")}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentorado">Mentorado (cliente)</SelectItem>
                    <SelectItem value="admin">Admin / equipe</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  O mentorado já aparece na lista de engajamento mesmo antes de aceitar o convite.
                </p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
                {submitting ? "Enviando convite..." : "Enviar convite por e-mail"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left p-3">Mentorado</th>
                <th className="text-left p-3">Contato</th>
                <th className="text-left p-3">Atribuição</th>
                <th className="text-left p-3">Convite</th>
                <th className="text-left p-3">Faturamento médio<br/><span className="text-[10px] normal-case font-normal">últimos 3 meses</span></th>
                <th className="text-center p-3">Ativo</th>
                <th className="text-center p-3">Dashboard</th>
                <th className="text-center p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <MentoradoRow
                  key={r.id}
                  row={r}
                  onChange={load}
                  onToggleActive={(v) => toggleActive(r.id, v)}
                  onToggleRole={(makeAdmin) => toggleRole(r.id, makeAdmin)}
                  onRemove={() => remove(r.id, r.full_name || r.email)}
                  onResend={async () => {
                    try {
                      await resendFn({ data: { user_id: r.id } });
                      toast.success("Novo convite enviado por e-mail.");
                    } catch (err) { toast.error((err as Error).message ?? "Falha ao reenviar"); }
                  }}
                  onResetPassword={async () => {
                    try {
                      await resetPwFn({ data: { user_id: r.id } });
                      toast.success("E-mail de redefinição de senha enviado.");
                    } catch (err) { toast.error((err as Error).message ?? "Falha ao enviar"); }
                  }}
                />
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Nenhum mentorado cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MentoradoRow({ row, onChange, onToggleActive, onToggleRole, onRemove, onResend, onResetPassword }: {
  row: Row;
  onChange: () => void;
  onToggleActive: (v: boolean) => void;
  onToggleRole: (makeAdmin: boolean) => void;
  onRemove: () => void;
  onResend: () => void | Promise<void>;
  onResetPassword: () => void | Promise<void>;
}) {
  const [resending, setResending] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [editingBaseline, setEditingBaseline] = useState(false);
  const [baselineValue, setBaselineValue] = useState(
    row.baseline_revenue != null ? String(row.baseline_revenue) : ""
  );
  const [savingBaseline, setSavingBaseline] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(row.avatar_url);

  const saveBaseline = async () => {
    const val = baselineValue.trim() === "" ? null : Number(baselineValue.replace(",", "."));
    if (val != null && (isNaN(val) || val < 0)) { toast.error("Valor inválido."); return; }
    setSavingBaseline(true);
    const { error } = await supabase.from("profiles").update({ baseline_revenue: val }).eq("id", row.id);
    setSavingBaseline(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Faturamento médio atualizado.");
    setEditingBaseline(false);
    onChange();
  };

  const initials = (row.full_name || row.email).split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <tr className="border-t border-border align-top">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhotoOpen(true)}
            className="rounded-full overflow-hidden bg-muted border border-border h-10 w-10 flex items-center justify-center text-xs text-primary font-medium hover:border-primary shrink-0"
            title="Trocar foto"
          >
            {avatarUrl ? <img src={avatarUrl} alt={row.full_name} className="w-full h-full object-cover" /> : initials}
          </button>
          <button
            type="button"
            onClick={() => setPhotoOpen(true)}
            className="font-medium text-primary hover:underline text-left"
          >
            {row.full_name || "—"}
          </button>
        </div>
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Foto de {row.full_name || row.email}</DialogTitle></DialogHeader>
            <AvatarUpload
              userId={row.id}
              currentUrl={avatarUrl}
              fullName={row.full_name || row.email}
              onUploaded={(url) => { setAvatarUrl(url); }}
            />
          </DialogContent>
        </Dialog>
      </td>
      <td className="p-3 text-muted-foreground text-xs">
        <div>{row.email}</div>
        <div>{row.phone || "—"}</div>
        <div className="mt-1 text-[11px] text-muted-foreground/80">
          {row.last_login_at
            ? `Acessou pela última vez ${new Date(row.last_login_at).toLocaleDateString("pt-BR")}, às ${new Date(row.last_login_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} hrs`
            : "Nunca acessou"}
        </div>
      </td>
      <td className="p-3">
        <Select value={row.role} onValueChange={(v) => onToggleRole(v === "admin")}>
          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mentorado">Mentorado</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        {row.invite_accepted_at ? (
          <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15">Aceito</Badge>
        ) : (
          <div className="flex flex-col items-start gap-1.5">
            <Badge variant="outline" className="text-warning border-warning/40 bg-warning/10">Pendente</Badge>
            <button
              type="button"
              disabled={resending}
              onClick={async () => {
                setResending(true);
                try { await onResend(); } finally { setResending(false); }
              }}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
              title="Reenviar e-mail de convite"
            >
              <Mail className="h-3 w-3" />
              {resending ? "Reenviando..." : "Reenviar convite"}
            </button>
          </div>
        )}
      </td>
      <td className="p-3">
        {editingBaseline ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={baselineValue}
              onChange={(e) => setBaselineValue(e.target.value)}
              placeholder="Ex.: 35000"
              className="h-8 w-28"
            />
            <button onClick={saveBaseline} disabled={savingBaseline} className="text-success p-1"><Check className="h-4 w-4" /></button>
            <button onClick={() => { setEditingBaseline(false); setBaselineValue(row.baseline_revenue != null ? String(row.baseline_revenue) : ""); }} className="text-muted-foreground p-1"><XIcon className="h-4 w-4" /></button>
          </div>
        ) : (
          <button
            onClick={() => setEditingBaseline(true)}
            className="text-left text-sm hover:text-primary"
            title="Clique para editar"
          >
            {row.baseline_revenue != null
              ? Number(row.baseline_revenue).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
              : <span className="text-muted-foreground italic">não informado</span>}
          </button>
        )}
      </td>
      <td className="p-3 text-center">
        <Switch checked={row.is_active} onCheckedChange={onToggleActive} />
      </td>
      <td className="p-3 text-center">
        <Link
          to="/admin/mentorado/$id"
          params={{ id: row.id }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          title="Ver dashboard do mentorado"
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Ver dash <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </td>
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={resettingPw}
            onClick={async () => {
              if (!confirm(`Enviar e-mail de redefinição de senha para ${row.email}?`)) return;
              setResettingPw(true);
              try { await onResetPassword(); } finally { setResettingPw(false); }
            }}
            className="text-primary hover:opacity-70 disabled:opacity-50"
            title="Enviar e-mail de redefinição de senha"
          >
            <KeyRound className="h-4 w-4" />
          </button>
          <button onClick={onRemove} className="text-destructive hover:opacity-70" title="Excluir mentorado">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
