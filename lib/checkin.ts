import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

export type CheckinTokenPayload = {
  rsvpId: string;
  eventId: string;
  sessionId: string;
  exp: number;
};

function checkinSecret() {
  const secret =
    process.env.APPS_SCRIPT_WRITE_SECRET ||
    process.env.APPS_SCRIPT_MARKPAID_SECRET;
  if (!secret) throw new Error("Check-in is not configured");
  return secret;
}

export function verifyCheckinToken(token: unknown): CheckinTokenPayload {
  if (typeof token !== "string") throw new Error("Missing check-in link");
  const [encoded, suppliedSignature, extra] = token.trim().split(".");
  if (!encoded || !suppliedSignature || extra) throw new Error("Invalid check-in link");

  const expectedSignature = createHmac("sha256", checkinSecret())
    .update(encoded)
    .digest("base64url");
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new Error("Invalid check-in link");
  }

  let payload: Partial<CheckinTokenPayload>;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid check-in link");
  }
  if (
    typeof payload.rsvpId !== "string" ||
    typeof payload.eventId !== "string" ||
    typeof payload.sessionId !== "string" ||
    typeof payload.exp !== "number"
  ) {
    throw new Error("Invalid check-in link");
  }
  if (payload.exp * 1000 < Date.now()) throw new Error("This check-in link has expired");

  return payload as CheckinTokenPayload;
}

export function isValidAdminKey(value: unknown) {
  const expectedKey = process.env.CHECKIN_ADMIN_KEY;
  if (!expectedKey || typeof value !== "string") return false;
  const supplied = Buffer.from(value);
  const expected = Buffer.from(expectedKey);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
