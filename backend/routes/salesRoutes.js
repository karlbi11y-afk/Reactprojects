import { Router } from "express";
import {
  enforceSubmissionRateLimit,
  enforceDraftSaveRateLimit
} from "../middleware/rateLimit.js";
import {
  requestCrmPublicApi,
  getCrmProxyMessage,
  buildCrmSalesLeadPayload
} from "../utils/crmClient.js";
import { bookingBodySchema } from "../schemas/bookingSchema.js";

export const salesRouter = Router();

salesRouter.post("/public/sales-lead-drafts", async (req, res) => {
  const rateLimit = enforceDraftSaveRateLimit(req, "strategy-call-draft");

  if (rateLimit.limited) {
    return res.status(429).json({ message: rateLimit.message });
  }

  try {
    const { response, payload } = await requestCrmPublicApi("/sales-lead-drafts", {
      method: "POST",
      body: req.body || {},
      request: req
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: getCrmProxyMessage(payload, "Kunde inte spara det påbörjade formuläret just nu.")
      });
    }

    return res.status(response.status).json(payload || { data: null });
  } catch {
    return res.status(502).json({
      message: "Kunde inte ansluta till CRM-backenden för att spara utkastet."
    });
  }
});

salesRouter.post("/booking", async (req, res) => {
  const parseResult = bookingBodySchema.safeParse(req.body || {});

  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    const field = firstIssue.path.join(".");
    const message = field ? `${field}: ${firstIssue.message}` : firstIssue.message;
    return res.status(400).json({ message });
  }

  const validatedBody = parseResult.data;
  const rateLimit = enforceSubmissionRateLimit(req, "strategy-call");

  if (rateLimit.limited) {
    return res.status(429).json({ message: rateLimit.message });
  }

  try {
    const { response, payload } = await requestCrmPublicApi("/sales-leads", {
      method: "POST",
      body: buildCrmSalesLeadPayload(validatedBody),
      request: req
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: getCrmProxyMessage(payload, "CRM kunde inte ta emot formuläret just nu.")
      });
    }

    return res.status(201).json({
      data: {
        ...(payload?.data || {}),
        successMessage:
          payload?.data?.successMessage ||
          "Tack! Vi har tagit emot din förfrågan och återkommer normalt inom 24 timmar på vardagar."
      }
    });
  } catch {
    return res.status(502).json({
      message:
        "Kunde inte ansluta till CRM-backenden. Kontrollera att CRM-backenden körs och att CRM_API_BASE_URL stämmer."
    });
  }
});
