import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Mentee {
  id: string;
  name: string;
  email: string;
  phone: string;
  invite_accepted_at: string | null;
}

export interface IndicatorDef {
  id: string;
  name: string;
  description: string;
  points: number;
  isActive: boolean;
  icon: string;
  sortOrder: number;
}

export interface EvaluationRow {
  month_year: string;
  mentee_id: string;
  indicator_id: string;
  completed: boolean;
}

export interface MenteeEvaluation {
  menteeId: string;
  indicators: Record<string, boolean>;
  totalScore: number;
}

export interface MonthlyEvaluation {
  monthYear: string;
  evaluations: MenteeEvaluation[];
}

export type MenteeStatus = "active" | "attention" | "risk" | "critical";

export function getStatusFromScore(score: number): MenteeStatus {
  if (score >= 71) return "active";
  if (score >= 45) return "attention";
  if (score >= 20) return "risk";
  return "critical";
}

const monthLabels: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

function buildMonthly(rawEvals: EvaluationRow[], indicators: IndicatorDef[]): MonthlyEvaluation[] {
  const byMonth: Record<string, Record<string, Record<string, boolean>>> = {};
  rawEvals.forEach((ev) => {
    if (!byMonth[ev.month_year]) byMonth[ev.month_year] = {};
    if (!byMonth[ev.month_year][ev.mentee_id]) byMonth[ev.month_year][ev.mentee_id] = {};
    byMonth[ev.month_year][ev.mentee_id][ev.indicator_id] = ev.completed;
  });
  return Object.entries(byMonth).map(([monthYear, menteeMap]) => ({
    monthYear,
    evaluations: Object.entries(menteeMap).map(([menteeId, indMap]) => {
      const totalScore = indicators.reduce((acc, ind) => {
        if (ind.isActive && indMap[ind.id]) return acc + ind.points;
        return acc;
      }, 0);
      return { menteeId, indicators: indMap, totalScore };
    }),
  }));
}

export function buildEngagementHistory(monthly: MonthlyEvaluation[]) {
  return monthly
    .map((me) => {
      const total = me.evaluations.reduce((a, e) => a + e.totalScore, 0);
      const avg = me.evaluations.length > 0 ? Math.round(total / me.evaluations.length) : 0;
      const monthNum = me.monthYear.split("-")[1];
      return { monthYear: me.monthYear, label: monthLabels[monthNum] || monthNum, score: avg };
    })
    .sort((a, b) => a.monthYear.localeCompare(b.monthYear))
    .slice(-6);
}

export function useEngagementData() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [indicators, setIndicators] = useState<IndicatorDef[]>([]);
  const [rawEvals, setRawEvals] = useState<EvaluationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [{ data: roles }, { data: profiles }, { data: inds }, { data: evs }] = await Promise.all([
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("profiles").select("id, full_name, email, phone, invite_accepted_at, is_active").order("full_name"),
      supabase.from("indicators").select("*").order("sort_order"),
      supabase.from("evaluations").select("month_year, mentee_id, indicator_id, completed"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    const menteeIds = new Set((roles ?? []).filter((r) => r.role === "mentorado").map((r) => r.user_id));
    setMentees((profiles ?? [])
      .filter((p) => menteeIds.has(p.id) && !adminIds.has(p.id) && p.is_active)
      .map((p) => ({
        id: p.id,
        name: p.full_name || p.email,
        email: p.email,
        phone: p.phone ?? "",
        invite_accepted_at: p.invite_accepted_at,
      })));
    setIndicators((inds ?? []).map((i) => ({
      id: i.id, name: i.name, description: i.description, points: i.points,
      isActive: i.is_active, icon: i.icon, sortOrder: i.sort_order,
    })));
    setRawEvals((evs ?? []) as EvaluationRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const evaluations = buildMonthly(rawEvals, indicators);
  const engagementHistory = buildEngagementHistory(evaluations);

  const getLatest = () => {
    if (evaluations.length === 0) return undefined;
    return [...evaluations].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
  };

  const getMenteeScore = (menteeId: string) => {
    const latest = getLatest();
    return latest?.evaluations.find((e) => e.menteeId === menteeId)?.totalScore ?? 0;
  };

  const getMenteeIndicators = (menteeId: string): Record<string, boolean> => {
    const latest = getLatest();
    return latest?.evaluations.find((e) => e.menteeId === menteeId)?.indicators ?? {};
  };

  const getEvaluationForMonth = (monthYear: string) =>
    evaluations.find((e) => e.monthYear === monthYear);

  const saveEvaluation = async (ev: MonthlyEvaluation, evaluatedBy: string) => {
    await supabase.from("evaluations").delete().eq("month_year", ev.monthYear);
    const rows: { month_year: string; mentee_id: string; indicator_id: string; completed: boolean; evaluated_by: string }[] = [];
    ev.evaluations.forEach((me) => {
      Object.entries(me.indicators).forEach(([indId, completed]) => {
        rows.push({
          month_year: ev.monthYear,
          mentee_id: me.menteeId,
          indicator_id: indId,
          completed,
          evaluated_by: evaluatedBy,
        });
      });
    });
    if (rows.length > 0) await supabase.from("evaluations").insert(rows);
    await fetchAll();
  };

  return {
    mentees, indicators, evaluations, engagementHistory,
    loading, refresh: fetchAll,
    getLatest, getMenteeScore, getMenteeIndicators, getEvaluationForMonth,
    saveEvaluation,
  };
}
