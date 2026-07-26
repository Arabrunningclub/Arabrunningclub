import { apiError, verifyAdminRequest } from "@/lib/arc-shop/supabase-admin";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) return apiError("Product id is required.");

  const prefix = `products/${productId}`;
  const response = await fetch(
    `${auth.config.url}/storage/v1/object/list/shop-media`,
    {
      method: "POST",
      headers: {
        apikey: auth.config.serviceKey,
        Authorization: `Bearer ${auth.config.serviceKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        prefix,
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "asc" },
      }),
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  const objects = (await response.json()) as Array<{ name: string }>;
  return Response.json(
    objects.map((object) => ({
      path: `${prefix}/${object.name}`,
      publicUrl: `${auth.config.url}/storage/v1/object/public/shop-media/${prefix}/${object.name}`,
    })),
  );
}

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const form = await request.formData();
  const file = form.get("file");
  const productId = String(form.get("productId") || "");
  if (!productId) return apiError("Save the product before adding images.");
  if (!(file instanceof File)) return apiError("Choose an image to upload.");
  if (!file.type.startsWith("image/")) return apiError("Only images are supported.");
  if (file.size > 8 * 1024 * 1024) return apiError("Images must be smaller than 8 MB.");

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  const objectName = `products/${productId}/${Date.now()}-${safeName}`;
  const response = await fetch(
    `${auth.config.url}/storage/v1/object/shop-media/${objectName}`,
    {
      method: "POST",
      headers: {
        apikey: auth.config.serviceKey,
        Authorization: `Bearer ${auth.config.serviceKey}`,
        "content-type": file.type,
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json({
    path: objectName,
    publicUrl: `${auth.config.url}/storage/v1/object/public/shop-media/${objectName}`,
  });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = (await request.json().catch(() => null)) as {
    productId?: string;
    path?: string;
  } | null;
  const expectedPrefix = `products/${body?.productId || ""}/`;
  if (
    !body?.productId ||
    !body.path ||
    !body.path.startsWith(expectedPrefix)
  ) {
    return apiError("A valid product image is required.");
  }

  const response = await fetch(
    `${auth.config.url}/storage/v1/object/shop-media/${body.path}`,
    {
      method: "DELETE",
      headers: {
        apikey: auth.config.serviceKey,
        Authorization: `Bearer ${auth.config.serviceKey}`,
      },
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json({ ok: true });
}
