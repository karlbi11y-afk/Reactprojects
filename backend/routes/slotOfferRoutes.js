import { Router } from "express";
import {
  enforcePublicReadRateLimit,
  enforceSubmissionRateLimit
} from "../middleware/rateLimit.js";
import { requestCrmPublicApi, getCrmProxyMessage } from "../utils/crmClient.js";

/**
 * Erbjudande om en ledig tid (/tid/:token på sajten).
 *
 * Proxar vidare till CRM-backendens publika endpoints. Sajten pratar aldrig
 * direkt med CRM:et — allt går via den här BFF:en, precis som studio-routerna.
 *
 * Token i länken är hela autentiseringen, så den skickas vidare orörd och
 * loggas aldrig.
 */
export const slotOfferRouter = Router();

slotOfferRouter.get("/:token", async (req, res) => {
  const rateLimit = enforcePublicReadRateLimit(req, "slot-offer-read");

  if (rateLimit.limited) {
    return res.status(429).json({ message: rateLimit.message });
  }

  try {
    const { response, payload } = await requestCrmPublicApi(
      `/slot-offers/${encodeURIComponent(req.params.token)}`,
      { request: req }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        message: getCrmProxyMessage(payload, "Erbjudandet finns inte längre.")
      });
    }

    return res.status(response.status).json(payload);
  } catch {
    return res.status(502).json({
      message: "Kunde inte hämta tiden just nu. Försök igen om en stund."
    });
  }
});

slotOfferRouter.post("/:token/accept", async (req, res) => {
  const rateLimit = enforceSubmissionRateLimit(req, "slot-offer-accept");

  if (rateLimit.limited) {
    return res.status(429).json({ message: rateLimit.message });
  }

  try {
    const { response, payload } = await requestCrmPublicApi(
      `/slot-offers/${encodeURIComponent(req.params.token)}/accept`,
      { method: "POST", request: req }
    );

    // Statuskoden bärs vidare oförändrad: 409 betyder "någon hann före" och
    // sidan visar ett annat besked än vid ett vanligt fel.
    if (!response.ok) {
      return res.status(response.status).json({
        message: getCrmProxyMessage(payload, "Tiden gick tyvärr inte att boka."),
        data: payload?.data || null
      });
    }

    return res.status(response.status).json(payload);
  } catch {
    return res.status(502).json({
      message: "Kunde inte boka tiden just nu. Försök igen om en stund."
    });
  }
});
