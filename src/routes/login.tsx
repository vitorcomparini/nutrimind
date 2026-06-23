import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo-horizontal.png";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — NutriMind Club" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/app" });
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      return;
    }
    // Verify active
    const { data: prof } = await supabase.from("profiles").select("is_active").eq("id", data.user!.id).maybeSingle();
    if (prof && !prof.is_active) {
      await supabase.auth.signOut();
      setSubmitting(false);
      toast.error("Seu acesso está inativo. Fale com a equipe NutriMind.");
      return;
    }
    nav({ to: "/app" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-12">
          <img src={logo} alt="NutriMind Club" className="h-10 w-auto" />
        </Link>
        <div className="text-center mb-10">
          <span className="eyebrow">Área de membros</span>
          <h1 className="font-serif text-4xl mt-3 text-primary">Entrar</h1>
          <span className="gold-rule mt-4" />
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 h-11">
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-8 text-xs text-muted-foreground text-center">
          O acesso é exclusivo para mentoradas inscritas. Não há cadastro público —
          o convite é enviado pela equipe NutriMind.
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}
