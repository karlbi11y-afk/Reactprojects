const SESSION_STORAGE_KEY = "inkrevenue-session-id";

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
