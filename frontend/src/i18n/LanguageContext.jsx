import { createContext, useContext, useMemo } from "react";
import { sv } from "./sv";
import { en } from "./en";
import {
  DEFAULT_LANGUAGE,
  LOCALES,
  buildLanguagePath,
  localizePath as localizePathForLanguage
} from "./config";

const DICTIONARIES = { sv, en };

/**
 * Importerar avsiktligt INTE siteRouter — routern importerar den här filen för
 * att kunna språkprefixa <SiteLink>. Går importen åt båda hållen får vi en cykel.
 */
const LanguageContext = createContext(null);

function resolveKey(dictionary, key) {
  return String(key)
    .split(".")
    .reduce((value, part) => (value == null ? undefined : value[part]), dictionary);
}

function interpolate(template, vars) {
  if (!vars || typeof template !== "string") {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

export function createTranslator(language) {
  const dictionary = DICTIONARIES[language] || DICTIONARIES[DEFAULT_LANGUAGE];

  /**
   * t("header.home") → sträng. Saknas nyckeln i det valda språket faller vi
   * tillbaka på svenskan, och saknas den där också returneras nyckeln — det
   * syns i UI:t utan att sidan kraschar.
   */
  function t(key, vars) {
    const value = resolveKey(dictionary, key);
    const fallback = value === undefined ? resolveKey(DICTIONARIES[DEFAULT_LANGUAGE], key) : value;

    if (fallback === undefined) {
      return key;
    }

    return typeof fallback === "string" ? interpolate(fallback, vars) : fallback;
  }

  /** Som t() men garanterar en array — för listor (FAQ, veckodagar). */
  function tList(key) {
    const value = t(key);
    return Array.isArray(value) ? value : [];
  }

  return { t, tList };
}

export function LanguageProvider({ language = DEFAULT_LANGUAGE, path = "/", children }) {
  const value = useMemo(() => {
    const { t, tList } = createTranslator(language);

    return {
      language,
      isEnglish: language === "en",
      locale: LOCALES[language] || LOCALES[DEFAULT_LANGUAGE],
      // Sidans språkfria sökväg — språkväxlaren och hreflang bygger på den.
      path,
      t,
      tList,
      localizePath: (href) => localizePathForLanguage(href, language),
      pathForLanguage: (nextLanguage, options) =>
        buildLanguagePath(path, nextLanguage, options)
    };
  }, [language, path]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    // Gör komponenter som SiteLink användbara även utanför providern (t.ex. i
    // isolerade tester) — då gäller svenska utan prefix.
    const { t, tList } = createTranslator(DEFAULT_LANGUAGE);
    return {
      language: DEFAULT_LANGUAGE,
      isEnglish: false,
      locale: LOCALES[DEFAULT_LANGUAGE],
      path: "/",
      t,
      tList,
      localizePath: (href) => href,
      pathForLanguage: (nextLanguage, options) =>
        buildLanguagePath("/", nextLanguage, options)
    };
  }

  return context;
}

export function useT() {
  return useLanguage().t;
}
