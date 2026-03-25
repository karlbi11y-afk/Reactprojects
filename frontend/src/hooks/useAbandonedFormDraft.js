import { useEffect, useMemo, useRef, useState } from "react";
import {
  savePublicStudioLeadDraft,
  saveStrategyCallDraft
} from "../services/publicSiteApi";
import { getTrackingPayload } from "../utils/tracking";

function readStoredDraftId(storageKey) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(storageKey) || "";
}

function writeStoredDraftId(storageKey, draftId) {
  if (typeof window === "undefined") {
    return;
  }

  if (draftId) {
    window.sessionStorage.setItem(storageKey, draftId);
    return;
  }

  window.sessionStorage.removeItem(storageKey);
}

function hasContactDetails(payload) {
  return Boolean(String(payload?.email || "").trim() || String(payload?.phone || "").trim());
}

function canCreateDraft(payload) {
  return Boolean(payload?.privacyConsent === true && hasContactDetails(payload));
}

export function useAbandonedFormDraft({
  type,
  studioSlug = "",
  payload,
  enabled = true
}) {
  const storageKey = useMemo(
    () => `inkrevenue-form-draft:${type}:${studioSlug || "global"}`,
    [studioSlug, type]
  );
  const [draftId, setDraftId] = useState(() => readStoredDraftId(storageKey));
  const draftIdRef = useRef(draftId);

  useEffect(() => {
    const storedDraftId = readStoredDraftId(storageKey);
    setDraftId(storedDraftId);
    draftIdRef.current = storedDraftId;
  }, [storageKey]);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const hasExistingDraft = Boolean(draftIdRef.current);

    if (!hasExistingDraft && !canCreateDraft(payload)) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const savePayload = {
        ...payload,
        draftId: draftIdRef.current || "",
        ...getTrackingPayload()
      };
      const request =
        type === "studio_lead" && studioSlug
          ? savePublicStudioLeadDraft(studioSlug, savePayload)
          : type === "strategy_call"
            ? saveStrategyCallDraft(savePayload)
            : null;

      if (!request) {
        return;
      }

      request
        .then((response) => {
          const nextDraftId = String(response?.id || "").trim();

          if (!nextDraftId || nextDraftId === draftIdRef.current) {
            return;
          }

          draftIdRef.current = nextDraftId;
          setDraftId(nextDraftId);
          writeStoredDraftId(storageKey, nextDraftId);
        })
        .catch(() => {});
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, payload, storageKey, studioSlug, type]);

  function clearDraft() {
    draftIdRef.current = "";
    setDraftId("");
    writeStoredDraftId(storageKey, "");
  }

  return {
    draftId,
    clearDraft
  };
}
