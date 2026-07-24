import type { Metadata } from "next";
import { AdminDashboard } from "@/components/arc-shop/AdminDashboard";

export const metadata: Metadata = {
  title: "Shop control room",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminDashboard
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
