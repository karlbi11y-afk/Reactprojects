import { useMemo, useState } from "react";
import { FormLegalLinks } from "./FormLegalLinks";
import { createStrategyCall } from "../services/publicSiteApi";
import { useLegalConsent } from "../contexts/LegalConsentContext";
import { useAbandonedFormDraft } from "../hooks/useAbandonedFormDraft";
import { getTrackingPayload } from "../utils/tracking";

const initialForm = {
  name: "",
  studio: "",
  email: "",
  phone: "",
  message: "",
  website: ""
};

function computeError(name, formData, touchedState) {
  if (!touchedState[name]) return "";
  switch (name) {
    case "name":
      return formData.name.trim().length < 2 ? "Fyll i ditt namn." : "";
    case "studio":
      return formData.studio.trim().length < 2 ? "Fyll i studions namn." : "";
    case "email":
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ? "Ange en giltig e-postadress."
        : "";
    default:
      return "";
  }
}

export function StrategyCallForm() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [touched, setTouched] = useState({});
  const { hasAcceptedConsent, openLegalModal } = useLegalConsent();
  const draftPayload = useMemo(
    () => ({
      name: formData.name,
      studio: formData.studio,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      privacyConsent: hasAcceptedConsent,
      marketingConsent: false,
      website: formData.website
    }),
    [formData, hasAcceptedConsent]
  );
  const { draftId, clearDraft } = useAbandonedFormDraft({
    type: "strategy_call",
    payload: draftPayload
  });

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function getFieldError(name) {
    return computeError(name, formData, touched);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasAcceptedConsent) {
      setStatus({
        state: "error",
        message: "Godkänn integritetspolicy och villkor för att fortsätta."
      });
      openLegalModal();
      return;
    }

    const allTouched = { name: true, studio: true, email: true };
    setTouched(allTouched);

    if (
      computeError("name", formData, allTouched) ||
      computeError("studio", formData, allTouched) ||
      computeError("email", formData, allTouched)
    ) {
      setStatus({
        state: "error",
        message: "Kontrollera fälten markerade i rött och försök igen."
      });
      return;
    }

    setStatus({ state: "loading", message: "Skickar bokningsförfrågan..." });

    try {
      const response = await createStrategyCall({
        ...formData,
        privacyConsent: true,
        marketingConsent: false,
        draftId,
        ...getTrackingPayload()
      });

      setStatus({
        state: "success",
        message:
          response?.successMessage ||
          "Tack! Vi har tagit emot din förfrågan och återkommer normalt inom 24 timmar på vardagar."
      });
      setFormData(initialForm);
      setTouched({});
      clearDraft();
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error.message ||
          "Det gick inte att skicka just nu. Kontrollera dina uppgifter och försök igen lite senare."
      });
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <p className="form-note">
        Berätta kort om nuläge och vad ni vill ha hjälp med, så kan vi göra första samtalet mer
        relevant.
      </p>

      <label htmlFor="strategy-name" className={getFieldError("name") ? "has-error" : ""}>
        Namn
        <input
          id="strategy-name"
          type="text"
          name="name"
          placeholder="Ditt namn"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!getFieldError("name")}
        />
        {getFieldError("name") ? (
          <span className="field-error" role="alert">{getFieldError("name")}</span>
        ) : null}
      </label>

      <label htmlFor="strategy-studio" className={getFieldError("studio") ? "has-error" : ""}>
        Studio
        <input
          id="strategy-studio"
          type="text"
          name="studio"
          placeholder="Studions namn"
          value={formData.studio}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!getFieldError("studio")}
        />
        {getFieldError("studio") ? (
          <span className="field-error" role="alert">{getFieldError("studio")}</span>
        ) : null}
      </label>

      <label htmlFor="strategy-email" className={getFieldError("email") ? "has-error" : ""}>
        E-post
        <input
          id="strategy-email"
          type="email"
          name="email"
          placeholder="namn@studio.se"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!getFieldError("email")}
        />
        {getFieldError("email") ? (
          <span className="field-error" role="alert">{getFieldError("email")}</span>
        ) : null}
      </label>

      <label htmlFor="strategy-phone">
        Telefonnummer
        <input
          id="strategy-phone"
          type="tel"
          name="phone"
          placeholder="070-000 00 00"
          value={formData.phone}
          onChange={handleChange}
        />
      </label>

      <label htmlFor="strategy-message">
        Meddelande
        <textarea
          id="strategy-message"
          name="message"
          rows="4"
          placeholder="Berätta kort om era mål och vilken typ av hjälp ni söker"
          value={formData.message}
          onChange={handleChange}
        />
      </label>

      <div className="hidden-trap" aria-hidden="true">
        <label htmlFor="strategy-website">
          Lämna detta fält tomt
          <input
            id="strategy-website"
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </label>
      </div>

      <FormLegalLinks />

      <button className="btn btn-primary" type="submit" disabled={status.state === "loading"}>
        {status.state === "loading" ? "Skickar..." : "Skicka bokningsförfrågan"}
      </button>

      {status.message ? (
        <p
          className={`form-status ${
            status.state === "success" ? "form-status--success" : "form-status--error"
          }`}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
