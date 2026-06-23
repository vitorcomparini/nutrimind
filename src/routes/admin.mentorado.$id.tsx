import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenteeDashboard } from "@/components/mentee/MenteeDashboard";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/mentorado/$id")({ component: AdminMenteeView });

function AdminMenteeView() {
  const { id } = Route.useParams();
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("full_name, email").eq("id", id).maybeSingle()
      .then(({ data }) => {
        setName(data?.full_name || data?.email || "Mentorado");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <Link to="/admin/mentorados" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Voltar para mentorados
      </Link>
      <MenteeDashboard menteeId={id} greetingName={name} canEdit isAdminView />
    </div>
  );
}
