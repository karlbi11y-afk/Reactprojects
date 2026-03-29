import { useEffect, useRef } from "react";

const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

export function LegalConsentModal({
  hasAcceptedConsent,
  isOpen,
  onAccept,
  onClose
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE));
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && hasAcceptedConsent && onClose) {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, hasAcceptedConsent, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="legal-modal" role="presentation">
      <div className="legal-modal__backdrop" />
      <section
        ref={dialogRef}
        className="legal-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-consent-title"
      >
        <div className="legal-modal__header">
          <div>
            <p className="eyebrow">Integritet Och Villkor</p>
            <h2 id="legal-consent-title">En gemensam policy för hela sidan</h2>
          </div>
          {hasAcceptedConsent ? (
            <button
              className="legal-modal__close"
              type="button"
              onClick={onClose}
              aria-label="Stäng policy-fönstret"
            >
              ×
            </button>
          ) : null}
        </div>

        <p className="legal-modal__lead">
          Genom att använda Ink Revenue godkänner du våra användarvillkor och vår
          integritetspolicy. Då kan vi använda dina uppgifter för att hantera bokningar,
          förfrågningar och påbörjade formulär på ett tydligt sätt.
        </p>

        <div className="legal-modal__grid">
          <article className="legal-card">
            <h3>Integritetspolicy</h3>
            <p>
              När du fyller i namn, mejl, telefon eller bokningsdetaljer får vi spara de
              uppgifterna för att kunna hantera din förfrågan och hjälpa dig vidare till rätt
              studio eller strategisamtal.
            </p>
            <p>
              Om du börjar fylla i ett formulär men inte skickar in det kan vi spara utkastet
              och skicka påminnelser via mejl eller sms under veckan, så att du enkelt kan
              fortsätta där du slutade.
            </p>
            <p>
              Vi använder också teknisk information som sida, referenslänk och kampanjdata för
              att förstå var förfrågningar kommer ifrån och förbättra tjänsten.
            </p>
          </article>

          <article className="legal-card">
            <h3>Användarvillkor</h3>
            <p>
              Tjänsten används för att skicka bokningsförfrågningar, hitta studios och boka
              strategisamtal. Uppgifter du lämnar ska vara korrekta och relevanta för
              förfrågan.
            </p>
            <p>
              Ink Revenue och anslutna studios får använda uppgifterna för att kontakta dig om
              din bokning, följa upp ett påbörjat formulär och ge återkoppling på din
              förfrågan.
            </p>
            <p>
              Om du vill att uppgifter ska tas bort eller rättas kan du kontakta oss på
              info@inkrevenue.online.
            </p>
          </article>
        </div>

        <div className="legal-modal__actions">
          <button className="btn btn-primary" type="button" onClick={onAccept}>
            {hasAcceptedConsent ? "Jag förstår" : "Godkänn och fortsätt"}
          </button>
          {hasAcceptedConsent ? (
            <button className="btn btn-secondary" type="button" onClick={onClose}>
              Stäng
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
