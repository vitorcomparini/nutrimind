import type { LucideIcon } from "lucide-react";
import { AlertTriangle, MessageSquare, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import {
  type Mentee, type IndicatorDef,
  getStatusFromScore,
} from "@/lib/engagement-data";

/* ---------- KPICard ---------- */
export function KPICard({
  title, value, subtitle, icon: Icon, variant = "default", progress,
}: {
  title: string; value: string | number; subtitle?: string; icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger"; progress?: number;
}) {
  const valueColor = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  }[variant];
  const iconBg = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
  }[variant];
  const barColor = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  }[variant];
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={cn("text-3xl font-bold font-serif", valueColor)}>{value}</p>
            {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
          </div>
        </div>
        <div className={cn("p-3 rounded-lg", iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

/* ---------- StatusDistributionChart ---------- */
const STATUS_COLORS = {
  active: "oklch(0.62 0.16 145)",
  attention: "oklch(0.72 0.16 75)",
  risk: "oklch(0.6 0.2 27)",
  critical: "oklch(0.45 0.2 27)",
};
const STATUS_LABELS = { active: "Ativo", attention: "Atenção", risk: "Em Risco", critical: "Crítico" };

export function StatusDistributionChart({ mentees, getMenteeScore }: {
  mentees: Mentee[]; getMenteeScore: (id: string) => number;
}) {
  const counts = { active: 0, attention: 0, risk: 0, critical: 0 };
  mentees.forEach((m) => { counts[getStatusFromScore(getMenteeScore(m.id))]++; });
  const data = Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => ({
    name: STATUS_LABELS[k as keyof typeof STATUS_LABELS],
    value: v,
    color: STATUS_COLORS[k as keyof typeof STATUS_COLORS],
  }));
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <h3 className="font-serif text-xl text-primary">Distribuição por Status</h3>
      <p className="text-sm text-muted-foreground mb-4">Mentorados ativos por categoria de engajamento</p>
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- EngagementChart ---------- */
export function EngagementChart({ engagementHistory }: { engagementHistory: { label: string; score: number }[] }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <h3 className="font-serif text-xl text-primary">Evolução do Engajamento</h3>
      <p className="text-sm text-muted-foreground mb-4">Score médio nos últimos 6 meses</p>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={engagementHistory}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- PerformanceByIndicator ---------- */
export function PerformanceByIndicator({ mentees, indicators, getMenteeIndicators }: {
  mentees: Mentee[]; indicators: IndicatorDef[]; getMenteeIndicators: (id: string) => Record<string, boolean>;
}) {
  const active = indicators.filter((i) => i.isActive);
  const pct = (id: string) => {
    if (mentees.length === 0) return 0;
    const c = mentees.filter((m) => getMenteeIndicators(m.id)[id] === true).length;
    return Math.round((c / mentees.length) * 100);
  };
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <h3 className="font-serif text-xl text-primary">Performance por Indicador</h3>
      <p className="text-sm text-muted-foreground mb-4">% de mentorados que cumpriram cada indicador</p>
      <div className="space-y-4">
        {active.map((ind) => {
          const v = pct(ind.id);
          return (
            <div key={ind.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ind.icon}</span>
                  <span className="text-sm font-medium">{ind.name}</span>
                </div>
                <span className="text-sm font-semibold text-primary">{v}%</span>
              </div>
              <Progress value={v} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- PriorityActions ---------- */
export function PriorityActions({ mentees, getMenteeScore }: {
  mentees: Mentee[]; getMenteeScore: (id: string) => number;
}) {
  const atRisk = mentees
    .map((m) => ({ ...m, score: getMenteeScore(m.id), status: getStatusFromScore(getMenteeScore(m.id)) }))
    .filter((m) => m.status === "risk" || m.status === "critical")
    .sort((a, b) => a.score - b.score);

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-xl text-primary">Ações Prioritárias</h3>
          <p className="text-sm text-muted-foreground">Mentorados que precisam de atenção imediata</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-warning" />
      </div>
      <div className="space-y-3 max-h-[420px] overflow-y-auto">
        {atRisk.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nenhum mentorado em risco 🎉</div>
        ) : atRisk.map((m) => (
          <div key={m.id} className={cn("p-4 rounded-lg border",
            m.status === "critical" ? "bg-destructive/5 border-destructive/20" : "bg-warning/10 border-warning/30")}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-medium text-sm shrink-0",
                  m.status === "critical" ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning")}>
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Score: {m.score}/100 – {m.status === "critical" ? "Crítico" : "Em Risco"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 text-sm">{m.phone || "Sem telefone"}</PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="h-4 w-4" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 text-sm">{m.email}</PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- MenteeTable ---------- */
const statusBadge = {
  active: { label: "Ativo", cls: "bg-success/15 text-success border-success/30" },
  attention: { label: "Atenção", cls: "bg-warning/15 text-warning border-warning/30" },
  risk: { label: "Em Risco", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  critical: { label: "Crítico", cls: "bg-destructive/20 text-destructive border-destructive/40" },
};

export function MenteeTable({ mentees, indicators, getMenteeScore, getMenteeIndicators }: {
  mentees: Mentee[]; indicators: IndicatorDef[];
  getMenteeScore: (id: string) => number; getMenteeIndicators: (id: string) => Record<string, boolean>;
}) {
  const active = indicators.filter((i) => i.isActive);
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-serif text-xl text-primary">Mentorados</h3>
        <p className="text-sm text-muted-foreground">Engajamento individual no mês mais recente</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left p-3">Mentorado</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Score</th>
              <th className="text-center p-3">Indicadores</th>
              <th className="text-left p-3">Convite</th>
            </tr>
          </thead>
          <tbody>
            {mentees.map((m) => {
              const score = getMenteeScore(m.id);
              const status = getStatusFromScore(score);
              const data = getMenteeIndicators(m.id);
              const cfg = statusBadge[status];
              const sCol = score >= 71 ? "text-success" : score >= 45 ? "text-warning" : "text-destructive";
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={cn("font-medium", cfg.cls)}>{cfg.label}</Badge>
                  </td>
                  <td className="p-3">
                    <span className={cn("font-semibold", sCol)}>{score}</span>
                    <span className="text-muted-foreground text-sm"> / 100</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {active.map((ind) => (
                        <div key={ind.id}
                          className={cn("w-2.5 h-2.5 rounded-full", data[ind.id] ? "bg-success" : "bg-muted-foreground/30")}
                          title={ind.name} />
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    {m.invite_accepted_at ? (
                      <span className="text-success">Aceito</span>
                    ) : (
                      <span className="text-warning">Pendente</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {mentees.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum mentorado ativo cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- IndicatorsManager ---------- */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function IndicatorsManager({ indicators, onChange }: {
  indicators: IndicatorDef[]; onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IndicatorDef | null>(null);
  const [form, setForm] = useState({ name: "", description: "", points: 10, icon: "⭐" });

  const totalPoints = indicators.filter((i) => i.isActive).reduce((acc, i) => acc + i.points, 0);
  const activeCount = indicators.filter((i) => i.isActive).length;

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", points: 10, icon: "⭐" }); setOpen(true); };
  const openEdit = (ind: IndicatorDef) => {
    setEditing(ind);
    setForm({ name: ind.name, description: ind.description, points: ind.points, icon: ind.icon });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Nome é obrigatório");
    if (editing) {
      const { error } = await supabase.from("indicators").update({
        name: form.name, description: form.description, points: form.points, icon: form.icon,
      }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Indicador atualizado");
    } else {
      const maxOrder = indicators.reduce((m, i) => Math.max(m, i.sortOrder), 0);
      const { error } = await supabase.from("indicators").insert({
        name: form.name, description: form.description, points: form.points,
        icon: form.icon, is_active: true, sort_order: maxOrder + 1,
      });
      if (error) return toast.error(error.message);
      toast.success("Indicador criado");
    }
    setOpen(false);
    onChange();
  };

  const toggle = async (ind: IndicatorDef) => {
    await supabase.from("indicators").update({ is_active: !ind.isActive }).eq("id", ind.id);
    onChange();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este indicador? Avaliações associadas serão removidas.")) return;
    await supabase.from("indicators").delete().eq("id", id);
    toast.success("Indicador removido");
    onChange();
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-serif text-xl text-primary">Indicadores de Mentorados</h3>
          <p className="text-sm text-muted-foreground">Total: {totalPoints} pontos ({activeCount} ativos)</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Indicador
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left p-3">Indicador</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-right p-3">Pontos</th>
              <th className="text-center p-3">Ativo</th>
              <th className="text-center p-3"></th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind) => (
              <tr key={ind.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ind.icon}</span>
                    <span className="font-medium">{ind.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{ind.description}</td>
                <td className="p-3 text-right font-semibold">{ind.points}</td>
                <td className="p-3 text-center">
                  <Switch checked={ind.isActive} onCheckedChange={() => toggle(ind)} />
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ind)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(ind.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Indicador" : "Novo Indicador"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-1">
                <Label>Ícone</Label>
                <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="📌" />
              </div>
              <div className="space-y-2 col-span-3">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Pontos</Label>
              <Input type="number" value={form.points}
                onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90">{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { ArrowRight };
