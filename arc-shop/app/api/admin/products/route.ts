import { apiError, supabaseServiceFetch, verifyAdminRequest } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const response = await supabaseServiceFetch(
    "/rest/v1/storefront_products?select=*&order=sort_order.asc",
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json(await response.json());
}

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const product = await request.json();
  if (!product.name || !product.slug || !Number.isFinite(Number(product.price_cents))) {
    return apiError("Name, slug, and price are required.");
  }
  const response = await supabaseServiceFetch(
    "/rest/v1/rpc/upsert_shop_product",
    {
      method: "POST",
      body: JSON.stringify({ p_product: product }),
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json(await response.json());
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("Product id is required.");
  const response = await supabaseServiceFetch(`/rest/v1/products?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status: "archived" }),
  });
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json(await response.json());
}
