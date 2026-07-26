import {
  apiError,
  supabaseServiceFetch,
  verifyAdminRequest,
} from "@/lib/arc-shop/supabase-admin";

type ShopOrder = {
  id: string;
  payment_status: string;
  fulfillment_status: string;
  expires_at: string | null;
  created_at: string;
};

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);

  await cleanupExpiredSessions();
  const response = await loadOrders();
  if (!response.ok) return apiError(await response.text(), response.status);
  return Response.json(await response.json());
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = (await request.json()) as {
    id?: string;
    action?: "cancel";
    fulfillment_status?: string;
    tracking_number?: string;
    tracking_url?: string;
  };
  if (!body.id) return apiError("Order id is required.");

  const currentResponse = await supabaseServiceFetch(
    `/rest/v1/orders?select=*&id=eq.${encodeURIComponent(body.id)}&limit=1`,
  );
  if (!currentResponse.ok) {
    return apiError(await currentResponse.text(), currentResponse.status);
  }
  const current = ((await currentResponse.json()) as ShopOrder[])[0];
  if (!current) return apiError("Order not found.", 404);

  if (body.action === "cancel" && current.payment_status === "pending") {
    const releaseResponse = await supabaseServiceFetch(
      "/rest/v1/rpc/release_shop_order",
      {
        method: "POST",
        body: JSON.stringify({ p_order_id: body.id }),
      },
    );
    if (!releaseResponse.ok) {
      return apiError(await releaseResponse.text(), releaseResponse.status);
    }
  }

  const update =
    body.action === "cancel"
      ? {
          fulfillment_status: "cancelled",
          ...(current.payment_status === "pending" ||
          current.payment_status === "failed"
            ? { payment_status: "cancelled" }
            : {}),
          updated_at: new Date().toISOString(),
        }
      : {
          fulfillment_status: body.fulfillment_status,
          tracking_number: body.tracking_number || null,
          tracking_url: body.tracking_url || null,
          updated_at: new Date().toISOString(),
        };

  const allowedFulfillment = new Set([
    "unfulfilled",
    "processing",
    "fulfilled",
    "cancelled",
  ]);
  if (
    body.action !== "cancel" &&
    (!body.fulfillment_status ||
      !allowedFulfillment.has(body.fulfillment_status))
  ) {
    return apiError("Choose a valid fulfillment status.");
  }

  const response = await supabaseServiceFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(body.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(update),
    },
  );
  if (!response.ok) return apiError(await response.text(), response.status);
  const rows = (await response.json()) as unknown[];
  return Response.json(rows[0]);
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("Order id is required.");

  const response = await removeUnpaidSession(id);
  if (!response.ok) return apiError(response.error, response.status);
  return Response.json({ ok: true });
}

async function cleanupExpiredSessions() {
  await supabaseServiceFetch("/rest/v1/rpc/expire_shop_reservations", {
    method: "POST",
    body: "{}",
  });

  const response = await loadOrders();
  if (!response.ok) return;
  const orders = (await response.json()) as ShopOrder[];
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const stale = orders.filter((order) => {
    if (!["pending", "failed", "cancelled"].includes(order.payment_status)) {
      return false;
    }
    const expired = order.expires_at
      ? new Date(order.expires_at).getTime() < now
      : false;
    const old = new Date(order.created_at).getTime() < oneDayAgo;
    return expired || old;
  });

  await Promise.all(stale.map((order) => removeUnpaidSession(order.id)));
}

async function removeUnpaidSession(id: string): Promise<
  { ok: true } | { ok: false; error: string; status: number }
> {
  const currentResponse = await supabaseServiceFetch(
    `/rest/v1/orders?select=id,payment_status&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  if (!currentResponse.ok) {
    return {
      ok: false,
      error: await currentResponse.text(),
      status: currentResponse.status,
    };
  }
  const current = (
    (await currentResponse.json()) as Array<{
      id: string;
      payment_status: string;
    }>
  )[0];
  if (!current) return { ok: true };
  if (!["pending", "failed", "cancelled"].includes(current.payment_status)) {
    return {
      ok: false,
      error: "Paid order history cannot be deleted.",
      status: 409,
    };
  }

  if (current.payment_status === "pending") {
    await supabaseServiceFetch("/rest/v1/rpc/release_shop_order", {
      method: "POST",
      body: JSON.stringify({ p_order_id: id }),
    });
  }
  const deleteResponse = await supabaseServiceFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (!deleteResponse.ok) {
    return {
      ok: false,
      error: await deleteResponse.text(),
      status: deleteResponse.status,
    };
  }
  return { ok: true };
}

function loadOrders() {
  return supabaseServiceFetch(
    "/rest/v1/orders?select=*,order_items(*)&order=created_at.desc&limit=100",
  );
}
