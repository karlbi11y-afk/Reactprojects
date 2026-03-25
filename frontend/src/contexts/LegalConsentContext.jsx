import { createContext, useContext, useEffect, useState } from "react";
import { LegalConsentPrompt } from "../components/LegalConsentPrompt";
import { LegalDocumentModal } from "../components/LegalDocumentModal";

const LEGAL_CONSENT_STORAGE_KEY = "inkrevenue-legal-consent-v2";

const LegalConsentContext = createContext(null);

function readStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(LEGAL_CONSENT_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);

    if (parsedValue?.status === "accepted" || parsedValue?.status === "declined") {
      return parsedValue;
    }

    if (!parsedValue?.acceptedAt) {
      return null;
    }

    return {
      status: "accepted",
      acceptedAt: parsedValue.acceptedAt,
      version: parsedValue.version || "2026-03-24"
    };
  } catch {
    return null;
  }
}

function persistConsent(status) {
  if (typeof window === "undefined") {
    return null;
  }

  const consent = {
    status,
    updatedAt: new Date().toISOString(),
    version: "2026-03-24"
  };

  window.localStorage.setItem(LEGAL_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  return consent;
}

export function LegalConsentProvider({ children }) {
  const [storedConsent, setStoredConsent] = useState(() => readStoredConsent());
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(() => !readStoredConsent());
  const [activeDocument, setActiveDocument] = useState(null);
  const hasAcceptedConsent = storedConsent?.status === "accepted";

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    if (activeDocument) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeDocument]);

  function acceptLegalConsent() {
    const nextConsent = persistConsent("accepted");
    setStoredConsent(nextConsent);
    setIsLegalModalOpen(false);
  }

  function declineLegalConsent() {
    const nextConsent = persistConsent("declined");
    setStoredConsent(nextConsent);
    setIsLegalModalOpen(false);
  }

  function openLegalModal() {
    setIsLegalModalOpen(true);
  }

  function openLegalDocument(documentType) {
    setActiveDocument(documentType);
  }

  function closeLegalDocument() {
    setActiveDocument(null);
  }

  function closeLegalModal() {
    setIsLegalModalOpen(false);
  }

  const value = {
    hasAcceptedConsent,
    hasDeclinedConsent: storedConsent?.status === "declined",
    openLegalModal,
    openLegalDocument,
    closeLegalModal,
    closeLegalDocument,
    acceptLegalConsent,
    declineLegalConsent
  };

  return (
    <LegalConsentContext.Provider value={value}>
      {children}
      <LegalConsentPrompt
        isOpen={isLegalModalOpen}
        onAccept={acceptLegalConsent}
        onDecline={declineLegalConsent}
        onOpenDocument={openLegalDocument}
        onClose={closeLegalModal}
      />
      <LegalDocumentModal
        activeDocument={activeDocument}
        onClose={closeLegalDocument}
      />
    </LegalConsentContext.Provider>
  );
}

export function useLegalConsent() {
  const context = useContext(LegalConsentContext);

  if (!context) {
    throw new Error("useLegalConsent must be used within LegalConsentProvider.");
  }

  return context;
}
