import { useEffect, useState } from "react";
import { buildPageTitle, usePageMetadata } from "../utils/pageMetadata";
import { SiteLink } from "../utils/siteRouter";
import { useLanguage } from "../i18n/LanguageContext";

// ?plan=trial förväljer 30-dagars gratisperioden på CRM:ets registersida.
const REGISTER_URL = "https://inkrevenue-crm.online/register";
const FORWARDED_UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// UTM-parametrar (t.ex. från Instagram-bion) skickas vidare till registreringen
// så att signups kan attribueras till rätt kanal.
function useRegisterHref() {
  const [href, setHref] = useState(`${REGISTER_URL}?plan=trial`);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forwarded = new URLSearchParams({ plan: "trial" });

    for (const key of FORWARDED_UTM_KEYS) {
      const value = params.get(key);
      if (value) forwarded.set(key, value);
    }

    setHref(`${REGISTER_URL}?${forwarded.toString()}`);
  }, []);

  return href;
}

function ArrowIcon() {
  return (
    <svg className="btn__icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrialPage() {
  const { t } = useLanguage();
  const registerHref = useRegisterHref();

  usePageMetadata({
    title: buildPageTitle(t("trial.metaTitle")),
    description: t("trial.metaDescription"),
    path: "/testa-gratis"
  });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero hero--trial" id="top">
        <div className="hero__orb hero__orb--left" />
        <div className="hero__orb hero__orb--right" />
        <div className="container hero__content">
          <div className="brand-lockup">
            <img className="brand-logo" src="/ink-revenue-logo.svg" alt={t("common.logoAlt")} />
            <div className="brand-mark">Ink Revenue</div>
          </div>

          <p className="eyebrow eyebrow--light">{t("trial.eyebrow")}</p>
          <h1>{t("trial.title")}</h1>
          <p className="lead">{t("trial.lead")}</p>

          <div className="cta-row">
            <a className="btn btn-primary" href={registerHref}>
              {t("trial.ctaPrimary")}
              <ArrowIcon />
            </a>
          </div>
          <p className="cta-note">{t("trial.ctaNote")}</p>

          <div className="badge-row badge-row--light">
            <span className="badge">{t("trial.badge1")}</span>
            <span className="badge">{t("trial.badge2")}</span>
            <span className="badge">{t("trial.badge3")}</span>
          </div>
        </div>
      </section>

      {/* ── Det här ingår ── */}
      <section className="section section--white" id="det-har-ingar">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px" }}>
            <p className="eyebrow">{t("trial.includedEyebrow")}</p>
            <h2>{t("trial.includedTitle")}</h2>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              {t("trial.includedLead")}
            </p>
          </div>

          <div className="card-grid">
            <div className="card" data-reveal="up" data-reveal-delay="1">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h3>{t("trial.included1Title")}</h3>
              <p>{t("trial.included1Text")}</p>
            </div>
            <div className="card" data-reveal="up" data-reveal-delay="2">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>{t("trial.included2Title")}</h3>
              <p>{t("trial.included2Text")}</p>
            </div>
            <div className="card" data-reveal="up" data-reveal-delay="3">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>{t("trial.included3Title")}</h3>
              <p>{t("trial.included3Text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Så kommer ni igång ── */}
      <section className="section section--lavender" id="sa-kommer-ni-igang">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px" }}>
            <p className="eyebrow">{t("trial.startEyebrow")}</p>
            <h2>{t("trial.startTitle")}</h2>
          </div>

          <div className="steps" data-reveal="fade">
            <div className="step" data-reveal="up" data-reveal-delay="1">
              <div className="step__number">1</div>
              <h3>{t("trial.start1Title")}</h3>
              <p>{t("trial.start1Text")}</p>
            </div>
            <div className="step" data-reveal="up" data-reveal-delay="2">
              <div className="step__number">2</div>
              <h3>{t("trial.start2Title")}</h3>
              <p>{t("trial.start2Text")}</p>
            </div>
            <div className="step" data-reveal="up" data-reveal-delay="3">
              <div className="step__number">3</div>
              <h3>{t("trial.start3Title")}</h3>
              <p>{t("trial.start3Text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avslutande CTA ── */}
      <section className="section section--blue" id="kom-igang">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-title" data-reveal="fade">
            <div className="line" />
            <h2>{t("trial.readyTitle")}</h2>
            <div className="line" />
          </div>

          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              {t("trial.readyText")}
            </p>
            <div className="cta-row" style={{ marginTop: 28 }}>
              <a className="btn btn-primary" href={registerHref}>
                {t("trial.readyCta")}
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="trust-bar" data-reveal="up">
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {t("trial.trust1")}
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {t("trial.trust2")}
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {t("trial.trust3")}
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {t("trial.trust4")}
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {t("trial.trust5")}
            </div>
          </div>
        </div>
      </section>

      {/* ── Alternativ väg: managed ── */}
      <section className="section section--white" id="hellre-hanterat">
        <div className="container">
          <div className="trial-alt" data-reveal="up">
            <p className="eyebrow">{t("trial.altEyebrow")}</p>
            <h2>{t("trial.altTitle")}</h2>
            <p className="body" style={{ fontSize: "1.02rem" }}>
              {t("trial.altText")}
            </p>
            <SiteLink className="btn btn-secondary" href="/#bokning" style={{ marginTop: 10 }}>
              {t("trial.altCta")}
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  );
}
