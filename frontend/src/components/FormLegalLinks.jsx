import { useLegalConsent } from "../contexts/LegalConsentContext";

export function FormLegalLinks() {
  const { openLegalDocument } = useLegalConsent();

  return (
    <p className="legal-note">
      Genom att fortsätta godkänner du vår{" "}
      <button
        className="legal-note__button"
        type="button"
        onClick={() => openLegalDocument("privacy")}
      >
        integritetspolicy
      </button>{" "}
      och våra{" "}
      <button
        className="legal-note__button"
        type="button"
        onClick={() => openLegalDocument("terms")}
      >
        användarvillkor
      </button>
      .
    </p>
  );
}
