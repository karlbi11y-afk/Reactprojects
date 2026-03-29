import { z } from "zod";

const optionalStr = (max = 500) =>
  z.string().max(max, `Fältet får inte överstiga ${max} tecken.`).optional().default("");

export const bookingBodySchema = z
  .object({
    name: z.string().min(1, "Namn krävs.").max(255, "Namn är för långt."),
    studio: z.string().min(1, "Studio krävs.").max(255, "Studionamn är för långt."),
    email: z
      .string()
      .min(1, "E-post krävs.")
      .max(255, "E-postadressen är för lång.")
      .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Ange en giltig e-postadress."
      }),
    phone: optionalStr(50),
    message: optionalStr(10000),
    privacyConsent: z.literal(true, {
      errorMap: () => ({ message: "Du behöver godkänna att vi sparar dina uppgifter." })
    }),
    marketingConsent: z.boolean().optional().default(false),
    website: optionalStr(255),
    pageUrl: optionalStr(2000),
    referrerUrl: optionalStr(2000),
    utmSource: optionalStr(255),
    utmMedium: optionalStr(255),
    utmCampaign: optionalStr(255),
    utmContent: optionalStr(255),
    utmTerm: optionalStr(255),
    gclid: optionalStr(255),
    fbclid: optionalStr(255),
    sessionId: optionalStr(255),
    draftId: optionalStr(255)
  })
  .strip();
