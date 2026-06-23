import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Target, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEngagementData, getStatusFromScore } from "@/lib/engagement-data";
import {
  KPICard, StatusDistributionChart, EngagementChart,
  PerformanceByIndicator, PriorityActions, MenteeTable, IndicatorsManager,
} from "@/components/engagement/dashboard-parts";

export const Route = createFileRoute("/admin/engajamento")({ component: EngajamentoPage });

function EngajamentoPage() {
  const d = useEngagementData();

  const counts = { active: 0, attention: 0, risk: 0, critical: 0 };
  d.mentees.forEach((m) => { counts[getStatusFromScore(d.getMenteeScore(m.id))]++; });
  const totalScore = d.mentees.reduce((acc, m) => acc + d.getMenteeScore(m.id), 0);
  const avg = d.mentees.length > 0 ? Math.round(totalScore / d.mentees.length) : 0;
  const atRisk = counts.risk + counts.critical;

  const latest = d.getLatest();
  const activeInd = d.indicators.filter((i) => i.isActive);
  let marked = 0, possible = 0;
  if (latest) {
    latest.evaluations.forEach((ev) => {
      activeInd.forEach((ind) => { possible++; if (ev.indicators[ind.id]) marked++; });
    });
  }
  const rate = possible > 0 ? Math.round((marked / possible) * 100) : 0;
  const month = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  if (d.loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Avaliação</span>
          <h1 className="font-serif text-4xl mt-2 text-primary">Engajamento dos mentorados</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do programa – {month}</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
          <Link to="/admin/avaliar"><Calendar className="h-4 w-4" /> Avaliar Mês Atual</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Mentorados Ativos" value={counts.active}
          subtitle={`${d.mentees.length} no programa`} icon={Users} variant="success" />
        <KPICard title="Engajamento Médio" value={avg} subtitle="/ 100" icon={Target} />
        <KPICard title="Em Risco" value={atRisk} subtitle="Atenção imediata" icon={AlertTriangle} variant="danger" />
        <KPICard title="Taxa de Engajamento" value={`${rate}%`} icon={TrendingUp} progress={rate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart mentees={d.mentees} getMenteeScore={d.getMenteeScore} />
        <EngagementChart engagementHistory={d.engagementHistory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceByIndicator mentees={d.mentees} indicators={d.indicators} getMenteeIndicators={d.getMenteeIndicators} />
        <PriorityActions mentees={d.mentees} getMenteeScore={d.getMenteeScore} />
      </div>

      <MenteeTable mentees={d.mentees} indicators={d.indicators}
        getMenteeScore={d.getMenteeScore} getMenteeIndicators={d.getMenteeIndicators} />

      <IndicatorsManager indicators={d.indicators} onChange={d.refresh} />
    </div>
  );
}
