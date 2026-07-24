/**
 * Språkkonfiguration för inkrevenue.online.
 *
 * Språket ligger i URL:en som prefix: svenska på "/" och engelska på "/en".
 * Det gör länkarna delbara och låter Google indexera båda språken (hreflang
 * sätts i pageMetadata.js). Rutt-segmenten är avsiktligt identiska mellan
 * språken — /en/integritetspolicy i stället för /en/privacy-policy — så att
 * det bara finns EN vägmatchning att hålla i synk.
 *
 * Filen är avsiktligt fri från React-importer: den används både av appen och
 * (i praktiken speglad) av prerender.mjs.
 */

export const DEFAULT_LANGUAGE = "sv";
export const LANGUAGES = ["sv", "en"];

// Intl-locale per språk. en-GB ger 24-timmarsklocka och dag-före-månad, vilket
// matchar hur svenska studios faktiskt anger tider.
export const LOCALES = {
  sv: "sv-SE",
  en: "en-GB"
};

export const HTML_LANG = {
  sv: "sv-SE",
  en: "en"
};

export const OG_LOCALES = {
  sv: "sv_SE",
  en: "en_GB"
};

export function isSupportedLanguage(value) {
  return LANGUAGES.includes(value);
}

function normalizePathname(pathname) {
  const withSlash = String(pathname || "/").startsWith("/")
    ? String(pathname || "/")
    : `/${pathname}`;
  const normalized = withSlash.replace(/\/+$/, "");
  return normalized || "/";
}

/**
 * Delar upp "/en/studios" i { language: "en", path: "/studios" }.
 * Okända prefix lämnas orörda och faller tillbaka på svenska.
 */
export function splitLanguageFromPath(pathname) {
  const normalized = normalizePathname(pathname);
  const match = normalized.match(/^\/([a-z]{2})(?=\/|$)/);
  const candidate = match?.[1];

  if (candidate && candidate !== DEFAULT_LANGUAGE && isSupportedLanguage(candidate)) {
    return {
      language: candidate,
      path: normalizePathname(normalized.slice(candidate.length + 1))
    };
  }

  return { language: DEFAULT_LANGUAGE, path: normalized };
}

/**
 * Sätter språkprefix på en intern href. Query och hash bevaras, och externa
 * eller redan prefixade länkar lämnas som de är.
 */
export function localizePath(href, language) {
  const raw = String(href ?? "");

  if (!raw || language === DEFAULT_LANGUAGE) {
    return raw;
  }

  // Externa länkar, mailto/tel och rena hash-länkar ska inte prefixas.
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(raw) || raw.startsWith("#")) {
    return raw;
  }

  if (!raw.startsWith("/")) {
    return raw;
  }

  const [pathAndQuery, ...hashParts] = raw.split("#");
  const hash = hashParts.length ? `#${hashParts.join("#")}` : "";
  const [path, ...queryParts] = pathAndQuery.split("?");
  const query = queryParts.length ? `?${queryParts.join("?")}` : "";
  const normalizedPath = normalizePathname(path);

  if (splitLanguageFromPath(normalizedPath).language !== DEFAULT_LANGUAGE) {
    return raw;
  }

  const prefixed = normalizedPath === "/" ? `/${language}` : `/${language}${normalizedPath}`;
  return `${prefixed}${query}${hash}`;
}

/**
 * Full URL till samma sida på ett annat språk — används av språkväxlaren och
 * av hreflang-taggarna.
 */
export function buildLanguagePath(path, language, { search = "", hash = "" } = {}) {
  return `${localizePath(normalizePathname(path), language)}${search}${hash}`;
}

export { normalizePathname };
