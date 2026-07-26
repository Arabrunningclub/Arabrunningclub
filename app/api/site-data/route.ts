import { NextResponse } from "next/server";
import { fetchCachedArcSiteData, getAppsScriptUrl } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getAppsScriptUrl()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing APPS_SCRIPT_WEB_APP_URL. Add the deployed Apps Script /exec URL to .env.local and restart Next.js.",
      },
      { status: 503 }
    );
  }

  const data = await fetchCachedArcSiteData();
  if (!data) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The configured Apps Script endpoint did not return valid site data. Check the deployment access and Apps Script logs.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
