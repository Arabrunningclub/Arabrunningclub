import { apiError, verifyAdminRequest } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return apiError("Choose an image to upload.");
  if (!file.type.startsWith("image/")) return apiError("Only images are supported.");
  if (file.size > 8 * 1024 * 1024) return apiError("Images must be smaller than 8 MB.");

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  const objectName = `products/${Date.now()}-${safeName}`;
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
