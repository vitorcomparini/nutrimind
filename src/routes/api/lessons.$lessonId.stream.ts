import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyToken(
  token: string,
  secret: string,
): Promise<{ lid: string; uid: string; exp: number } | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = base64UrlDecode(sig);
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
    new TextEncoder().encode(body),
  );
  if (!ok) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlDecode(body)));
    if (typeof json.exp !== "number" || json.exp < Math.floor(Date.now() / 1000)) return null;
    return json;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/lessons/$lessonId/stream")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("t");
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!token || !secret) return new Response("Unauthorized", { status: 401 });

        const claims = await verifyToken(token, secret);
        if (!claims || claims.lid !== params.lessonId) {
          return new Response("Unauthorized", { status: 401 });
        }

        // Resolve drive_file_id usando admin client (token já validado)
        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const admin = createClient<Database>(SUPABASE_URL, SERVICE, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: lesson } = await admin
          .from("lessons")
          .select("drive_file_id")
          .eq("id", params.lessonId)
          .maybeSingle();
        if (!lesson?.drive_file_id) return new Response("Not found", { status: 404 });

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
        if (!LOVABLE_API_KEY || !GOOGLE_DRIVE_API_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }

        const headers: Record<string, string> = {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
        };
        const range = request.headers.get("range");
        if (range) headers["Range"] = range;

        const driveResp = await fetch(
          `${GATEWAY_URL}/files/${encodeURIComponent(lesson.drive_file_id)}?alt=media&supportsAllDrives=true`,
          { method: "GET", headers },
        );

        const respHeaders = new Headers();
        respHeaders.set("Content-Type", driveResp.headers.get("Content-Type") || "video/mp4");
        respHeaders.set("Accept-Ranges", "bytes");
        respHeaders.set("Cache-Control", "private, no-store");
        const cl = driveResp.headers.get("Content-Length");
        if (cl) respHeaders.set("Content-Length", cl);
        const cr = driveResp.headers.get("Content-Range");
        if (cr) respHeaders.set("Content-Range", cr);

        return new Response(driveResp.body, {
          status: driveResp.status,
          headers: respHeaders,
        });
      },
    },
  },
});
