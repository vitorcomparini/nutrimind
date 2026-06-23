import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MetricRow = {
  id: string;
  mentee_id: string;
  month_year: string; // 'YYYY-MM'
  revenue: number;
  patients_count: number;
  notes: string | null;
};

export type MetricWithDeltas = MetricRow & {
  ticket_medio: number;
  prev_revenue: number | null;
  prev_patients: number | null;
  prev_ticket: number | null;
  baseline_revenue: number | null;
  delta_revenue_baseline_pct: number | null; // vs baseline
  delta_revenue_prev_pct: number | null; // vs período anterior (informativo)
  delta_patients_pct: number | null;
  delta_ticket_pct: number | null;
};

export const monthShort: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

export function formatMonth(monthYear: string) {
  const [y, m] = monthYear.split("-");
  return `${monthShort[m] ?? m}/${y.slice(2)}`;
}

export function currentMonthYear() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ticketMedio(revenue: number, patients: number) {
  if (!patients || patients <= 0) return 0;
  return revenue / patients;
}

function pct(curr: number, base: number | null | undefined): number | null {
  if (base == null || base === 0) return null;
  return ((curr - base) / base) * 100;
}

export function computeSeries(
  rows: MetricRow[],
  baseline: number | null,
): MetricWithDeltas[] {
  const sorted = [...rows].sort((a, b) => a.month_year.localeCompare(b.month_year));
  return sorted.map((r, i) => {
    const prev = i > 0 ? sorted[i - 1] : null;
    const ticket = ticketMedio(Number(r.revenue), r.patients_count);
    const prevTicket = prev ? ticketMedio(Number(prev.revenue), prev.patients_count) : null;
    return {
      ...r,
      revenue: Number(r.revenue),
      ticket_medio: ticket,
      prev_revenue: prev ? Number(prev.revenue) : null,
      prev_patients: prev?.patients_count ?? null,
      prev_ticket: prevTicket,
      baseline_revenue: baseline,
      delta_revenue_baseline_pct: pct(Number(r.revenue), baseline),
      delta_revenue_prev_pct: pct(Number(r.revenue), prev ? Number(prev.revenue) : null),
      delta_patients_pct: pct(r.patients_count, prev?.patients_count ?? null),
      delta_ticket_pct: pct(ticket, prevTicket),
    };
  });
}

export function useMenteeMetrics(menteeId: string | null) {
  const [rows, setRows] = useState<MetricRow[]>([]);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!menteeId) return;
    setLoading(true);
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from("mentee_metrics").select("*").eq("mentee_id", menteeId).order("month_year"),
      supabase.from("profiles").select("baseline_revenue, avatar_url, full_name").eq("id", menteeId).maybeSingle(),
    ]);
    setRows((m ?? []) as MetricRow[]);
    const prof = p as { baseline_revenue: number | null; avatar_url: string | null; full_name: string } | null;
    setBaseline(prof?.baseline_revenue != null ? Number(prof.baseline_revenue) : null);
    setAvatarUrl(prof?.avatar_url ?? null);
    setFullName(prof?.full_name ?? "");
    setLoading(false);
  }, [menteeId]);

  useEffect(() => { refresh(); }, [refresh]);

  const series = computeSeries(rows, baseline);
  const latest = series[series.length - 1] ?? null;

  return { rows, series, latest, baseline, avatarUrl, fullName, loading, refresh };
}

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatBRLFull = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
