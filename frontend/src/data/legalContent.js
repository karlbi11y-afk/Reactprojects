/**
 * Enda källan för integritetspolicy och användarvillkor.
 *
 * Samma innehåll renderas på två ställen: i modalen (LegalDocumentModal) och på
 * de publika sidorna /integritetspolicy och /anvandarvillkor. Sidorna finns för
 * att Googles OAuth-verifiering kräver en direktlänkbar URL utan inloggning —
 * en modal går inte att skicka in som policylänk.
 *
 * Google-avsnittet i integritetspolicyn granskas av Googles OAuth-team. Ändras
 * kalenderintegrationen i tattoo-crm måste texten uppdateras i samma veva,
 * annars stämmer inte policyn med vad appen faktiskt gör.
 */

export const LEGAL_DOCUMENTS = {
  privacy: {
    slug: "integritetspolicy",
    path: "/integritetspolicy",
    eyebrow: "Integritetspolicy",
    title: "Så använder vi dina uppgifter",
    lead:
      "Den här policyn beskriver vilka uppgifter Ink Revenue samlar in, varför vi gör det och hur du får dem borttagna.",
    updated: "2026-07-21",
    groups: [
      {
        heading: "Uppgifter du lämnar i våra formulär",
        paragraphs: [
          "När du fyller i namn, mejl, telefon eller bokningsdetaljer sparar vi uppgifterna för att hantera din förfrågan och hjälpa dig vidare till rätt studio eller strategisamtal.",
          "Om du börjar fylla i ett formulär men inte skickar in det kan vi spara utkastet och skicka påminnelser via mejl eller sms under veckan, så att du enkelt kan fortsätta där du slutade.",
          "Vi använder också teknisk information som sida, referenslänk och kampanjdata för att förstå var förfrågningar kommer ifrån och förbättra tjänsten."
        ]
      },
      {
        // Den fullständiga kalendertexten bor i CRM:et
        // (tattoo-crm/frontend/src/components/site/siteInfoContent.js), eftersom
        // det är den URL Google Cloud Console pekar på vid OAuth-verifieringen.
        // Här står bara en sammanfattning — annars finns två juridiska texter om
        // samma integration som glider isär.
        heading: "Kalenderkoppling för anslutna studios",
        paragraphs: [
          "Studios som använder vårt CRM kan frivilligt koppla sin kalender från Google, Apple eller Outlook. Vi läser titel och tid på kommande händelser enbart för att se när studion är upptagen, och skriver in bokningar som görs i CRM:et. Kalenderdata säljs aldrig, används aldrig för annonsering och delas inte med tredje part.",
          "Fullständig beskrivning av kalenderkopplingen finns i CRM:ets integritetspolicy på inkrevenue-crm.online/integritet."
        ]
      },
      {
        heading: "Dina rättigheter",
        paragraphs: [
          "Du har rätt att få veta vilka uppgifter vi har om dig, få felaktiga uppgifter rättade och få uppgifter raderade.",
          "Kontakta oss på info@inkrevenue.online så hanterar vi din begäran. Vi svarar normalt inom 30 dagar."
        ]
      }
    ]
  },
  terms: {
    slug: "anvandarvillkor",
    path: "/anvandarvillkor",
    eyebrow: "Användarvillkor",
    title: "Villkor för att använda Ink Revenue",
    lead: "Villkoren gäller när du använder våra formulär, vår studio-katalog eller vårt CRM.",
    updated: "2026-07-21",
    groups: [
      {
        heading: "Tjänsten",
        paragraphs: [
          "Tjänsten används för att skicka bokningsförfrågningar, hitta studios och boka strategisamtal. Uppgifter du lämnar ska vara korrekta och relevanta för din förfrågan.",
          "Ink Revenue och anslutna studios får använda uppgifterna för att kontakta dig om din bokning, följa upp ett påbörjat formulär och ge återkoppling på din förfrågan."
        ]
      },
      {
        heading: "Ditt samtycke",
        paragraphs: [
          "Genom att använda formulären godkänner du att vi sparar det som behövs för att kunna leverera tjänsten och följa upp din kontakt.",
          "Om du inte längre vill bli kontaktad kan du meddela oss eller den studio du varit i kontakt med."
        ]
      },
      {
        heading: "För anslutna studios",
        paragraphs: [
          "Studios ansvarar för att uppgifter som läggs in i CRM:et hanteras enligt gällande dataskyddsregler, och för att inhämta samtycke från sina egna kunder där det krävs.",
          "Kopplar studion en extern kalender ansvarar den för att kopplingen får göras för det konto som används."
        ]
      }
    ]
  }
};

export const LEGAL_PATHS = Object.fromEntries(
  Object.entries(LEGAL_DOCUMENTS).map(([key, doc]) => [key, doc.path])
);
