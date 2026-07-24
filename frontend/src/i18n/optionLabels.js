/**
 * Engelska namn för stilar och placeringar i bokningsformuläret.
 *
 * Nyckeln är `builtInKey` från CRM:et — inte etikettens text. Backend skickar
 * bara med nyckeln när studion INTE har döpt om alternativet, så en studio som
 * skrivit ett eget namn ("Underarm & handled") får alltid sin egen text kvar,
 * på båda språken.
 *
 * VIKTIGT: det här påverkar bara etiketten kunden läser. Värdet som skickas till
 * CRM:et är alltid studions svenska text — backendens tidsberäkning matchar
 * svenska nyckelord som delsträngar och skulle tyst hamna fel annars.
 * Se StudioLeadFormEnhanced.jsx.
 *
 * Saknas en nyckel här visas den svenska etiketten. Det är rätt beteende: en
 * halvöversatt lista är bättre än en påhittad översättning.
 */

const PLACEMENT_LABELS_EN = {
  underarm: "Forearm",
  overarm: "Upper arm",
  axel: "Shoulder",
  helarm: "Full sleeve",
  rygg: "Back",
  brost: "Chest",
  revben: "Ribs",
  mage: "Stomach",
  lar: "Thigh",
  vad: "Calf",
  hand: "Hand",
  finger: "Finger",
  hals: "Throat",
  nacke: "Neck",
  fot: "Foot",
  ansikte: "Face"
};

const STYLE_LABELS_EN = {
  fineline: "Fineline / fine detail",
  black_grey_realism: "Black & grey realism",
  cover_up: "Cover-up",
  sensitive_placement: "Sensitive placement / breaks",
  ornamental: "Ornamental / heavy pattern"
};

const TRANSLATIONS = {
  placement: { en: PLACEMENT_LABELS_EN },
  style: { en: STYLE_LABELS_EN }
};

/**
 * @param {"placement"|"style"} kind
 * @param {string|null|undefined} builtInKey  null när studion döpt om alternativet
 * @param {string} fallbackLabel              studions egen (svenska) etikett
 * @param {string} language
 */
export function translateOptionLabel(kind, builtInKey, fallbackLabel, language) {
  if (!builtInKey) {
    return fallbackLabel;
  }

  return TRANSLATIONS[kind]?.[language]?.[builtInKey] || fallbackLabel;
}
