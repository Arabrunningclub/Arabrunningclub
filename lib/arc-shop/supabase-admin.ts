type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceKey: string;
  adminEmail: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail =
    process.env.ARC_SHOP_ADMIN_EMAIL || "arabrunningclub@gmail.com";
  if (!url || !anonKey || !serviceKey) return null;
  return { url, anonKey, serviceKey, adminEmail: adminEmail.toLowerCase() };
}

export async function verifyAdminRequest(request: Request) {
  const config = getSupabaseConfig();
  if (!config) return { ok: false as const, status: 503, error: "Supabase is not connected." };
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false as const, status: 401, error: "Sign in required." };

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return { ok: false as const, status: 401, error: "Your sign-in has expired." };
  }
  const user = (await response.json()) as { id: string; email?: string };
  if (user.email?.toLowerCase() !== config.adminEmail) {
    return { ok: false as const, status: 403, error: "This account is not an ARC Shop administrator." };
  }
  return { ok: true as const, config, user, token };
}

export async function supabaseServiceFetch(
  path: string,
  init: RequestInit = {},
) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not connected.");
  return fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
}

export function apiError(error: string, status = 400) {
  return Response.json({ error }, { status });
}
