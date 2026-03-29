function getClientAddress(request) {
  const forwardedFor = request.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")
      .map((value) => value.trim())
      .find(Boolean);
  }

  return request.ip || request.socket?.remoteAddress || "unknown";
}

const submissionState = new Map();
const draftSaveState = new Map();
const publicReadState = new Map();

const submissionWindowMs = Number(process.env.SUBMISSION_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const submissionMaxRequests = Number(process.env.SUBMISSION_RATE_LIMIT_MAX || 6);
const draftSaveWindowMs = Number(process.env.DRAFT_SAVE_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const draftSaveMaxRequests = Number(process.env.DRAFT_SAVE_RATE_LIMIT_MAX || 40);
const publicReadWindowMs = Number(process.env.PUBLIC_READ_RATE_LIMIT_WINDOW_MS || 60 * 1000);
const publicReadMaxRequests = Number(process.env.PUBLIC_READ_RATE_LIMIT_MAX || 20);

function enforceRateLimit(request, scope, { state, windowMs, maxRequests, message }) {
  const key = `${scope}:${getClientAddress(request)}`;
  const now = Date.now();
  const activeAttempts = (state.get(key) || []).filter((ts) => now - ts < windowMs);

  if (activeAttempts.length >= maxRequests) {
    return { limited: true, message };
  }

  activeAttempts.push(now);
  state.set(key, activeAttempts);

  return { limited: false };
}

export function enforceSubmissionRateLimit(request, scope) {
  return enforceRateLimit(request, scope, {
    state: submissionState,
    windowMs: submissionWindowMs,
    maxRequests: submissionMaxRequests,
    message:
      "Vi har tagit emot många försök från samma anslutning på kort tid. Vänta en stund och försök igen."
  });
}

export function enforcePublicReadRateLimit(request, scope) {
  return enforceRateLimit(request, scope, {
    state: publicReadState,
    windowMs: publicReadWindowMs,
    maxRequests: publicReadMaxRequests,
    message:
      "Vi har tagit emot många förfrågningar från samma anslutning. Vänta en kort stund och försök igen."
  });
}

export function enforceDraftSaveRateLimit(request, scope) {
  return enforceRateLimit(request, scope, {
    state: draftSaveState,
    windowMs: draftSaveWindowMs,
    maxRequests: draftSaveMaxRequests,
    message:
      "Vi har tagit emot många sparningar från samma anslutning på kort tid. Vänta en stund och försök igen."
  });
}
