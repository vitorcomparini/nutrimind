// Regras de senha compartilhadas entre /set-password e /app/conta.
// Mínimo 8 caracteres, com pelo menos 1 letra, 1 número e 1 caractere especial.

export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{};':\",.<>/?`~\\|";

export const PASSWORD_RULES_TEXT =
  "A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra, 1 número e 1 caractere especial (ex.: ! @ # $ % & * ? _ -).";

export function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  if (!/[A-Za-zÀ-ÿ]/.test(pwd)) return "A senha deve conter pelo menos 1 letra.";
  if (!/[0-9]/.test(pwd)) return "A senha deve conter pelo menos 1 número.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd))
    return "A senha deve conter pelo menos 1 caractere especial (ex.: ! @ # $ % & * ? _ -).";
  return null;
}

// Traduz mensagens comuns de erro do Supabase Auth para português.
export function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("password should be at least")) return "A senha é muito curta.";
  if (m.includes("password is known to be weak") || m.includes("pwned"))
    return "Esta senha já apareceu em vazamentos públicos. Escolha outra mais segura.";
  if (m.includes("not strong enough") || m.includes("weak password"))
    return "Senha fraca. " + PASSWORD_RULES_TEXT;
  if (m.includes("new password should be different"))
    return "A nova senha deve ser diferente da anterior.";
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns instantes.";
  return msg;
}
