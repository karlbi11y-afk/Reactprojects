import { useEffect, useMemo, useRef, useState } from "react";
import { FormLegalLinks } from "./FormLegalLinks";
import { useLegalConsent } from "../contexts/LegalConsentContext";
import {
  createPublicStudioLead,
  previewPublicStudioBooking
} from "../services/publicSiteApi";
import { useAbandonedFormDraft } from "../hooks/useAbandonedFormDraft";
import { getTrackingPayload } from "../utils/tracking";
import { prepareLeadImageUpload } from "../utils/prepareLeadImageUpload";

const WEEKDAY_LABELS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

const baseForm = {
  name: "",
  email: "",
  phone: "",
  tattooStyle: "",
  placement: "",
  size: "",
  budget: "",
  description: "",
  website: "",
  preferredStartTime: "",
  preferredEndTime: "",
  requestedDurationMinutes: ""
};

function buildInitialForm() {
  return { ...baseForm };
}

function createAvailabilityState(overrides = {}) {
  return { state: "idle", message: "", data: null, ...overrides };
}

function parseDateKey(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getMonthLabel(date) {
  const label = date.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getCalendarGridStart(date) {
  const gridStart = new Date(date);
  const weekday = (gridStart.getDay() + 6) % 7;
  gridStart.setDate(gridStart.getDate() - weekday);
  return gridStart;
}

function getCalendarGridEnd(date) {
  const gridEnd = new Date(date);
  const weekday = (gridEnd.getDay() + 6) % 7;
  gridEnd.setDate(gridEnd.getDate() + (6 - weekday));
  return gridEnd;
}

function getSelectedSlotLabel(dateEntry, preferredStartTime) {
  if (!dateEntry?.slots?.length || !preferredStartTime) return "";
  return dateEntry.slots.find((slot) => slot.startTime === preferredStartTime)?.label || "";
}

function getCalendarDayText(day) {
  if (!day.inCurrentMonth || !day.inLoadedRange) return "";
  if (day.isAvailable) return day.slotCount === 1 ? "1 tid" : `${day.slotCount} tider`;
  return "Upptagen";
}

function formatDurationLabel(minutes) {
  const normalizedMinutes = Number.parseInt(String(minutes || ""), 10);
  if (!normalizedMinutes) return "";
  const hours = Math.floor(normalizedMinutes / 60);
  const remainingMinutes = normalizedMinutes % 60;
  if (hours && remainingMinutes) return `${hours} h ${remainingMinutes} min`;
  if (hours) return `${hours} h`;
  return `${remainingMinutes} min`;
}

function getBookingTypeLabel(type) {
  const labels = {
    consultation: "Konsultation",
    tattoo_session: "Tatueringspass",
    touch_up: "Touch-up"
  };
  return labels[type] || type || "";
}

function buildCalendarMonths(availabilityData) {
  const startDate = parseDateKey(availabilityData?.startDate);
  if (!startDate) return [];
  const availableDates = new Map(
    (availabilityData?.dates || []).map((dateEntry) => [dateEntry.date, dateEntry])
  );
  const daysToShow = Math.max(1, Number.parseInt(String(availabilityData?.days || ""), 10) || 1);
  const endDate = addDays(startDate, daysToShow - 1);
  const lastMonthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const months = [];
  for (
    let monthCursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    monthCursor.getTime() <= lastMonthStart.getTime();
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
  ) {
    const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const gridStart = getCalendarGridStart(monthStart);
    const gridEnd = getCalendarGridEnd(monthEnd);
    const days = [];
    for (
      let cursor = new Date(gridStart);
      cursor.getTime() <= gridEnd.getTime();
      cursor = addDays(cursor, 1)
    ) {
      const dateKey = formatDateKey(cursor);
      const dateEntry = availableDates.get(dateKey) || null;
      const inLoadedRange =
        cursor.getTime() >= startDate.getTime() && cursor.getTime() <= endDate.getTime();
      const inCurrentMonth = cursor.getMonth() === monthStart.getMonth();
      const slotCount = dateEntry?.slots?.length || 0;
      days.push({
        key: dateKey,
        date: dateKey,
        dayNumber: cursor.getDate(),
        label:
          dateEntry?.label ||
          cursor.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" }),
        inCurrentMonth,
        inLoadedRange,
        isAvailable: slotCount > 0,
        isSelectable: inLoadedRange && inCurrentMonth && slotCount > 0,
        slotCount
      });
    }
    months.push({
      key: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      label: getMonthLabel(monthStart),
      availableDayCount: days.filter((day) => day.isSelectable).length,
      days
    });
  }
  return months;
}

function hasEnoughDetailsForCalendar(formData) {
  return Boolean(
    String(formData.tattooStyle || "").trim() &&
      String(formData.placement || "").trim() &&
      String(formData.size || "").trim() &&
      String(formData.description || "").trim()
  );
}

function clearRequestedTimeSelection(currentFormData, requestedDurationMinutes = "") {
  return {
    ...currentFormData,
    preferredStartTime: "",
    preferredEndTime: "",
    requestedDurationMinutes: String(requestedDurationMinutes || "")
  };
}

function computeFieldError(name, formData) {
  switch (name) {
    case "tattooStyle":
      return !formData.tattooStyle.trim() ? "Fyll i tatueringsstil." : "";
    case "placement":
      return !formData.placement.trim() ? "Fyll i placering." : "";
    case "size":
      return !formData.size.trim() ? "Fyll i storlek." : "";
    case "description":
      return !formData.description.trim() ? "Beskriv motiv och önskemål." : "";
    case "name":
      return formData.name.trim().length < 2 ? "Fyll i ditt namn." : "";
    case "email":
      if (!formData.email.trim() && !formData.phone.trim()) {
        return "Ange minst din e-post eller ditt telefonnummer.";
      }
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        return "Ange en giltig e-postadress.";
      }
      return "";
    default:
      return "";
  }
}

const STEP_TATTOO_FIELDS = ["tattooStyle", "placement", "size", "description"];
const STEP_CONTACT_FIELDS = ["name", "email"];

export function StudioLeadFormEnhanced({
  studio,
  titleText = "",
  introText = "",
  successPreviewText = "",
  previewMode = false
}) {
  const [formData, setFormData] = useState(() => buildInitialForm());
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [availability, setAvailability] = useState(() => createAvailabilityState());
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(0);
  const [inspirationImage, setInspirationImage] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [touched, setTouched] = useState(new Set());
  const canSubmit = Boolean(studio?.slug);
  const { hasAcceptedConsent, openLegalModal } = useLegalConsent();
  const fileInputRef = useRef(null);
  const previewRequestIdRef = useRef(0);
  const formTopRef = useRef(null);
  const bookingFlow = studio?.bookingFlow;
  const canShowCalendar = Boolean(canSubmit && bookingFlow?.enabled);

  const steps = useMemo(() => {
    return [
      { id: "tattoo", label: "Om tatueringen" },
      ...(canShowCalendar ? [{ id: "time", label: "Välj tid" }] : []),
      { id: "contact", label: "Dina uppgifter" }
    ];
  }, [canShowCalendar]);

  const hasEnoughDetails = useMemo(() => hasEnoughDetailsForCalendar(formData), [formData]);
  const draftPayload = useMemo(
    () => ({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tattooStyle: formData.tattooStyle,
      placement: formData.placement,
      size: formData.size,
      budget: formData.budget,
      description: formData.description,
      preferredStartTime: formData.preferredStartTime,
      preferredEndTime: formData.preferredEndTime,
      requestedDurationMinutes: formData.requestedDurationMinutes,
      privacyConsent: hasAcceptedConsent,
      marketingConsent: false,
      website: formData.website
    }),
    [formData, hasAcceptedConsent]
  );
  const { draftId, clearDraft } = useAbandonedFormDraft({
    type: "studio_lead",
    studioSlug: studio?.slug || "",
    payload: draftPayload,
    enabled: canSubmit
  });
  const requiresTimeSelection = Boolean(
    canShowCalendar &&
      hasEnoughDetails &&
      availability.state === "success" &&
      availability.data?.eligibleForDirectBooking
  );
  const isCheckingAvailability = Boolean(
    canShowCalendar && hasEnoughDetails && availability.state === "loading"
  );
  const selectedDateEntry = useMemo(
    () => availability.data?.dates?.find((d) => d.date === selectedDate) || null,
    [availability.data, selectedDate]
  );
  const calendarMonths = useMemo(
    () => buildCalendarMonths(availability.data),
    [availability.data]
  );
  const visibleMonth = useMemo(
    () => calendarMonths[visibleMonthIndex] || null,
    [calendarMonths, visibleMonthIndex]
  );

  useEffect(() => {
    previewRequestIdRef.current += 1;
    setFormData(buildInitialForm());
    setStatus({ state: "idle", message: "" });
    setAvailability(createAvailabilityState());
    setSelectedDate("");
    setVisibleMonthIndex(0);
    setInspirationImage(null);
    setCurrentStep(0);
    setTouched(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [studio?.slug]);

  useEffect(() => {
    previewRequestIdRef.current += 1;
    if (!canShowCalendar) {
      setAvailability(createAvailabilityState());
      setSelectedDate("");
      return;
    }
    if (!hasEnoughDetails) {
      setAvailability(createAvailabilityState());
      setSelectedDate("");
      setFormData((current) => clearRequestedTimeSelection(current));
      return;
    }
    let active = true;
    const timeoutId = setTimeout(() => {
      setAvailability(
        createAvailabilityState({ state: "loading", message: "Kontrollerar lediga tider..." })
      );
      previewPublicStudioBooking(studio.slug, {
        tattooStyle: formData.tattooStyle,
        placement: formData.placement,
        size: formData.size,
        budget: formData.budget,
        description: formData.description
      })
        .then((response) => {
          if (!active) return;
          setAvailability(createAvailabilityState({ state: "success", data: response }));
          setFormData((current) => {
            const slotStillAvailable = response?.dates?.some((dateEntry) =>
              dateEntry.slots?.some((slot) => slot.startTime === current.preferredStartTime)
            );
            if (slotStillAvailable) return current;
            return {
              ...current,
              preferredStartTime: "",
              preferredEndTime: "",
              requestedDurationMinutes: String(response?.suggestedDurationMinutes || "")
            };
          });
          setSelectedDate((current) => {
            if (response?.dates?.some((d) => d.date === current)) return current;
            return response?.dates?.[0]?.date || "";
          });
        })
        .catch((error) => {
          if (!active) return;
          setAvailability(
            createAvailabilityState({
              state: "error",
              message: error.message || "Det gick inte att kontrollera lediga tider just nu."
            })
          );
          setFormData((current) => ({
            ...current,
            preferredStartTime: "",
            preferredEndTime: "",
            requestedDurationMinutes: ""
          }));
          setSelectedDate("");
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [
    canShowCalendar,
    hasEnoughDetails,
    studio?.slug,
    formData.tattooStyle,
    formData.placement,
    formData.size,
    formData.budget,
    formData.description
  ]);

  useEffect(() => {
    if (!calendarMonths.length) {
      setVisibleMonthIndex(0);
      return;
    }
    const selectedMonthIndex = selectedDate
      ? calendarMonths.findIndex((month) =>
          month.days.some((day) => day.inCurrentMonth && day.date === selectedDate)
        )
      : -1;
    setVisibleMonthIndex((currentIndex) => {
      if (selectedMonthIndex >= 0) return selectedMonthIndex;
      return Math.min(currentIndex, calendarMonths.length - 1);
    });
  }, [calendarMonths, selectedDate]);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => new Set([...prev, name]));
  }

  function getFieldError(name) {
    if (!touched.has(name)) return "";
    return computeFieldError(name, formData);
  }

  function handleSlotSelect(slot, dateValue) {
    setSelectedDate(dateValue);
    setFormData((current) => ({
      ...current,
      preferredStartTime: slot.startTime,
      preferredEndTime: slot.endTime,
      requestedDurationMinutes: String(slot.durationMinutes || "")
    }));
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setInspirationImage(null);
      return;
    }
    setImageProcessing(true);
    try {
      const preparedImage = await prepareLeadImageUpload(file);
      setInspirationImage(preparedImage);
    } catch (error) {
      setInspirationImage(null);
      setStatus({
        state: "error",
        message: error.message || "Det gick inte att förbereda bilden för uppladdning."
      });
    } finally {
      setImageProcessing(false);
    }
  }

  function handleRemoveImage() {
    setInspirationImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function scrollToTop() {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNext() {
    const stepId = steps[currentStep].id;
    if (stepId === "tattoo") {
      const newTouched = new Set([...touched, ...STEP_TATTOO_FIELDS]);
      setTouched(newTouched);
      if (STEP_TATTOO_FIELDS.some((f) => computeFieldError(f, formData))) return;
    }
    if (stepId === "time") {
      if (requiresTimeSelection && !formData.preferredStartTime) {
        setStatus({ state: "error", message: "Välj en ledig tid innan du fortsätter." });
        return;
      }
      setStatus({ state: "idle", message: "" });
    }
    setCurrentStep((s) => s + 1);
    scrollToTop();
  }

  function handleBack() {
    setStatus({ state: "idle", message: "" });
    setCurrentStep((s) => s - 1);
    scrollToTop();
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
    if (!canSubmit) {
      setStatus({
        state: "error",
        message:
          studio?.previewDisabledMessage ||
          "Den här demosidan är inte kopplad till en riktig studio i CRM ännu."
      });
      return;
    }
    const newTouched = new Set([...touched, ...STEP_CONTACT_FIELDS]);
    setTouched(newTouched);
    if (STEP_CONTACT_FIELDS.some((f) => computeFieldError(f, formData))) return;
    setStatus({ state: "loading", message: "Skickar din förfrågan..." });
    try {
      const response = await createPublicStudioLead(studio.slug, {
        ...formData,
        privacyConsent: true,
        marketingConsent: false,
        draftId,
        inspirationImage: inspirationImage
          ? {
              fileName: inspirationImage.fileName,
              contentType: inspirationImage.contentType,
              dataUrl: inspirationImage.dataUrl
            }
          : null,
        ...getTrackingPayload()
      });
      setStatus({
        state: "success",
        message:
          response?.successMessage ||
          "Tack! Din förfrågan är skickad. Studion återkopplar normalt inom 24 timmar via e-post eller telefon."
      });
      setFormData(buildInitialForm());
      setSelectedDate("");
      setInspirationImage(null);
      setCurrentStep(0);
      setTouched(new Set());
      clearDraft();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error.message ||
          "Det gick inte att skicka just nu. Försök igen lite senare."
      });
    }
  }

  const stepId = steps[currentStep]?.id;
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <form
      className="booking-form studio-lead-form"
      onSubmit={handleSubmit}
      id="studio-form"
      ref={formTopRef}
    >
      {titleText || studio?.publicProfile?.formTitle ? (
        <h2>{titleText || studio?.publicProfile?.formTitle}</h2>
      ) : null}
      {introText ? <p className="form-note">{introText}</p> : null}
      {previewMode && successPreviewText ? (
        <div>
          <p className="form-note form-note--compact">
            Förhandsvisning av tackmeddelandet som visas efter skickad förfrågan
          </p>
          <p className="form-status form-status--success" role="status" aria-live="polite">
            {successPreviewText}
          </p>
        </div>
      ) : null}

      <div className="form-progress" aria-label={`Steg ${currentStep + 1} av ${steps.length}`}>
        <div className="form-progress-bar">
          <div className="form-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="form-progress-label">
          <span>Steg {currentStep + 1} av {steps.length}</span>
          <span>{steps[currentStep].label}</span>
        </p>
      </div>

      <div className="hidden-trap" aria-hidden="true">
        <label htmlFor="lead-website">
          Lämna detta fält tomt
          <input
            id="lead-website"
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </label>
      </div>

      {stepId === "tattoo" && (
        <div className="form-step">
          <div className="form-grid">
            <label
              htmlFor="lead-style"
              className={getFieldError("tattooStyle") ? "has-error" : ""}
            >
              Stil <span className="field-required">*</span>
              <input
                id="lead-style"
                type="text"
                name="tattooStyle"
                placeholder="Fineline, realism, blackwork..."
                value={formData.tattooStyle}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!getFieldError("tattooStyle")}
              />
              {getFieldError("tattooStyle") ? (
                <span className="field-error" role="alert">{getFieldError("tattooStyle")}</span>
              ) : null}
            </label>

            <label
              htmlFor="lead-placement"
              className={getFieldError("placement") ? "has-error" : ""}
            >
              Placering <span className="field-required">*</span>
              <input
                id="lead-placement"
                type="text"
                name="placement"
                placeholder="Arm, rygg, ben..."
                value={formData.placement}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!getFieldError("placement")}
              />
              {getFieldError("placement") ? (
                <span className="field-error" role="alert">{getFieldError("placement")}</span>
              ) : null}
            </label>

            <label htmlFor="lead-size" className={getFieldError("size") ? "has-error" : ""}>
              Storlek <span className="field-required">*</span>
              <input
                id="lead-size"
                type="text"
                name="size"
                placeholder="Liten, medium eller i cm"
                value={formData.size}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!getFieldError("size")}
              />
              {getFieldError("size") ? (
                <span className="field-error" role="alert">{getFieldError("size")}</span>
              ) : null}
            </label>

            <label htmlFor="lead-budget">
              Budget
              <input
                id="lead-budget"
                type="text"
                name="budget"
                placeholder="T.ex. 3000-5000 kr"
                value={formData.budget}
                onChange={handleChange}
              />
            </label>
          </div>

          <label
            htmlFor="lead-description"
            className={getFieldError("description") ? "has-error" : ""}
          >
            Berätta om din tatuering <span className="field-required">*</span>
            <textarea
              id="lead-description"
              name="description"
              rows="5"
              placeholder="Beskriv motiv, känsla, referenser och allt som är viktigt för studion att veta."
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!getFieldError("description")}
            />
            {getFieldError("description") ? (
              <span className="field-error" role="alert">{getFieldError("description")}</span>
            ) : null}
          </label>

          <div className="studio-lead-form__upload">
            <label htmlFor="lead-image">
              Inspirationsbild
              <input
                ref={fileInputRef}
                id="lead-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </label>
            <p className="form-note form-note--compact">
              Valfritt. Ladda upp en bild om du vill visa stil, motiv eller referens tydligare.
            </p>
            {imageProcessing ? (
              <p className="form-status form-status--muted">Bearbetar bilden...</p>
            ) : null}
            {inspirationImage ? (
              <div className="upload-preview">
                <img src={inspirationImage.previewUrl} alt="Förhandsvisning av inspirationsbild" />
                <div className="upload-preview__meta">
                  <span>{inspirationImage.fileName}</span>
                  <button className="btn btn-secondary" type="button" onClick={handleRemoveImage}>
                    Ta bort bild
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="form-step-nav">
            <button className="btn btn-primary" type="button" onClick={handleNext}>
              Nästa steg
            </button>
          </div>
        </div>
      )}

      {stepId === "time" && (
        <div className="form-step">
          {isCheckingAvailability ? (
            <p className="form-status form-status--muted">Kontrollerar lediga tider...</p>
          ) : null}
          {availability.state === "error" ? (
            <p className="form-status form-status--error">{availability.message}</p>
          ) : null}

          {availability.state === "success" && availability.data?.eligibleForDirectBooking ? (
            <section className="studio-booking-picker">
              {visibleMonth ? (
                <div className="studio-booking-picker__section">
                  <div className="studio-booking-picker__calendar-toolbar">
                    <button
                      className="studio-booking-picker__calendar-nav"
                      type="button"
                      onClick={() => setVisibleMonthIndex((i) => i - 1)}
                      disabled={visibleMonthIndex === 0}
                    >
                      Föregående
                    </button>
                    <strong>{visibleMonth.label}</strong>
                    <button
                      className="studio-booking-picker__calendar-nav"
                      type="button"
                      onClick={() => setVisibleMonthIndex((i) => i + 1)}
                      disabled={visibleMonthIndex >= calendarMonths.length - 1}
                    >
                      Nästa
                    </button>
                  </div>
                  <section className="studio-booking-picker__calendar">
                    <div className="studio-booking-picker__calendar-weekdays">
                      {WEEKDAY_LABELS.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                    <div className="studio-booking-picker__calendar-grid">
                      {visibleMonth.days.map((day) => (
                        <button
                          key={day.key}
                          className={`studio-booking-picker__calendar-day ${
                            day.inCurrentMonth
                              ? ""
                              : "studio-booking-picker__calendar-day--outside"
                          } ${
                            day.inLoadedRange
                              ? ""
                              : "studio-booking-picker__calendar-day--disabled"
                          } ${
                            day.isAvailable
                              ? "studio-booking-picker__calendar-day--available"
                              : ""
                          } ${
                            selectedDate === day.date
                              ? "studio-booking-picker__calendar-day--active"
                              : ""
                          }`}
                          type="button"
                          disabled={!day.isSelectable}
                          aria-label={day.label}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <span className="studio-booking-picker__calendar-day-number">
                            {day.dayNumber}
                          </span>
                          <span className="studio-booking-picker__calendar-day-meta">
                            {getCalendarDayText(day)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}

              {selectedDateEntry ? (
                <div className="studio-booking-picker__section">
                  <div className="studio-booking-picker__section-header">
                    <strong>Välj tid</strong>
                    <span>{selectedDateEntry.label}</span>
                  </div>
                  <div className="studio-booking-picker__times">
                    {selectedDateEntry.slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        className={`studio-booking-picker__time ${
                          formData.preferredStartTime === slot.startTime
                            ? "studio-booking-picker__time--active"
                            : ""
                        }`}
                        type="button"
                        onClick={() => handleSlotSelect(slot, selectedDateEntry.date)}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                  {!formData.preferredStartTime ? (
                    <p className="form-status form-status--muted">
                      Välj en tid för att fortsätta.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {formData.preferredStartTime ? (
                <div className="studio-booking-picker__summary">
                  <div>
                    <strong>Vald tid</strong>
                    <span>
                      {selectedDateEntry?.label || "Valt datum"} kl.{" "}
                      {getSelectedSlotLabel(selectedDateEntry, formData.preferredStartTime)}
                    </span>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {availability.state === "success" && !availability.data?.eligibleForDirectBooking ? (
            <section className="studio-booking-picker">
              <div className="studio-booking-picker__section">
                <div className="studio-booking-picker__section-header">
                  <strong>Studion behöver kika på motivet först</strong>
                  <span>{availability.data?.detectedSizeLabel || "Manuell planering"}</span>
                </div>
                <p className="form-status form-status--muted">
                  {availability.data?.summary ||
                    "Den här förfrågan behöver först granskas manuellt av studion."}
                </p>
                <div className="studio-booking-picker__summary">
                  {availability.data?.estimatedTotalDurationMinutes ? (
                    <div>
                      <strong>Beräknad total tid</strong>
                      <span>
                        {formatDurationLabel(availability.data.estimatedTotalDurationMinutes)}
                      </span>
                    </div>
                  ) : null}
                  {availability.data?.splitSessionCount ? (
                    <div>
                      <strong>Förslag</strong>
                      <span>{`${availability.data.splitSessionCount} sittningar à ${formatDurationLabel(
                        availability.data.splitSessionDurationMinutes
                      )}`}</span>
                    </div>
                  ) : null}
                  {availability.data?.suggestedBookingType ? (
                    <div>
                      <strong>Nästa steg</strong>
                      <span>{`${getBookingTypeLabel(availability.data.suggestedBookingType)}${
                        availability.data.suggestedDurationMinutes
                          ? ` • ${formatDurationLabel(availability.data.suggestedDurationMinutes)}`
                          : ""
                      }`}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {status.state === "error" ? (
            <p className="form-status form-status--error" role="alert">
              {status.message}
            </p>
          ) : null}

          <div className="form-step-nav">
            <button className="btn btn-secondary" type="button" onClick={handleBack}>
              Tillbaka
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleNext}
              disabled={isCheckingAvailability}
            >
              Nästa steg
            </button>
          </div>
        </div>
      )}

      {stepId === "contact" && (
        <div className="form-step">
          <div className="form-grid">
            <label htmlFor="lead-name" className={getFieldError("name") ? "has-error" : ""}>
              Namn <span className="field-required">*</span>
              <input
                id="lead-name"
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

            <label htmlFor="lead-email" className={getFieldError("email") ? "has-error" : ""}>
              E-post
              <input
                id="lead-email"
                type="email"
                name="email"
                placeholder="namn@mail.se"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!getFieldError("email")}
              />
              {getFieldError("email") ? (
                <span className="field-error" role="alert">{getFieldError("email")}</span>
              ) : null}
            </label>

            <label htmlFor="lead-phone">
              Telefonnummer
              <input
                id="lead-phone"
                type="tel"
                name="phone"
                placeholder="070-000 00 00"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </label>
          </div>

          <FormLegalLinks />

          {!canSubmit ? (
            <p className="form-status form-status--muted">
              Preview-läge: koppla sidan till en CRM-slug för att testa att skicka riktiga leads.
            </p>
          ) : null}

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

          <div className="form-step-nav">
            <button className="btn btn-secondary" type="button" onClick={handleBack}>
              Tillbaka
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={status.state === "loading" || imageProcessing || !canSubmit}
            >
              {status.state === "loading" ? "Skickar..." : "Skicka förfrågan"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
