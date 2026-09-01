/**
 * Vem är besökaren? — adressen som rate limitern nycklas på, och den enda som
 * skickas vidare till CRM-backenden.
 *
 * Punkt 10 i bokningsformulär-granskningen: koden läste `x-forwarded-for` och
 * tog FÖRSTA värdet. Vanliga edge-proxies LÄGGER TILL i XFF i stället för att
 * ersätta, så det första värdet är det klienten själv skickade med — en egen
 * `X-Forwarded-For`-header räckte för en ny hink per anrop.
 *
 * Räkna därför FRÅN HÖGER: varje proxy lägger till adressen den tog emot
 * ifrån, så det sista värdet är skrivet av hoppet närmast oss. Det är det enda
 * en utomstående inte kan sätta. `TRUSTED_PROXY_HOPS` (default 1) säger hur
 * många hopp framför appen som är våra egna.
 *
 * Den här proxyn tar bara emot trafik utifrån och läser därför ALDRIG
 * `x-client-ip` — den vägen finns bara åt andra hållet, från oss till CRM:et.
 */

/** Längsta giltiga IPv6-adress med zon-id. Taket hindrar en påhittad header
 *  från att svälla en rate limit-nyckel. */
const MAX_ADDRESS_LENGTH = 45;

function normalizeAddress(value) {
  return String(value || "")
    .split(",")[0]
    .trim()
    .slice(0, MAX_ADDRESS_LENGTH);
}

function trustedProxyHops() {
  const configured = Number(process.env.TRUSTED_PROXY_HOPS);

  return Number.isFinite(configured) && configured >= 1 ? Math.floor(configured) : 1;
}

export function resolveClientAddress(request) {
  const chain = String(request?.get?.("x-forwarded-for") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (chain.length) {
    const index = chain.length - trustedProxyHops();

    // Kortare kedja än antalet betrodda hopp: inget i den är skrivet av en
    // proxy vi litar på. Falla tillbaka på socket-adressen i stället för att gissa.
    if (index >= 0) return normalizeAddress(chain[index]);
  }

  return normalizeAddress(request?.ip || request?.socket?.remoteAddress) || "unknown";
}

/**
 * Headers som talar om för CRM-backenden vem besökaren är.
 *
 * `X-Forwarded-For` sätts till EN adress — den vi själva räknat fram — i
 * stället för att skicka vidare kedjan vi fick in. Skickas kedjan rå följer
 * klientens egenpåhittade värden med, och CRM:et kan inte längre veta var
 * vår del av den börjar.
 *
 * `X-Client-Ip` är exakt samma adress, men signerad med den delade
 * hemligheten. CRM:et läser den bara när `x-internal-proxy-secret` stämmer, och
 * den är det enda som fungerar när CRM:et nås via en publik edge som lägger
 * till i XFF (då är sista XFF-värdet vår utgående IP, inte besökarens).
 * Är hemligheten inte satt i BÅDA tjänsterna faller CRM:et tillbaka på XFF.
 */
export function clientForwardingHeaders(request) {
  const clientAddress = resolveClientAddress(request);
  const secret = process.env.INTERNAL_PROXY_SECRET?.trim();

  return {
    ...(clientAddress && clientAddress !== "unknown"
      ? { "X-Forwarded-For": clientAddress }
      : {}),
    ...(secret && clientAddress
      ? { "X-Client-Ip": clientAddress, "X-Internal-Proxy-Secret": secret }
      : {})
  };
}
