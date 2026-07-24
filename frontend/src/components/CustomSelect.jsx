import { useEffect, useId, useRef, useState } from "react";

/**
 * CustomSelect — snygg dropdown på desktop, native <select> på touch/mobil.
 *
 * SSR-säker: renderar native <select> på servern och vid första paint, och
 * uppgraderar till custom-UI först efter mount på pekar-enheter med hover
 * (dvs riktiga desktops). Det undviker hydration-mismatch och ger mobil den
 * inbyggda systemväljaren (iOS-hjul / Android-lista).
 *
 * onChange emitterar { target: { name, value } } så komponenten är en drop-in
 * ersättare för ett vanligt <select> (handleChange läser event.target.name/value).
 *
 * options: Array<{ label, value, meta?, isOther? }>
 */
export function CustomSelect({
  name,
  value,
  onChange,
  onBlur,
  options,
  // Anropare skickar alltid en översatt placeholder; den här är bara ett
  // sista skyddsnät om någon glömmer.
  placeholder = "…",
  ariaInvalid = false,
  ariaLabelledBy,
  id,
  nativeClassName = ""
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const generatedId = useId();
  const listboxId = `${id || name || generatedId}-listbox`;

  // Bara riktiga desktops (hover + fin pekare) får custom-UI. Touch/mobil
  // behåller native <select>.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  // Håll aktivt (tangentbords-highlightat) alternativ synligt i panelen.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const selectedOption = options.find((option) => option.value === value) || null;
  // Om anroparen har ett riktigt tomt alternativ (t.ex. "Alla städer") ska vi
  // inte lägga till en disabled placeholder eller kräva ett val.
  const hasEmptyOption = options.some((option) => option.value === "");

  function emitChange(nextValue) {
    onChange?.({ target: { name, value: nextValue } });
  }

  // ---- Native path (mobil + SSR) ----
  if (!isDesktop) {
    return (
      <select
        id={id}
        name={name}
        className={`select-native${nativeClassName ? ` ${nativeClassName}` : ""}`}
        value={value}
        onChange={(event) => emitChange(event.target.value)}
        onBlur={onBlur}
        required={!hasEmptyOption}
        aria-invalid={ariaInvalid || undefined}
        aria-labelledby={ariaLabelledBy}
      >
        {hasEmptyOption ? null : (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // ---- Custom path (desktop) ----
  function openPanel() {
    setOpen(true);
    const current = options.findIndex((option) => option.value === value);
    setActiveIndex(current >= 0 ? current : 0);
  }

  function closePanel({ focusTrigger = false } = {}) {
    setOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function choose(option) {
    emitChange(option.value);
    closePanel({ focusTrigger: true });
  }

  function handleTriggerKeyDown(event) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key) && !open) {
      event.preventDefault();
      openPanel();
    }
  }

  function handleRootKeyDown(event) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel({ focusTrigger: true });
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option);
    } else if (event.key === "Tab") {
      closePanel();
    }
  }

  return (
    <div
      className={`dd${open ? " is-open" : ""}`}
      ref={rootRef}
      onKeyDown={handleRootKeyDown}
    >
      <button
        type="button"
        ref={triggerRef}
        id={id}
        className="dd__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid || undefined}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        onBlur={(event) => {
          // Stäng om fokus lämnar hela komponenten (klick utanför / tabb ut).
          if (!rootRef.current?.contains(event.relatedTarget)) {
            setOpen(false);
            setActiveIndex(-1);
            onBlur?.({ target: { name } });
          }
        }}
      >
        <span className={`dd__value${selectedOption ? "" : " is-placeholder"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="dd__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open ? (
        <div
          className="dd__panel"
          role="listbox"
          id={listboxId}
          aria-labelledby={ariaLabelledBy}
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <button
                type="button"
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                className={[
                  "dd__option",
                  option.isOther ? "dd__option--other" : "",
                  isSelected ? "is-selected" : "",
                  isActive ? "is-active" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="option"
                aria-selected={isSelected}
                // Använd mousedown så valet sker innan triggerns blur stänger panelen.
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <svg
                  className="dd__check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="dd__option-label">{option.label}</span>
                {option.meta ? <span className="dd__meta">{option.meta}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
