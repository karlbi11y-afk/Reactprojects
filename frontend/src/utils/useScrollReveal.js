import { useEffect } from "react";

/**
 * Scroll-reveal-system för hela sajten.
 *
 * Element markeras med `data-reveal` (+ ev. `data-reveal-delay="1..6"`) och
 * animeras in när de kommer in i viewporten. Systemet är progressivt:
 * CSS:en som döljer element gäller bara under `html.has-reveal`, och den
 * klassen sätts först här — alltså är allt innehåll synligt för crawlers,
 * prerendrade sidor och användare utan JS eller med prefers-reduced-motion.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const root = document.documentElement;
    root.classList.add("has-reveal");

    // OBS: revealed-status lagras som attribut (inte klass) — React skriver om
    // className vid re-render (t.ex. FAQ-öppning) och skulle radera en klass,
    // medan okända attribut lämnas orörda.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const observe = (element) => {
      if (!element.hasAttribute("data-revealed")) {
        io.observe(element);
      }
    };

    document.querySelectorAll("[data-reveal]").forEach(observe);

    // Fångar innehåll som renderas senare (routebyten, async-laddade studios).
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.hasAttribute?.("data-reveal")) observe(node);
          node.querySelectorAll?.("[data-reveal]").forEach(observe);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("has-reveal");
    };
  }, []);
}
