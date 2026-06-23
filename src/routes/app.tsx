import { createFileRoute, Outlet, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, UserCog, LayoutDashboard, BookOpen, Menu, X, Calendar } from "lucide-react";
import logo from "@/assets/logo-horizontal.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  head: () => ({ meta: [{ title: "Área do Mentorado — NutriMind Club" }] }),
});

const navItems: { to: "/app" | "/app/aulas" | "/app/eventos" | "/app/conta"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/aulas", label: "Conteúdo", icon: BookOpen },
  { to: "/app/eventos", label: "Próximos eventos", icon: Calendar },
  { to: "/app/conta", label: "Minha conta", icon: UserCog },
];

function AppLayout() {
  const { user, loading, signOut, isAdmin, profile } = useAuth();
  const nav = useNavigate();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  // close mobile menu on route change
  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => setOpen(false));
    return unsub;
  }, [router]);

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  const handleSignOut = () => signOut().then(() => nav({ to: "/login" }));

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-primary text-primary-foreground flex flex-col transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="px-6 py-8 flex items-center justify-between md:block">
          <Link to="/app" className="block">
            <img src={logo} alt="NutriMind" className="h-12 w-auto brightness-0 invert" />
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden p-2"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              activeProps={{ className: "bg-primary-foreground/15 font-medium" }}
              className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary-foreground/10 transition-colors text-sm"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/mentorados"
              className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary-foreground/10 transition-colors text-sm"
            >
              <Shield className="h-5 w-5" /> Painel admin
            </Link>
          )}
        </nav>
        <div className="px-3 pb-6 pt-2 border-t border-primary-foreground/10">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary-foreground/10 transition-colors text-sm w-full"
          >
            <LogOut className="h-5 w-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="md:hidden border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2"><Menu className="h-5 w-5" /></button>
          <img src={logo} alt="NutriMind" className="h-7 w-auto" />
          <span className="text-xs text-muted-foreground">{profile?.full_name?.split(" ")[0] ?? ""}</span>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
