import { apiError, supabaseServiceFetch, verifyAdminRequest } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const response = await supabaseServiceFetch(
    "/rest/v1/orders?select=*,order_items(*)&order=created_at.desc&limit=100",
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json(await response.json());
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = (await request.json()) as {
    id?: string;
    fulfillment_status?: string;
    tracking_number?: string;
    tracking_url?: string;
  };
  if (!body.id) return apiError("Order id is required.");
  const update = {
    fulfillment_status: body.fulfillment_status,
    tracking_number: body.tracking_number || null,
    tracking_url: body.tracking_url || null,
    updated_at: new Date().toISOString(),
  };
  const response = await supabaseServiceFetch(
    `/rest/v1/orders?id=eq.${body.id}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(update),
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json(await response.json());
}
