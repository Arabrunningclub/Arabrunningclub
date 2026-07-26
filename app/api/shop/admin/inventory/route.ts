import {
  apiError,
  supabaseServiceFetch,
  verifyAdminRequest,
} from "@/lib/arc-shop/supabase-admin";

type StockUpdate = {
  id: string;
  stock_on_hand: number;
};

export async function PATCH(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);

  const body = (await request.json().catch(() => null)) as {
    productId?: string;
    variants?: StockUpdate[];
  } | null;
  const updates = body?.variants;

  if (
    !body?.productId ||
    !Array.isArray(updates) ||
    !updates.length ||
    updates.some(
      (item) =>
        !item.id ||
        !Number.isInteger(item.stock_on_hand) ||
        item.stock_on_hand < 0,
    )
  ) {
    return apiError("Valid product variant stock values are required.");
  }

  const ids = updates.map((item) => `"${item.id}"`).join(",");
  const currentResponse = await supabaseServiceFetch(
    `/rest/v1/product_variants?select=id,product_id,stock_on_hand,reserved&id=in.(${encodeURIComponent(ids)})`,
  );
  if (!currentResponse.ok) {
    return apiError(await currentResponse.text(), currentResponse.status);
  }

  const current = (await currentResponse.json()) as Array<{
    id: string;
    product_id: string;
    stock_on_hand: number;
    reserved: number;
  }>;
  if (
    current.length !== updates.length ||
    current.some((variant) => variant.product_id !== body.productId)
  ) {
    return apiError("One or more variants do not belong to this product.", 400);
  }

  for (const update of updates) {
    const previous = current.find((variant) => variant.id === update.id)!;
    if (update.stock_on_hand < previous.reserved) {
      return apiError(
        `Stock cannot be lower than the ${previous.reserved} currently reserved.`,
        409,
      );
    }
  }

  const saved = [];
  for (const update of updates) {
    const previous = current.find((variant) => variant.id === update.id)!;
    if (update.stock_on_hand === previous.stock_on_hand) {
      saved.push(previous);
      continue;
    }

    const response = await supabaseServiceFetch(
      `/rest/v1/product_variants?id=eq.${encodeURIComponent(update.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ stock_on_hand: update.stock_on_hand }),
      },
    );
    if (!response.ok) return apiError(await response.text(), response.status);
    const rows = (await response.json()) as Array<Record<string, unknown>>;
    saved.push(rows[0]);

    await supabaseServiceFetch("/rest/v1/inventory_movements", {
      method: "POST",
      body: JSON.stringify({
        variant_id: update.id,
        quantity: update.stock_on_hand - previous.stock_on_hand,
        reason: "adjustment",
        note: "Manual stock adjustment from ARC Shop admin",
      }),
    });
  }

  return Response.json({ variants: saved });
}
