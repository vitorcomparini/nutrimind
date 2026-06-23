import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useEngagementData, type MenteeEvaluation } from "@/lib/engagement-data";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/avaliar")({ component: AvaliarPage });

const months = [
  ["01", "Janeiro"], ["02", "Fevereiro"], ["03", "Março"], ["04", "Abril"],
  ["05", "Maio"], ["06", "Junho"], ["07", "Julho"], ["08", "Agosto"],
  ["09", "Setembro"], ["10", "Outubro"], ["11", "Novembro"], ["12", "Dezembro"],
] as const;
const years = ["2025", "2026", "2027"];

function AvaliarPage() {
  const d = useEngagementData();
  const { user } = useAuth();
  const nav = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const monthYear = `${year}-${month}`;
  const activeIndicators = useMemo(() => d.indicators.filter((i) => i.isActive), [d.indicators]);

  const [evalData, setEvalData] = useState<Record<string, Record<string, boolean>>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate when data loads or month changes
  useMemo(() => {
    if (d.loading) return;
    const ex = d.getEvaluationForMonth(monthYear);
    const data: Record<string, Record<string, boolean>> = {};
    d.mentees.forEach((m) => {
      const e = ex?.evaluations.find((x) => x.menteeId === m.id);
      data[m.id] = {};
      activeIndicators.forEach((ind) => { data[m.id][ind.id] = e?.indicators[ind.id] ?? false; });
    });
    setEvalData(data);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.loading, monthYear, d.mentees.length, activeIndicators.length]);

  const toggle = (mid: string, iid: string) => {
    setEvalData((p) => ({ ...p, [mid]: { ...p[mid], [iid]: !p[mid]?.[iid] } }));
  };

  const calcScore = (mid: string) =>
    activeIndicators.reduce((acc, ind) => acc + (evalData[mid]?.[ind.id] ? ind.points : 0), 0);

  const save = async () => {
    if (!user) return;
    const evaluations: MenteeEvaluation[] = d.mentees.map((m) => ({
      menteeId: m.id,
      indicators: evalData[m.id] || {},
      totalScore: calcScore(m.id),
    }));
    await d.saveEvaluation({ monthYear, evaluations }, user.id);
    toast.success(`Avaliação de ${months.find((m) => m[0] === month)?.[1]} ${year} salva.`);
    nav({ to: "/admin/engajamento" });
  };

  if (d.loading || !hydrated) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => nav({ to: "/admin/engajamento" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <span className="eyebrow">Avaliação mensal</span>
            <h1 className="font-serif text-3xl text-primary mt-1">Avaliar Mês</h1>
            <p className="text-sm text-muted-foreground">Marque os indicadores cumpridos por cada mentorado</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={save}>
            <Save className="h-4 w-4" /> Salvar Avaliação
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-260px)] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20 bg-muted">
              <tr>
                <th className="sticky left-0 z-30 bg-muted text-left p-3 min-w-[200px]">Mentorado</th>
                {activeIndicators.map((ind) => (
                  <th key={ind.id} className="text-center p-3 min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{ind.icon}</span>
                      <span className="text-xs leading-tight">{ind.name}</span>
                      <span className="text-xs text-muted-foreground">{ind.points} pts</span>
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 min-w-[80px]">Score</th>
                <th className="text-center p-3 min-w-[80px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.mentees.map((m) => {
                const score = calcScore(m.id);
                const status = score >= 71 ? "Ativo" : score >= 45 ? "Atenção" : score >= 20 ? "Em Risco" : "Crítico";
                const col = score >= 71 ? "text-success" : score >= 45 ? "text-warning" : "text-destructive";
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="sticky left-0 z-10 bg-card p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-sm">{m.name}</span>
                      </div>
                    </td>
                    {activeIndicators.map((ind) => (
                      <td key={ind.id} className="text-center p-3">
                        <div className="flex justify-center">
                          <Switch checked={evalData[m.id]?.[ind.id] ?? false}
                            onCheckedChange={() => toggle(m.id, ind.id)} />
                        </div>
                      </td>
                    ))}
                    <td className="text-center p-3"><span className={`font-bold text-lg ${col}`}>{score}</span></td>
                    <td className="text-center p-3"><span className={`text-sm font-medium ${col}`}>{status}</span></td>
                  </tr>
                );
              })}
              {d.mentees.length === 0 && (
                <tr><td colSpan={activeIndicators.length + 3} className="p-6 text-center text-muted-foreground">
                  Nenhum mentorado ativo. Cadastre em "Mentorados".
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
