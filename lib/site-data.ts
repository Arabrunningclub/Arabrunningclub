import { unstable_cache } from "next/cache";

export type ArcEvent = {
  eventId: string;
  slug: string;
  featured: boolean;
  category: string;
  title: string;
  shortTitle: string;
  cardDescription: string;
  fullDescription: string;
  startAt: string;
  endAt: string;
  timeZone: string;
  registrationOpens: string;
  registrationCloses: string;
  venue: string;
  streetAddress: string;
  cityState: string;
  mapUrl: string;
  displayCost: string;
  capacity: number;
  waitlistEnabled: boolean;
  ageRequirement: string;
  skillLevel: string;
  whatToBring: string;
  accessibility: string;
  contactEmail: string;
  buttonText: string;
  registrationEnabled: boolean;
  cancellationStatus: string;
  statusMessage: string;
  heroImageUrl: string;
  socialImageUrl: string;
  galleryId: string;
  sortPriority: number;
  announcement: string;
  lifecycle: string;
  lastUpdated: string;
};

export type ArcEventTheme = {
  eventId: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  heroText: string;
  lightCardBackground: string;
  lightCardText: string;
  lightCardBorder: string;
  darkCardBackground: string;
  darkCardText: string;
  darkCardBorder: string;
  lightPreviewBackground: string;
  lightPreviewText: string;
  darkPreviewBackground: string;
  darkPreviewText: string;
  lightRegistrationBackground: string;
  lightRegistrationText: string;
  darkRegistrationBackground: string;
  darkRegistrationText: string;
  accentColor: string;
  buttonBackground: string;
  buttonText: string;
};

export const DEFAULT_EVENT_THEME: ArcEventTheme = {
  eventId: "",
  heroGradientStart: "#111827E6",
  heroGradientEnd: "#11182766",
  heroText: "#FFFFFF",
  lightCardBackground: "#FFFFFF",
  lightCardText: "#171717",
  lightCardBorder: "#D4D4D4",
  darkCardBackground: "#171717",
  darkCardText: "#FAFAFA",
  darkCardBorder: "#404040",
  lightPreviewBackground: "#FAFAFA",
  lightPreviewText: "#171717",
  darkPreviewBackground: "#111111",
  darkPreviewText: "#FAFAFA",
  lightRegistrationBackground: "#FFFFFF",
  lightRegistrationText: "#171717",
  darkRegistrationBackground: "#171717",
  darkRegistrationText: "#FAFAFA",
  accentColor: "#2563EB",
  buttonBackground: "#171717",
  buttonText: "#FFFFFF",
};

function validThemeColor(value: string | undefined, fallback: string) {
  const color = value?.trim() || "";
  return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)
    ? color
    : fallback;
}

export function resolveEventTheme(theme?: Partial<ArcEventTheme> | null): ArcEventTheme {
  return Object.fromEntries(
    Object.entries(DEFAULT_EVENT_THEME).map(([key, fallback]) => [
      key,
      key === "eventId"
        ? theme?.eventId || ""
        : validThemeColor(theme?.[key as keyof ArcEventTheme], fallback),
    ])
  ) as ArcEventTheme;
}

export type ArcSession = {
  sessionId: string;
  eventId: string;
  sessionName: string;
  startAt: string;
  endAt: string;
  capacity: number;
  registrationStatus: string;
  cardPrice: number;
  payLaterPrice: number;
  paymentMethods: string[];
  displayOrder: number;
};

export type ArcMedia = {
  mediaId: string;
  eventId: string;
  imageUrl: string;
  caption: string;
  altText: string;
  photographer: string;
  featured: boolean;
  sortOrder: number;
};

export type ArcRegistrationField = {
  fieldId: string;
  eventId: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string[];
  helpText: string;
  displayOrder: number;
};

export type ArcContentValue = { value: string; linkUrl: string };

export type ArcSiteData = {
  ok: boolean;
  generatedAt: string;
  events: ArcEvent[];
  eventThemes: ArcEventTheme[];
  sessions: ArcSession[];
  media: ArcMedia[];
  registrationFields: ArcRegistrationField[];
  content: Record<string, ArcContentValue>;
  navigation: Array<{
    id: string;
    label: string;
    url: string;
    external: boolean;
    displayOrder: number;
  }>;
  campaigns: Array<Record<string, unknown>>;
  settings: Record<string, unknown>;
};

export function getAppsScriptUrl() {
  return (
    process.env.APPS_SCRIPT_WEB_APP_URL ||
    process.env.GOOGLE_SHEETS_WEB_APP_URL ||
    ""
  ).replace(/\/+$/, "");
}

export async function fetchArcSiteData(
  cache: RequestCache = "no-store"
): Promise<ArcSiteData | null> {
  const url = getAppsScriptUrl();
  if (!url) return null;

  try {
    const response = await fetch(`${url}?action=site_data`, {
      cache,
      redirect: "follow",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as ArcSiteData;
    if (!data?.ok || !Array.isArray(data.events)) return null;
    return data;
  } catch (error) {
    console.error("Unable to load ARC site data", error);
    return null;
  }
}

export const fetchCachedArcSiteData = unstable_cache(
  () => fetchArcSiteData("force-cache"),
  ["arc-site-data"],
  {
    revalidate: 300,
    tags: ["arc-site-data"],
  }
);

export function eventPath(event: Pick<ArcEvent, "slug" | "eventId">) {
  return `/events/${encodeURIComponent(event.slug || event.eventId)}`;
}

export function formatDisplayCost(value: string) {
  const cost = value.trim();
  if (!cost) return "";

  const numericCost = cost.match(/^(from\s+)?\$?(\d+(?:\.\d{1,2})?)$/i);
  if (!numericCost) return cost;

  const prefix = numericCost[1] ? "From " : "";
  return `${prefix}$${numericCost[2]}`;
}
