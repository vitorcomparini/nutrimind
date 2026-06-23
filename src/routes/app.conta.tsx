import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, KeyRound, Camera } from "lucide-react";
import { PASSWORD_RULES_TEXT, validatePassword, translateAuthError } from "@/lib/password";
import { AvatarUpload } from "@/components/AvatarUpload";

export const Route = createFileRoute("/app/conta")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Minha conta — NutriMind Club" }] }),
});

function AccountPage() {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      const p = profile as unknown as { phone?: string; avatar_url?: string | null };
      setPhone(p.phone ?? "");
      setAvatarUrl(p.avatar_url ?? null);
    }
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim()) { toast.error("Informe seu nome."); return; }
    setSavingProfile(true);
    const { error } = await supabase.from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Dados atualizados.");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    const ruleError = validatePassword(newPwd);
    if (ruleError) { toast.error(ruleError); return; }
    if (newPwd !== confirmPwd) { toast.error("As senhas não coincidem."); return; }

    setSavingPwd(true);
    // Reautentica conferindo a senha atual
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: user.email, password: currentPwd,
    });
    if (signErr) {
      setSavingPwd(false);
      toast.error("Senha atual incorreta.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) { toast.error(translateAuthError(error.message)); return; }
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success("Senha alterada com sucesso.");
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <header>
        <span className="eyebrow">Minha conta</span>
        <h1 className="font-serif text-3xl mt-2 text-primary">Meus dados</h1>
        <span className="gold-rule mt-3" />
      </header>

      <section className="border border-border rounded-lg p-6 bg-card">
        <h2 className="font-serif text-xl mb-1 flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Foto de perfil</h2>
        <p className="text-sm text-muted-foreground mb-5">Sua foto aparece no seu dashboard pessoal.</p>
        {user && (
          <AvatarUpload
            userId={user.id}
            currentUrl={avatarUrl}
            fullName={fullName || user.email || ""}
            onUploaded={setAvatarUrl}
          />
        )}
      </section>

      <section className="border border-border rounded-lg p-6 bg-card">
        <h2 className="font-serif text-xl mb-1 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Dados pessoais</h2>
        <p className="text-sm text-muted-foreground mb-5">Atualize seu nome e telefone de contato.</p>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={user?.email ?? ""} disabled className="mt-2 bg-muted" />
          </div>
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" required />
          </div>
          <div>
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" placeholder="(11) 99999-9999" />
          </div>
          <Button type="submit" disabled={savingProfile} className="bg-primary hover:bg-primary/90">
            {savingProfile ? "Salvando..." : "Salvar dados"}
          </Button>
        </form>
      </section>

      <section className="border border-border rounded-lg p-6 bg-card">
        <h2 className="font-serif text-xl mb-1 flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Alterar senha</h2>
        <p className="text-sm text-muted-foreground mb-5">Para sua segurança, confirmamos sua senha atual antes de trocar.</p>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <Label htmlFor="current">Senha atual</Label>
            <Input id="current" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="mt-2" required autoComplete="current-password" />
          </div>
          <div>
            <Label htmlFor="new">Nova senha</Label>
            <Input id="new" type="password" minLength={8} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="mt-2" required autoComplete="new-password" />
            <p className="text-xs text-muted-foreground mt-1">{PASSWORD_RULES_TEXT}</p>
          </div>
          <div>
            <Label htmlFor="confirm">Confirme a nova senha</Label>
            <Input id="confirm" type="password" minLength={8} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="mt-2" required autoComplete="new-password" />
          </div>
          <Button type="submit" disabled={savingPwd} className="bg-primary hover:bg-primary/90">
            {savingPwd ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>
      </section>
    </div>
  );
}
