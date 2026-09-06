/**
 * Kampanjbannerns rena logik — utan JSX, så att den går att testa med
 * `node --test` (frontenden har ingen testrunner installerad).
 *
 * Allt som kan gå fel utan att synas ligger här:
 *
 * - Datumet MÅSTE formateras i Europe/Stockholm. `endsAt` är 23:59:59.999 svensk
 *   tid, alltså 21:59:59.999Z på sommaren. En kund vars webbläsare står i UTC-3
 *   hade fått gårdagens datum utskrivet ur samma instant — och trott att
 *   erbjudandet redan gått ut.
 * - Bannern får bara visa kampanjer som gäller för den bokningstyp kunden valt.
 *   Backenden stämplar bara förmånen när typen finns i kampanjens `bookingTypes`;
 *   visar bannern mer än så lovar formuläret något kunden inte får.
 */

export const STUDIO_TIME_ZONE = "Europe/Stockholm";

/**
 * "söndag 13 september" i studions zon. Ogiltig instant → tom sträng.
 *
 * Null-kollen är inte kosmetisk: `new Date(null)` är epoch, inte Invalid Date, så
 * en kampanj utan `endsAt` hade skrivit ut "gäller t.o.m. torsdag 1 januari".
 */
export function formatCampaignDeadline(endsAt, locale = "sv-SE") {
  if (!endsAt) return "";

  const date = new Date(endsAt);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: STUDIO_TIME_ZONE
  }).format(date);
}

/**
 * Är sista dygnet i dag (i studions zon)? Då är "gäller t.o.m. <dagens datum>"
 * missvisande — kunden ska läsa "till midnatt i kväll".
 */
export function isLastDay(endsAt, now = new Date()) {
  if (!endsAt) return false;

  const end = new Date(endsAt);

  if (Number.isNaN(end.getTime())) return false;

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: STUDIO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(end) === formatter.format(now);
}

/**
 * Kampanjerna bannern ska rendera.
 *
 * Fönstret prövas INTE här: backenden har redan filtrerat på serverns klocka när
 * studioobjektet byggdes (`buildPublicCampaignCards`), och att pröva om mot
 * klientens klocka vore att låta kunden flytta gränsen genom att ställa om sin
 * telefon. Det enda klienten avgör är typmatchningen.
 *
 * En kampanj utan `bookingTypes` kommer från ett äldre backendsvar — visa den
 * hellre än att gömma en förmån kunden faktiskt får.
 */
export function selectVisibleCampaigns(campaigns, bookingType) {
  return (Array.isArray(campaigns) ? campaigns : []).filter(
    (campaign) =>
      campaign &&
      campaign.label &&
      (!bookingType ||
        !Array.isArray(campaign.bookingTypes) ||
        campaign.bookingTypes.length === 0 ||
        campaign.bookingTypes.includes(bookingType))
  );
}
