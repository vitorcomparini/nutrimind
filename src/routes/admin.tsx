import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-horizontal.png";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (!isAdmin) nav({ to: "/app" });
  }, [loading, user, isAdmin, nav]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link to="/app" className="flex items-center gap-3">
              <img src={logo} alt="NutriMind" className="h-8 w-auto" />
            </Link>
            <span className="text-border">|</span>
            <span className="eyebrow">Painel Admin</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/admin/mentorados" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Mentorados</Link>
            <Link to="/admin/aulas" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Aulas</Link>
            <Link to="/admin/eventos" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Eventos</Link>
            <Link to="/admin/engajamento" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-medium" }}>Engajamento</Link>
            <Link to="/app" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs">
              <ArrowLeft className="h-3 w-3" /> Sair do painel
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
