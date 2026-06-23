import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Wallet, Users, Tag, Lightbulb, Edit3 } from "lucide-react";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import {
  useMenteeMetrics, formatMonth, currentMonthYear, ticketMedio, formatBRL, formatBRLFull,
} from "@/lib/mentee-metrics";

type Props = {
  menteeId: string;
  greetingName: string;
  canEdit: boolean; // mentee himself or admin
  isAdminView?: boolean;
};

export function MenteeDashboard({ menteeId, greetingName, canEdit, isAdminView }: Props) {
  const { rows, series, latest, baseline, avatarUrl, fullName, loading, refresh } = useMenteeMetrics(menteeId);
  const [open, setOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<string>(currentMonthYear());
  const [revenue, setRevenue] = useState("");
  const [patients, setPatients] = useState("");
  const [saving, setSaving] = useState(false);

  const chartData = useMemo(
    () => series.slice(-12).map((s) => ({
      month: formatMonth(s.month_year),
      faturamento: Number(s.revenue),
      pacientes: s.patients_count,
      ticket: Math.round(s.ticket_medio),
    })),
    [series],
  );

  const startEdit = (monthYear: string) => {
    const existing = rows.find((r) => r.month_year === monthYear);
    setEditingMonth(monthYear);
    setRevenue(existing ? String(existing.revenue) : "");
    setPatients(existing ? String(existing.patients_count) : "");
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = Number(revenue.replace(",", "."));
    const p = Number(patients);
    if (isNaN(r) || r < 0) { toast.error("Faturamento inválido."); return; }
    if (isNaN(p) || p < 0) { toast.error("Número de pacientes inválido."); return; }
    setSaving(true);
    const { error } = await supabase.from("mentee_metrics").upsert(
      { mentee_id: menteeId, month_year: editingMonth, revenue: r, patients_count: p },
      { onConflict: "mentee_id,month_year" },
    );
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Resultado registrado.");
    setOpen(false);
    refresh();
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  const avatarInitials = (fullName || greetingName || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const baselineSet = baseline != null && baseline > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center text-primary font-serif h-14 w-14 text-xl">
            {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : <span>{avatarInitials}</span>}
          </div>
          <div>
            <h1 className="font-serif text-3xl text-primary">Olá, {greetingName.split(" ")[0]}! 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdminView ? "Visão do mentor sobre os resultados deste mentorado." : "Acompanhe sua evolução mês a mês."}
            </p>
          </div>
        </div>
      </header>

      {!baselineSet && (
        <Card className="p-5 border-warning/40 bg-warning/5">
          <p className="text-sm">
            <strong>Faturamento médio inicial não cadastrado.</strong>{" "}
            {isAdminView
              ? "Defina na linha do mentorado em Admin → Mentorados."
              : "Peça ao seu mentor para cadastrar o faturamento médio dos seus últimos 3 meses para começarmos a acompanhar a sua evolução."}
          </p>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          icon={<Wallet className="h-5 w-5" />}
          label="Faturamento do mês"
          value={latest ? formatBRL(latest.revenue) : "—"}
          deltaPct={latest?.delta_revenue_baseline_pct ?? null}
          deltaLabel="vs faturamento médio inicial"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Pacientes atendidos"
          value={latest ? String(latest.patients_count) : "—"}
          deltaPct={latest?.delta_patients_pct ?? null}
          deltaLabel="vs mês anterior"
        />
        <KpiCard
          icon={<Tag className="h-5 w-5" />}
          label="Ticket médio"
          value={latest ? formatBRL(latest.ticket_medio) : "—"}
          deltaPct={latest?.delta_ticket_pct ?? null}
          deltaLabel="vs mês anterior"
        />
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-serif text-xl text-primary uppercase tracking-wide text-sm">Evolução do faturamento</h2>
          {baselineSet && (
            <span className="text-xs text-muted-foreground">
              Base inicial: <strong className="text-foreground">{formatBRL(baseline!)}</strong>
            </span>
          )}
        </div>
        {chartData.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Ainda não há resultados registrados.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary, 0 0% 0%))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary, 0 0% 0%))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 50)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.48 0.03 35)" fontSize={12} />
                <YAxis stroke="oklch(0.48 0.03 35)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => formatBRLFull(v)}
                  contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.02 50)", borderRadius: 8 }}
                />
                {baselineSet && (
                  <Line
                    type="monotone"
                    dataKey={() => baseline}
                    stroke="oklch(0.55 0.13 32)"
                    strokeDasharray="6 4"
                    dot={false}
                    name="Base inicial"
                  />
                )}
                <Area type="monotone" dataKey="faturamento" stroke="oklch(0.46 0.13 32)" strokeWidth={2.5} fill="url(#grad)" name="Faturamento" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Register results */}
      {canEdit && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h2 className="font-serif text-xl text-primary uppercase tracking-wide text-sm">Registrar resultado</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Informe o faturamento e o número de pacientes atendidos no mês. O ticket médio é calculado automaticamente.
          </p>
          {!open ? (
            <Button onClick={() => startEdit(currentMonthYear())} className="bg-primary hover:bg-primary/90">
              <Edit3 className="h-4 w-4 mr-2" /> Registrar mês atual
            </Button>
          ) : (
            <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Mês</Label>
                <Input type="month" value={editingMonth} onChange={(e) => startEdit(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Faturamento (R$)</Label>
                <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="Ex.: 48750" className="mt-2" required />
              </div>
              <div>
                <Label>Pacientes atendidos</Label>
                <Input value={patients} onChange={(e) => setPatients(e.target.value)} placeholder="Ex.: 28" type="number" min={0} className="mt-2" required />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 flex-1">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              </div>
              {revenue && patients && Number(patients) > 0 && (
                <p className="md:col-span-4 text-xs text-muted-foreground">
                  Ticket médio calculado: <strong className="text-foreground">{formatBRL(ticketMedio(Number(revenue), Number(patients)))}</strong>
                </p>
              )}
            </form>
          )}
        </Card>
      )}

      {/* History table */}
      {series.length > 0 && (
        <Card className="p-6">
          <h2 className="font-serif text-xl text-primary uppercase tracking-wide text-sm mb-4">Histórico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2">Mês</th>
                  <th className="text-right">Faturamento</th>
                  <th className="text-right">vs base</th>
                  <th className="text-right">Pacientes</th>
                  <th className="text-right">Ticket médio</th>
                  {canEdit && <th></th>}
                </tr>
              </thead>
              <tbody>
                {[...series].reverse().map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="py-3">{formatMonth(s.month_year)}</td>
                    <td className="text-right font-medium">{formatBRL(s.revenue)}</td>
                    <td className="text-right">
                      <DeltaPill value={s.delta_revenue_baseline_pct} />
                    </td>
                    <td className="text-right">{s.patients_count}</td>
                    <td className="text-right">{formatBRL(s.ticket_medio)}</td>
                    {canEdit && (
                      <td className="text-right">
                        <button onClick={() => startEdit(s.month_year)} className="text-primary text-xs hover:underline">
                          editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tip */}
      <Card className="p-5 bg-primary/5 border-primary/20">
        <div className="flex gap-4 items-start">
          <div className="bg-primary text-primary-foreground rounded-full p-3"><Lightbulb className="h-5 w-5" /></div>
          <div>
            <p className="font-serif text-lg text-primary">Dica NutriMind</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pequenas ações diárias geram grandes resultados. Mantenha o foco e a consistência.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ icon, label, value, deltaPct, deltaLabel }: {
  icon: React.ReactNode; label: string; value: string;
  deltaPct: number | null; deltaLabel: string;
}) {
  const positive = deltaPct != null && deltaPct >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="bg-primary/10 text-primary rounded-full p-3">{icon}</div>
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-3">{label}</p>
      <p className="font-serif text-3xl mt-1 text-foreground">{value}</p>
      <div className="mt-3 text-xs flex items-center gap-1">
        {deltaPct == null ? (
          <span className="text-muted-foreground">— {deltaLabel}</span>
        ) : (
          <>
            {positive
              ? <TrendingUp className="h-3.5 w-3.5 text-success" />
              : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
            <span className={positive ? "text-success font-medium" : "text-destructive font-medium"}>
              {positive ? "+" : ""}{deltaPct.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </>
        )}
      </div>
    </Card>
  );
}

function DeltaPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground text-xs">—</span>;
  const positive = value >= 0;
  return (
    <span className={`text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
      {positive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}
