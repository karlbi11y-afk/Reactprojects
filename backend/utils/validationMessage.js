// Felmeddelandet en människa får se när ett fält inte validerar.
//
// Tidigare klistrades den råa fältsökvägen först: kunden som glömde kryssa i
// samtycket fick "privacyConsent: Du behöver godkänna...". Sökvägen är till för
// klienten, inte för läsaren — den ligger nu i `field` i svaret i stället.
//
// Meddelandet självt räcker inte alltid ("Fältet får inte överstiga 500
// tecken." — vilket fält?), så kända fält får en svensk etikett. Etiketten
// hoppas över när meddelandet redan nämner fältet, annars blir det "Namn: Namn
// krävs.". Okända fält får inget prefix alls: hellre utan än på kodspråk.

// ⚠️ Samma tabell finns i tattoo-crm/backend/src/utils/validationMessage.js, som
// har den fulla listan. Här räcker fälten i bookingSchema.js. Håll dem i synk.

const FIELD_LABELS = {
  email: "E-post",
  message: "Meddelande",
  name: "Namn",
  phone: "Telefon",
  studio: "Studio"
};

// Medvetet utan etikett: privacyConsent/marketingConsent bär hela meningen
// själva, och spårningsfälten (utm*, gclid, sessionId, draftId ...) fyller
// kunden aldrig i.

export function describeValidationIssue(issue) {
  const field = Array.isArray(issue?.path) ? issue.path.join(".") : "";
  const message = issue?.message || "Ogiltigt värde.";
  // Sista icke-numeriska segmentet: "preferredSlots.0.startTime" ska hitta
  // "startTime", inte "0".
  const key = field
    .split(".")
    .filter((part) => part && !/^\d+$/.test(part))
    .pop();
  const label = key ? FIELD_LABELS[key] : "";

  if (!label || message.toLowerCase().includes(label.toLowerCase())) {
    return { field, message };
  }

  return { field, message: `${label}: ${message}` };
}
