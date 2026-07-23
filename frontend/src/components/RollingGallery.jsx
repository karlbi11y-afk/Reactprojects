import { useCallback, useEffect, useRef, useState } from "react";

/**
 * RollingGallery
 *
 * Visar studions galleribilder på en enda rad.
 *  - Får alla bilder plats på raden → statiskt, centrerat (som idag).
 *  - Blir de för många för radbredden → sömlöst rullande band (marquee).
 *    Antalet som ryms avgörs av skärmbredden: ~4–5 på desktop, ~2–3 på mobil.
 *  - Klick på en bild → närbild (lightbox) med bläddring.
 *  - "Se hela portföljen" → overlay med alla bilder, klick öppnar närbild.
 *
 * SSR-säker: mätning/animation sker enbart i effekter (klientsidan).
 * Förstarender är alltid statiskt läge, så hydrering matchar.
 */
export function RollingGallery({ images = [], studioName = "" }) {
  const list = images.filter(Boolean);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const draggedRef = useRef(false);

  const [mode, setMode] = useState("static"); // "static" | "marquee" | "scroll"
  const [lightbox, setLightbox] = useState(null); // index eller null
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  const count = list.length;

  const openAt = useCallback(
    (i) => () => {
      if (draggedRef.current) {
        draggedRef.current = false;
        return;
      }
      setLightbox(i);
    },
    []
  );

  const step = useCallback(
    (dir) => setLightbox((i) => (i === null ? null : (i + dir + count) % count)),
    [count]
  );

  // ── Mät om raden får plats; välj läge (statiskt / band / scroll) ──
  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track || count === 0) return undefined;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const check = () => {
      const cards = Array.from(track.children).slice(0, count);
      if (!cards.length) {
        setMode("static");
        return;
      }
      const first = cards[0];
      const last = cards[cards.length - 1];
      const oneSetWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft;
      if (oneSetWidth <= vp.clientWidth + 1) {
        setMode("static");
      } else {
        setMode(reduce ? "scroll" : "marquee");
      }
    };

    check();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(check);
      ro.observe(vp);
    }
    window.addEventListener("resize", check);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [count]);

  // ── Marquee-motor: rullar bandet + drag + hover-paus ──
  useEffect(() => {
    if (mode !== "marquee") return undefined;
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return undefined;

    let raf = 0;
    let offset = 0;
    let paused = false;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    let movedAbs = 0;

    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18;
    const measureSet = () => {
      const cards = Array.from(track.children).slice(0, count);
      if (cards.length < 2) return 0;
      const first = cards[0];
      const last = cards[cards.length - 1];
      return last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
    };
    let setWidth = measureSet();

    const apply = () => {
      if (setWidth > 0) {
        while (offset <= -setWidth) offset += setWidth;
        while (offset > 0) offset -= setWidth;
      }
      track.style.transform = `translateX(${offset}px)`;
    };
    const tick = () => {
      if (!paused) offset -= 0.5; // långsamt transportband
      apply();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      if (!dragging) paused = false;
    };
    const onDown = (e) => {
      dragging = true;
      paused = true;
      startX = e.clientX;
      startOffset = offset;
      movedAbs = 0;
      vp.classList.add("is-drag");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      movedAbs = Math.max(movedAbs, Math.abs(dx));
      offset = startOffset + dx;
    };
    const onUp = () => {
      dragging = false;
      draggedRef.current = movedAbs >= 6; // äkta drag → svälj efterföljande klick
      vp.classList.remove("is-drag");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.setTimeout(() => {
        paused = false;
      }, 250);
    };
    const onResize = () => {
      setWidth = measureSet();
    };

    vp.addEventListener("pointerenter", onEnter);
    vp.addEventListener("pointerleave", onLeave);
    vp.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener("pointerenter", onEnter);
      vp.removeEventListener("pointerleave", onLeave);
      vp.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      track.style.transform = "";
    };
  }, [mode, count]);

  // ── Tangentbord + scroll-lås när en overlay är öppen ──
  useEffect(() => {
    const overlayOpen = lightbox !== null || portfolioOpen;
    if (!overlayOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightbox !== null) setLightbox(null);
        else setPortfolioOpen(false);
      } else if (lightbox !== null && e.key === "ArrowRight") {
        step(1);
      } else if (lightbox !== null && e.key === "ArrowLeft") {
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, portfolioOpen, step]);

  if (!count) return null;

  const renderCard = (url, i, clone = false) => (
    <button
      type="button"
      key={(clone ? "c" : "") + i}
      className="rg-card"
      data-idx={i}
      onClick={openAt(i)}
      aria-label={`Öppna bild ${i + 1} av ${count}`}
      tabIndex={clone ? -1 : 0}
      aria-hidden={clone ? "true" : undefined}
    >
      <img src={url} alt={`${studioName} – tatuering ${i + 1}`} loading="lazy" draggable="false" />
    </button>
  );

  const vpClass =
    "rg-viewport" +
    (mode === "marquee" ? " rg-viewport--marquee" : "") +
    (mode === "scroll" ? " rg-viewport--scroll" : "");
  const trackClass = "rg-track" + (mode === "static" ? " rg-track--center" : "");

  return (
    <div className="rg">
      <div className={vpClass} ref={viewportRef}>
        <div className={trackClass} ref={trackRef}>
          {list.map((url, i) => renderCard(url, i))}
          {mode === "marquee" ? list.map((url, i) => renderCard(url, i, true)) : null}
        </div>
      </div>

      <div className="rg-cta-row">
        <button type="button" className="rg-portfolio-link" onClick={() => setPortfolioOpen(true)}>
          Se hela portföljen
          <span className="rg-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      {/* Portfölj-overlay: alla bilder i ett rutnät */}
      {portfolioOpen ? (
        <div
          className="rg-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Portfölj – ${studioName}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPortfolioOpen(false);
          }}
        >
          <button className="rg-overlay-close" type="button" onClick={() => setPortfolioOpen(false)} aria-label="Stäng portföljen">
            ✕
          </button>
          <div className="rg-portfolio">
            <p className="rg-portfolio-eyebrow">Portfölj</p>
            <h3 className="rg-portfolio-title">{studioName}</h3>
            <p className="rg-portfolio-sub">Klicka på en bild för att se den i närbild.</p>
            <div className="rg-portfolio-grid">
              {list.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className="rg-card rg-card--grid"
                  onClick={() => setLightbox(i)}
                  aria-label={`Öppna bild ${i + 1} av ${count}`}
                >
                  <img src={url} alt={`${studioName} – tatuering ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Lightbox: en bild i närbild */}
      {lightbox !== null ? (
        <div
          className="rg-overlay rg-overlay--lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Bild ${lightbox + 1} av ${count}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null);
          }}
        >
          <button className="rg-overlay-close" type="button" onClick={() => setLightbox(null)} aria-label="Stäng">
            ✕
          </button>
          {count > 1 ? (
            <button className="rg-lb-nav rg-lb-prev" type="button" onClick={() => step(-1)} aria-label="Föregående bild">
              ‹
            </button>
          ) : null}
          <figure className="rg-lb-figure">
            <img src={list[lightbox]} alt={`${studioName} – tatuering ${lightbox + 1}`} />
            <figcaption className="rg-lb-counter">
              {lightbox + 1} / {count}
            </figcaption>
          </figure>
          {count > 1 ? (
            <button className="rg-lb-nav rg-lb-next" type="button" onClick={() => step(1)} aria-label="Nästa bild">
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
