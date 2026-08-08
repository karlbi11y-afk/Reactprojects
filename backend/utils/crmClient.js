function normalizeUrl(url) {
  return url?.trim().replace(/\/+$/, "");
}

export const CRM_API_BASE_URL = normalizeUrl(
  process.env.CRM_API_BASE_URL || "http://localhost:4000"
);

// CRM-backenden läser besökarens IP ur x-forwarded-for och avgör bot/app-webbläsare
// ur user-agent. Utan vidarebefordran ser den bara den här proxyns IP och saknar
// UA helt: rate limits blir gemensamma för hela sajten och botfiltret blir blint.
function forwardedClientHeaders(request) {
  if (!request) return {};

  const forwardedFor =
    request.get("x-forwarded-for") || request.ip || request.socket?.remoteAddress || "";

  return {
    ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
    ...(request.get("user-agent") ? { "User-Agent": request.get("user-agent") } : {})
  };
}

function createCrmPublicUrl(pathname, query = {}) {
  const url = new URL(`${CRM_API_BASE_URL}/api/public${pathname}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    const normalizedValue = String(value ?? "").trim();
    if (normalizedValue) url.searchParams.set(key, normalizedValue);
  });

  return url;
}

export async function requestCrmPublicApi(
  pathname,
  { method = "GET", body = null, query = {}, request } = {}
) {
  const response = await fetch(createCrmPublicUrl(pathname, query), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...forwardedClientHeaders(request),
      Origin: request?.get("origin") || "",
      Referer: body?.pageUrl || request?.get("referer") || ""
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => null);

  return { response, payload };
}

export function getCrmProxyMessage(payload, fallbackMessage) {
  return payload?.message || fallbackMessage;
}

export function buildCrmSalesLeadPayload(payload) {
  return {
    name: String(payload.name || "").trim(),
    studioName: String(payload.studio || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    phone: String(payload.phone || "").trim(),
    description: String(payload.message || "").trim(),
    privacyConsent: payload.privacyConsent === true,
    marketingConsent: payload.marketingConsent === true,
    source: "inkrevenue_strategy_call",
    pageUrl: String(payload.pageUrl || "").trim(),
    referrerUrl: String(payload.referrerUrl || "").trim(),
    utmSource: String(payload.utmSource || "").trim(),
    utmMedium: String(payload.utmMedium || "").trim(),
    utmCampaign: String(payload.utmCampaign || "").trim(),
    utmContent: String(payload.utmContent || "").trim(),
    utmTerm: String(payload.utmTerm || "").trim(),
    gclid: String(payload.gclid || "").trim(),
    fbclid: String(payload.fbclid || "").trim(),
    sessionId: String(payload.sessionId || "").trim(),
    draftId: String(payload.draftId || "").trim(),
    website: String(payload.website || "").trim()
  };
}
