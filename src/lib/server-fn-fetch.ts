// Anexa o token Supabase aos requests de server functions (/_serverFn/*)
// pois useServerFn não envia headers customizados por padrão.
import { supabase } from "@/integrations/supabase/client";

let installed = false;
export function installServerFnAuthInterceptor() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const orig = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;
      if (url && url.includes("/_serverFn/")) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has("authorization")) {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          if (token) headers.set("Authorization", `Bearer ${token}`);
        }
        return orig(input, { ...init, headers });
      }
    } catch {
      // fall through
    }
    return orig(input, init);
  };
}
