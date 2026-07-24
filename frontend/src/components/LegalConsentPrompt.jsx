import { useT } from "../i18n/LanguageContext";

export function LegalConsentPrompt({
  isOpen,
  onAccept,
  onDecline,
  onOpenDocument
}) {
  const t = useT();

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="legal-modal" role="dialog" aria-labelledby="legal-consent-title">
      <div className="legal-modal__card">
        <p className="eyebrow">{t("consent.eyebrow")}</p>
        <h2 id="legal-consent-title">{t("consent.title")}</h2>
        <p className="legal-modal__lead">{t("consent.lead")}</p>

        <div className="legal-modal__links">
          <button
            className="legal-note__button"
            type="button"
            onClick={() => onOpenDocument("privacy")}
          >
            {t("consent.privacy")}
          </button>
          <button
            className="legal-note__button"
            type="button"
            onClick={() => onOpenDocument("terms")}
          >
            {t("consent.terms")}
          </button>
        </div>

        <div className="legal-modal__actions">
          <button className="btn btn-primary" type="button" onClick={onDecline}>
            {t("consent.decline")}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onAccept}>
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </aside>
  );
}
