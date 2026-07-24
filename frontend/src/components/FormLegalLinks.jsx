import { useLegalConsent } from "../contexts/LegalConsentContext";
import { useT } from "../i18n/LanguageContext";

export function FormLegalLinks() {
  const { openLegalDocument } = useLegalConsent();
  const t = useT();

  return (
    <p className="legal-note">
      {t("consent.notePrefix")}{" "}
      <button
        className="legal-note__button"
        type="button"
        onClick={() => openLegalDocument("privacy")}
      >
        {t("consent.notePrivacy")}
      </button>{" "}
      {t("consent.noteMiddle")}{" "}
      <button
        className="legal-note__button"
        type="button"
        onClick={() => openLegalDocument("terms")}
      >
        {t("consent.noteTerms")}
      </button>
      .
    </p>
  );
}
