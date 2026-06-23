import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Gera um token assinado de curta duração que autoriza o stream da aula.
// O token vai como query param (`?t=`) na URL do <video> porque o elemento
// nativo não envia headers customizados.
function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signPayload(payload: Record<string, unknown>, secret: string): Promise<string> {
  const body = base64UrlEncode(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${base64UrlEncode(new Uint8Array(sig))}`;
}

export const getLessonStreamToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string }) => {
    if (!data?.lessonId || typeof data.lessonId !== "string") {
      throw new Error("lessonId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verifica se usuário está ativo (RLS já filtra, mas confirmamos)
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.is_active) {
      throw new Response("Usuário inativo", { status: 403 });
    }

    // Confirma que a aula existe (e que o usuário pode lê-la via RLS)
    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("id, drive_file_id")
      .eq("id", data.lessonId)
      .maybeSingle();

    if (error || !lesson) {
      throw new Response("Aula não encontrada", { status: 404 });
    }

    // Registra view (uma por sessão de player)
    await supabase.from("lesson_views").insert({
      user_id: userId,
      lesson_id: data.lessonId,
    });

    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) throw new Response("Server misconfigured", { status: 500 });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 4; // 4h
    const token = await signPayload(
      { lid: data.lessonId, uid: userId, exp },
      secret,
    );

    return { token, url: `/api/lessons/${data.lessonId}/stream?t=${encodeURIComponent(token)}` };
  });
