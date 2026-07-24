import { supabaseServiceFetch } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ subscribed: true, mode: "preview" });
  }
  const response = await supabaseServiceFetch("/rest/v1/newsletter_signups", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      email: email.toLowerCase(),
      source: "shop_footer",
    }),
  });
  if (!response.ok) {
    return Response.json({ error: "Subscription could not be saved." }, { status: 500 });
  }
  return Response.json({ subscribed: true });
}
