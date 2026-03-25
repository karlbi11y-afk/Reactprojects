export function LegalConsentPrompt({
  isOpen,
  onAccept,
  onDecline,
  onOpenDocument
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <aside className="legal-modal" role="dialog" aria-labelledby="legal-consent-title">
      <div className="legal-modal__card">
        <p className="eyebrow">Samtycke</p>
        <h2 id="legal-consent-title">Godkänner du våra villkor?</h2>
        <p className="legal-modal__lead">
          För att använda formulären behöver du godkänna vår integritetspolicy och våra
          användarvillkor.
        </p>

        <div className="legal-modal__links">
          <button
            className="legal-note__button"
            type="button"
            onClick={() => onOpenDocument("privacy")}
          >
            Integritetspolicy
          </button>
          <button
            className="legal-note__button"
            type="button"
            onClick={() => onOpenDocument("terms")}
          >
            Användarvillkor
          </button>
        </div>

        <div className="legal-modal__actions">
          <button className="btn btn-primary" type="button" onClick={onDecline}>
            Icke godkänn
          </button>
          <button className="btn btn-secondary" type="button" onClick={onAccept}>
            Godkänn
          </button>
        </div>
      </div>
    </aside>
  );
}
