import { apiError, supabaseServiceFetch, verifyAdminRequest } from "@/lib/arc-shop/supabase-admin";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const [productsResponse, variantsResponse] = await Promise.all([
    supabaseServiceFetch("/rest/v1/products?select=*&order=sort_order.asc"),
    supabaseServiceFetch(
      "/rest/v1/product_variants?select=id,product_id,sku,size,color,stock_on_hand,reserved,active&order=size.asc,color.asc",
    ),
  ]);
  if (!productsResponse.ok) {
    return apiError(await productsResponse.text(), productsResponse.status);
  }
  if (!variantsResponse.ok) {
    return apiError(await variantsResponse.text(), variantsResponse.status);
  }

  const products = (await productsResponse.json()) as Array<
    Record<string, unknown> & { id: string }
  >;
  const variants = (await variantsResponse.json()) as Array<
    Record<string, unknown> & { product_id: string }
  >;

  return Response.json(
    products.map((product) => ({
      ...product,
      status: product.status === "draft" ? "disabled" : product.status,
      variants: variants.filter(
        (variant) => variant.product_id === product.id,
      ),
    })),
  );
}

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const product = await request.json();
  if (!product.name || !product.slug || !Number.isFinite(Number(product.price_cents))) {
    return apiError("Name, slug, and price are required.");
  }

  const productRow = {
    slug: String(product.slug).trim().toLowerCase(),
    name: String(product.name).trim(),
    eyebrow: String(product.eyebrow || "ARC / System"),
    description: String(product.description || ""),
    details: Array.isArray(product.details) ? product.details : [],
    price_cents: Number(product.price_cents),
    image_url: String(product.image_url || ""),
    image_alt: String(product.image_alt || product.name),
    category: product.category,
    collection: product.collection,
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    featured: Boolean(product.featured),
    badge: product.badge || null,
    status: product.status === "disabled" ? "draft" : product.status || "active",
    sort_order: Number(product.sort_order || 0),
  };

  const existingId = String(product.id || "").trim();
  const productResponse = await supabaseServiceFetch(
    existingId
      ? `/rest/v1/products?id=eq.${encodeURIComponent(existingId)}`
      : "/rest/v1/products",
    {
      method: existingId ? "PATCH" : "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(productRow),
    },
  );
  if (!productResponse.ok) {
    return apiError(await productResponse.text(), productResponse.status);
  }

  const productRows = (await productResponse.json()) as Array<
    Record<string, unknown> & { id: string }
  >;
  const savedProduct = productRows[0];
  if (!savedProduct) return apiError("Product could not be saved.", 500);

  const variants = await syncProductVariants(savedProduct.id, productRow);
  if (!variants.ok) return apiError(variants.error, variants.status);

  return Response.json({
    ...savedProduct,
    status: savedProduct.status === "draft" ? "disabled" : savedProduct.status,
    variants: variants.data,
  });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);

  const body = (await request.json()) as { id?: string; status?: string };
  const allowedStatuses = new Set(["active", "disabled", "archived"]);
  if (!body.id || !body.status || !allowedStatuses.has(body.status)) {
    return apiError("A product and valid status are required.");
  }

  const storedStatus = body.status === "disabled" ? "draft" : body.status;
  const response = await supabaseServiceFetch(
    `/rest/v1/products?id=eq.${encodeURIComponent(body.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: storedStatus }),
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  const rows = (await response.json()) as unknown[];
  return Response.json({
    ...((rows[0] as Record<string, unknown> | undefined) || { id: body.id }),
    status: body.status,
  });
}

async function syncProductVariants(
  productId: string,
  product: {
    slug: string;
    sizes: unknown[];
    colors: unknown[];
  },
): Promise<
  | { ok: true; data: Array<Record<string, unknown>> }
  | { ok: false; error: string; status: number }
> {
  const existingResponse = await supabaseServiceFetch(
    `/rest/v1/product_variants?select=*&product_id=eq.${encodeURIComponent(productId)}`,
  );
  if (!existingResponse.ok) {
    return {
      ok: false,
      error: await existingResponse.text(),
      status: existingResponse.status,
    };
  }

  const existing = (await existingResponse.json()) as Array<{
    id: string;
    size: string;
    color: string;
    active: boolean;
  }>;
  const sizes = product.sizes.map(String).filter(Boolean);
  const colors = product.colors
    .map((color) =>
      typeof color === "object" && color && "name" in color
        ? String((color as { name: unknown }).name)
        : "",
    )
    .filter(Boolean);
  const desired = sizes.flatMap((size) =>
    colors.map((color) => ({ size, color, key: `${size}\u0000${color}` })),
  );
  const desiredKeys = new Set(desired.map((variant) => variant.key));
  const existingKeys = new Map(
    existing.map((variant) => [
      `${variant.size}\u0000${variant.color}`,
      variant,
    ]),
  );

  for (const variant of existing) {
    const shouldBeActive = desiredKeys.has(
      `${variant.size}\u0000${variant.color}`,
    );
    if (variant.active !== shouldBeActive) {
      const response = await supabaseServiceFetch(
        `/rest/v1/product_variants?id=eq.${encodeURIComponent(variant.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ active: shouldBeActive }),
        },
      );
      if (!response.ok) {
        return {
          ok: false,
          error: await response.text(),
          status: response.status,
        };
      }
    }
  }

  const missing = desired.filter((variant) => !existingKeys.has(variant.key));
  if (missing.length) {
    const rows = missing.map(({ size, color }) => ({
      product_id: productId,
      sku: `${skuPart(product.slug)}-${skuPart(size)}-${skuPart(color)}`,
      size,
      color,
      stock_on_hand: 20,
      reserved: 0,
      active: true,
    }));
    const response = await supabaseServiceFetch(
      "/rest/v1/product_variants",
      {
        method: "POST",
        body: JSON.stringify(rows),
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        error: await response.text(),
        status: response.status,
      };
    }
  }

  const savedResponse = await supabaseServiceFetch(
    `/rest/v1/product_variants?select=id,product_id,sku,size,color,stock_on_hand,reserved,active&product_id=eq.${encodeURIComponent(productId)}&order=size.asc,color.asc`,
  );
  if (!savedResponse.ok) {
    return {
      ok: false,
      error: await savedResponse.text(),
      status: savedResponse.status,
    };
  }
  return {
    ok: true,
    data: (await savedResponse.json()) as Array<Record<string, unknown>>,
  };
}

function skuPart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toUpperCase();
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("Product id is required.");
  const response = await supabaseServiceFetch(
    `/rest/v1/products?id=eq.${encodeURIComponent(id)}&status=eq.archived`,
    {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  const rows = (await response.json()) as unknown[];
  if (!rows.length) {
    return apiError("Archive this product before deleting it permanently.", 409);
  }
  return Response.json(rows[0]);
}
