import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const SHOP_PREVIEW_COOKIE = "arc-shop-preview";

function previewPassword() {
  return (
    process.env.ARC_SHOP_PREVIEW_PASSWORD ||
    (process.env.NODE_ENV === "development" ? "arc-preview" : "")
  );
}

function sessionSignature() {
  const password = previewPassword();
  const secret = process.env.ARC_SHOP_PREVIEW_SECRET || password;
  if (!password || !secret) return "";

  return createHmac("sha256", secret)
    .update(`arc-shop-preview:${password}`)
    .digest("hex");
}

export function verifyShopPreviewPassword(candidate: string) {
  const expected = previewPassword();
  if (!candidate || !expected) return false;

  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export function createShopPreviewSession() {
  return sessionSignature();
}

export function isValidShopPreviewSession(value?: string | null) {
  const expected = sessionSignature();
  if (!value || !expected) return false;

  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

export function hasShopPreviewAccess(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SHOP_PREVIEW_COOKIE}=`));
  const value = cookie?.slice(SHOP_PREVIEW_COOKIE.length + 1);
  return isValidShopPreviewSession(value ? decodeURIComponent(value) : "");
}
