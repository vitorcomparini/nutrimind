import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email().max(255),
  full_name: z.string().min(1).max(120),
  phone: z.string().max(40).default(""),
  role: z.enum(["mentorado", "admin"]).default("mentorado"),
});

function getRedirectTo(): string {
  try {
    const host = getRequestHost();
    const proto = host.startsWith("localhost") ? "http" : "https";
    return `${proto}://${host}/set-password`;
  } catch {
    return "https://nutrimindclub.com.br/set-password";
  }
}

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InviteSchema.parse(d))
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });


    // Invite via admin API
    const redirectTo = getRedirectTo();
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.full_name },
      redirectTo,
    });
    if (error || !invited?.user) {
      // If user already exists, try to find them
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
      if (!existing) throw new Response(error?.message ?? "Falha ao convidar", { status: 400 });

      await supabaseAdmin.from("profiles").upsert({
        id: existing.id, email: data.email, full_name: data.full_name, phone: data.phone, is_active: true,
      });
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: existing.id, role: data.role },
        { onConflict: "user_id,role" }
      );
      return { ok: true, userId: existing.id, alreadyExisted: true };
    }

    const newId = invited.user.id;
    await supabaseAdmin.from("profiles").upsert({
      id: newId, email: data.email, full_name: data.full_name, phone: data.phone, is_active: true,
    });
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: newId, role: data.role },
      { onConflict: "user_id,role" }
    );
    return { ok: true, userId: newId, alreadyExisted: false };
  });

const ResendSchema = z.object({ user_id: z.string().uuid() });

export const resendInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResendSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Response("Forbidden", { status: 403 });

    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles").select("email, full_name, invite_accepted_at").eq("id", data.user_id).maybeSingle();
    if (pErr || !profile) throw new Response("Mentorado não encontrado", { status: 404 });
    if (profile.invite_accepted_at) throw new Response("Convite já aceito por este usuário.", { status: 400 });

    const redirectTo = getRedirectTo();
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(profile.email, {
      data: { full_name: profile.full_name },
      redirectTo,
    });
    if (error) {
      // Fallback: generate invite link (still triggers email via auth hook)
      const { error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email: profile.email,
        options: { redirectTo },
      });
      if (linkErr) throw new Response(linkErr.message, { status: 400 });
    }
    return { ok: true };
  });

const ResetPwSchema = z.object({ user_id: z.string().uuid() });

export const sendPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResetPwSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Response("Forbidden", { status: 403 });

    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles").select("email").eq("id", data.user_id).maybeSingle();
    if (pErr || !profile?.email) throw new Response("Mentorado não encontrado", { status: 404 });

    const redirectTo = getRedirectTo();
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: profile.email,
      options: { redirectTo },
    });
    if (error) throw new Response(error.message, { status: 400 });
    return { ok: true };
  });

const DeleteSchema = z.object({ user_id: z.string().uuid() });

export const deleteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Response("Forbidden", { status: 403 });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Response(error.message, { status: 400 });
    return { ok: true };
  });
