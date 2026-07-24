import { apiError, getSupabaseConfig } from "@/lib/arc-shop/supabase-admin";

export async function POST(request: Request) {
  const config = getSupabaseConfig();
  if (!config) return apiError("Supabase is not connected.", 503);
  const { email } = (await request.json()) as { email?: string };
  if (!email || email.toLowerCase() !== config.adminEmail) {
    return apiError("Use the authorized ARC administrator email.", 403);
  }

  const origin = new URL(request.url).origin;
  const response = await fetch(`${config.url}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      create_user: true,
      options: { emailRedirectTo: `${origin}/shop/admin` },
    }),
  });
  if (!response.ok) {
    const error = (await response.json()) as { msg?: string; message?: string };
    return apiError(error.msg || error.message || "Magic link could not be sent.", 400);
  }
  return Response.json({ sent: true });
}
