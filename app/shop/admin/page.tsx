import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/arc-shop/AdminDashboard";
import {
  isValidShopPreviewSession,
  SHOP_PREVIEW_COOKIE,
} from "@/lib/arc-shop/preview-auth";

export const metadata: Metadata = {
  title: "Shop control room",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const previewAccess = isValidShopPreviewSession(
    cookies().get(SHOP_PREVIEW_COOKIE)?.value,
  );

  return (
    <AdminDashboard
      previewAccess={previewAccess}
      configured={Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          process.env.SUPABASE_SERVICE_ROLE_KEY,
      )}
      adminEmail={
        process.env.ARC_SHOP_ADMIN_EMAIL || "arabrunningclub@gmail.com"
      }
    />
  );
}
