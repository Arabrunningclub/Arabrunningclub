import { NextResponse } from "next/server";
import {
  createShopPreviewSession,
  SHOP_PREVIEW_COOKIE,
  verifyShopPreviewPassword,
} from "@/lib/arc-shop/preview-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  if (!verifyShopPreviewPassword(body?.password || "")) {
    return NextResponse.json(
      { error: "That preview password is not correct." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHOP_PREVIEW_COOKIE, createShopPreviewSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHOP_PREVIEW_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
