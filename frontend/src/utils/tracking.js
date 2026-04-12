const SESSION_STORAGE_KEY = "inkrevenue-session-id";

// Maps utm_source values from URLs to our internal billing source keys.
// "inkrevenue"   → direct booking link (e.g. studio bio, QR code we produced)
// "social_media" → post/DM we managed on their social accounts
// anything else  → leave empty, backend will default to inkrevenue_studio_page (non-billable)
const UTM_SOURCE_TO_LEAD_SOURCE = {
  inkrevenue: "inkrevenue",
  social_media: "social_media",
  instagram: "social_media",
  facebook: "social_media",
  tiktok: "social_media"
};

export function getLeadSourceFromUrl() {
  if (typeof window === "undefined") return "";
  const utmSource = new URL(window.location.href).searchParams
    .get("utm_source")
    ?.toLowerCase()
    ?.trim() || "";
  return UTM_SOURCE_TO_LEAD_SOURCE[utmSource] || "";
}

function createFallbackSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existingSessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = window.crypto?.randomUUID?.() || createFallbackSessionId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
}

export function getTrackingPayload() {
  if (typeof window === "undefined") {
    return {};
  }

  const currentUrl = new URL(window.location.href);

  return {
    pageUrl: currentUrl.toString(),
    referrerUrl: document.referrer || "",
    utmSource: currentUrl.searchParams.get("utm_source") || "",
    utmMedium: currentUrl.searchParams.get("utm_medium") || "",
    utmCampaign: currentUrl.searchParams.get("utm_campaign") || "",
    utmContent: currentUrl.searchParams.get("utm_content") || "",
    utmTerm: currentUrl.searchParams.get("utm_term") || "",
    gclid: currentUrl.searchParams.get("gclid") || "",
    fbclid: currentUrl.searchParams.get("fbclid") || "",
    sessionId: getOrCreateSessionId()
  };
}
