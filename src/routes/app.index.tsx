import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { MenteeDashboard } from "@/components/mentee/MenteeDashboard";

export const Route = createFileRoute("/app/")({ component: DashboardPage });

function DashboardPage() {
  const { user, profile, isAdmin } = useAuth();
  if (!user) return null;
  return (
    <MenteeDashboard
      menteeId={user.id}
      greetingName={profile?.full_name || user.email || ""}
      canEdit={!isAdmin || true}
    />
  );
}
