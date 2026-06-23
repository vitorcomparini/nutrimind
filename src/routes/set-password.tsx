import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo-horizontal.png";
import { PASSWORD_RULES_TEXT, validatePassword, translateAuthError } from "@/lib/password";

export const Route = createFileRoute("/set-password")({
  component: SetPasswordPage,
  head: () => ({ meta: [{ title: "Criar senha — NutriMind Club" }] }),
});

function SetPasswordPage() {
  const nav = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Aguarda o supabase processar o token da URL (detectSessionInUrl) e estabelecer a sessão.
    let resolved = false;
    const finish = (session: { user?: { email?: string | null } } | null) => {
      if (resolved) return;
      resolved = true;
      setHasSession(!!session);
      setEmail(session?.user?.email ?? "");
      setCheckingSession(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => finish(s));
    supabase.auth.getSession().then(({ data }) => {
      // Pequeno delay para casos onde o hash ainda está sendo processado
      if (data.session) finish(data.session);
      else setTimeout(() => supabase.auth.getSession().then(({ data: d }) => finish(d.session)), 600);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ruleError = validatePassword(password);
    if (ruleError) { toast.error(ruleError); return; }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSubmitting(false);
      toast.error(translateAuthError(error.message));
      return;
    }
    await supabase.auth.signOut();
    toast.success("Senha criada! Faça seu primeiro login.");
    nav({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-12">
          <img src={logo} alt="NutriMind Club" className="h-10 w-auto" />
        </Link>
        <div className="text-center mb-10">
          <span className="eyebrow">Bem-vinda(o)</span>
          <h1 className="font-serif text-4xl mt-3 text-primary">Crie sua senha</h1>
          <span className="gold-rule mt-4" />
        </div>

        {checkingSession ? (
          <p className="text-center text-muted-foreground">Validando convite...</p>
        ) : !hasSession ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Seu link de convite expirou ou é inválido. Solicite um novo convite à equipe NutriMind.
            </p>
            <Link to="/login" className="text-primary text-sm underline">Ir para o login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {email && (
              <p className="text-sm text-muted-foreground text-center">
                Definindo senha para <strong className="text-foreground">{email}</strong>
              </p>
            )}
            <div>
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)} className="mt-2" autoComplete="new-password" />
              <p className="text-xs text-muted-foreground mt-1">{PASSWORD_RULES_TEXT}</p>
            </div>
            <div>
              <Label htmlFor="confirm">Confirme a nova senha</Label>
              <Input id="confirm" type="password" required minLength={8} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className="mt-2" autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 h-11">
              {submitting ? "Salvando..." : "Salvar senha e ir para o login"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
