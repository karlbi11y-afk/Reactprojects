import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { DEFAULT_LANGUAGE } from "../i18n/config";
import { navigateTo, useSiteLocation } from "../utils/siteRouter";

const DISMISS_KEY = "inkrevenue-language-hint-dismissed";

/**
 * Diskret tips till besökare vars webbläsare talar ett annat språk än sidan de
 * landat på. Ingen tvingad omdirigering — det bryter delade länkar och gör
 * sajten oförutsägbar för Google.
 *
 * Renderas bara efter mount (klientsidan) så prerendrad HTML och hydrering
 * matchar.
 */
export function LanguageHint() {
  const { language, t, pathForLanguage } = useLanguage();
  const location = useSiteLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Privat läge utan localStorage — visa tipset ändå.
    }

    const browserLanguages = [navigator.language, ...(navigator.languages || [])]
      .filter(Boolean)
      .map((value) => String(value).slice(0, 2).toLowerCase());

    if (!browserLanguages.length) return;

    const prefersSwedish = browserLanguages.includes("sv");
    const suggestedLanguage = prefersSwedish ? DEFAULT_LANGUAGE : "en";

    if (suggestedLanguage !== language) {
      setVisible(true);
    }
  }, [language]);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Går det inte att spara får tipset dyka upp igen — inte värt att krascha på.
    }
  }

  if (!visible) return null;

  const otherLanguage = language === DEFAULT_LANGUAGE ? "en" : DEFAULT_LANGUAGE;
  const href = pathForLanguage(otherLanguage, {
    search: location.search,
    hash: location.hash
  });

  return (
    <div className="lang-hint" role="status">
      <span className="lang-hint__text">{t("languageHint.text")}</span>
      <a
        className="lang-hint__action"
        href={href}
        hrefLang={otherLanguage}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          dismiss();
          navigateTo(href);
        }}
      >
        {t("languageHint.action")}
      </a>
      <button
        type="button"
        className="lang-hint__close"
        onClick={dismiss}
        aria-label={t("languageHint.dismiss")}
      >
        ×
      </button>
    </div>
  );
}
