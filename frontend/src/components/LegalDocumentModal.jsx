const DOCUMENT_CONTENT = {
  privacy: {
    eyebrow: "Integritetspolicy",
    title: "Så använder vi dina uppgifter",
    sections: [
      "När du fyller i namn, mejl, telefon eller bokningsdetaljer får vi spara uppgifterna för att hantera din förfrågan och hjälpa dig vidare till rätt studio eller strategisamtal.",
      "Om du börjar fylla i ett formulär men inte skickar in det kan vi spara utkastet och skicka påminnelser via mejl eller sms under veckan, så att du enkelt kan fortsätta där du slutade.",
      "Vi använder också teknisk information som sida, referenslänk och kampanjdata för att förstå var förfrågningar kommer ifrån och förbättra tjänsten.",
      "Om du vill att uppgifter ska rättas eller tas bort kan du kontakta oss på info@inkrevenue.se."
    ]
  },
  terms: {
    eyebrow: "Användarvillkor",
    title: "Villkor för att använda Ink Revenue",
    sections: [
      "Tjänsten används för att skicka bokningsförfrågningar, hitta studios och boka strategisamtal. Uppgifter du lämnar ska vara korrekta och relevanta för din förfrågan.",
      "Ink Revenue och anslutna studios får använda uppgifterna för att kontakta dig om din bokning, följa upp ett påbörjat formulär och ge återkoppling på din förfrågan.",
      "Genom att använda formulären godkänner du att vi sparar det som behövs för att kunna leverera tjänsten och följa upp din kontakt.",
      "Om du inte längre vill bli kontaktad kan du meddela oss eller den studio du varit i kontakt med."
    ]
  }
};

export function LegalDocumentModal({ activeDocument, onClose }) {
  const content = DOCUMENT_CONTENT[activeDocument];

  if (!content) {
    return null;
  }

  return (
    <div className="legal-document" role="presentation">
      <div className="legal-document__backdrop" onClick={onClose} />
      <section
        className="legal-document__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-document-title"
      >
        <div className="legal-document__header">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="legal-document-title">{content.title}</h2>
          </div>
          <button
            className="legal-document__close"
            type="button"
            onClick={onClose}
            aria-label="Stäng dokumentet"
          >
            ×
          </button>
        </div>

        <div className="legal-document__content">
          {content.sections.map((section) => (
            <p key={section}>{section}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
