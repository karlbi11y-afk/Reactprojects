import { useEffect, useState } from "react";
import { buildPageTitle, usePageMetadata } from "../utils/pageMetadata";
import { SiteLink } from "../utils/siteRouter";

// ?plan=trial förväljer 14-dagars gratisperioden på CRM:ets registersida.
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
  const registerHref = useRegisterHref();

  usePageMetadata({
    title: buildPageTitle("Testa gratis i 14 dagar"),
    description:
      "Skapa ett konto och testa Ink Revenue gratis i 14 dagar — egen studio-sida, smartare bokningsförfrågningar och allt samlat på ett ställe. Ingen bindningstid.",
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
            <img className="brand-logo" src="/ink-revenue-logo.svg" alt="Ink Revenue logotyp" />
            <div className="brand-mark">Ink Revenue</div>
          </div>

          <p className="eyebrow eyebrow--light">För tatueringsstudior &amp; artister</p>
          <h1>Testa gratis i 14 dagar</h1>
          <p className="lead">
            Er egen studio-sida, bokningsförfrågningar med idé, placering och budget redan ifyllt —
            och allt samlat i en egen inloggning. Skapa kontot på några minuter.
          </p>

          <div className="cta-row">
            <a className="btn btn-primary" href={registerHref}>
              Kom igång gratis
              <ArrowIcon />
            </a>
          </div>
          <p className="cta-note">14 dagar gratis — ingen bindningstid, avsluta när ni vill</p>

          <div className="badge-row badge-row--light">
            <span className="badge">✓ Klart på några minuter</span>
            <span className="badge">✓ Ingen bindningstid</span>
            <span className="badge">✓ Ni äger alltid er data</span>
          </div>
        </div>
      </section>

      {/* ── Det här ingår ── */}
      <section className="section section--white" id="det-har-ingar">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px" }}>
            <p className="eyebrow">Det här ingår</p>
            <h2>Allt ni behöver för att ta emot fler bokningar</h2>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              Testperioden ger er tillgång till hela bokningsplanen — samma verktyg som våra betalande studios använder varje dag.
            </p>
          </div>

          <div className="card-grid">
            <div className="card" data-reveal="up" data-reveal-delay="1">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h3>Er egen studio-sida</h3>
              <p>Logotyp, galleri, stil-taggar och om-text — i vår katalog där kunder söker studio efter stil och stad.</p>
            </div>
            <div className="card" data-reveal="up" data-reveal-delay="2">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Förfrågningar med substans</h3>
              <p>Kunder beskriver idé, placering och budget direkt i formuläret — ni slipper fram-och-tillbaka i DM och kan svara med ett prisförslag direkt.</p>
            </div>
            <div className="card" data-reveal="up" data-reveal-delay="3">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>Allt samlat på ett ställe</h3>
              <p>Förfrågningar, bokningar och statistik i er egen inloggning. Inga kalkylark, inga missade meddelanden.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Så kommer ni igång ── */}
      <section className="section section--lavender" id="sa-kommer-ni-igang">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px" }}>
            <p className="eyebrow">Så kommer ni igång</p>
            <h2>Från konto till förfrågningar i tre steg</h2>
          </div>

          <div className="steps" data-reveal="fade">
            <div className="step" data-reveal="up" data-reveal-delay="1">
              <div className="step__number">1</div>
              <h3>Skapa ert konto</h3>
              <p>Registrera studion på ett par minuter. Inga säljsamtal — ni testar i er egen takt.</p>
            </div>
            <div className="step" data-reveal="up" data-reveal-delay="2">
              <div className="step__number">2</div>
              <h3>Sätt upp er sida</h3>
              <p>Ladda upp logotyp och galleri, välj era stilar och aktivera bokningsformuläret.</p>
            </div>
            <div className="step" data-reveal="up" data-reveal-delay="3">
              <div className="step__number">3</div>
              <h3>Ta emot förfrågningar</h3>
              <p>Dela er sida i bion och låt kunderna höra av sig — allt landar i er inkorg.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avslutande CTA ── */}
      <section className="section section--blue" id="kom-igang">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-title" data-reveal="fade">
            <div className="line" />
            <h2>Redo att testa?</h2>
            <div className="line" />
          </div>

          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              14 dagar räcker gott och väl för att sätta upp er sida och känna på flödet.
              Gillar ni det inte kostar det er ingenting.
            </p>
            <div className="cta-row" style={{ marginTop: 28 }}>
              <a className="btn btn-primary" href={registerHref}>
                Testa gratis i 14 dagar
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="trust-bar" data-reveal="up">
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              14 dagar gratis
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Ingen bindningstid
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Ni äger alltid er data
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Igång på några minuter
            </div>
          </div>
        </div>
      </section>

      {/* ── Alternativ väg: managed ── */}
      <section className="section section--white" id="hellre-hanterat">
        <div className="container">
          <div className="trial-alt" data-reveal="up">
            <p className="eyebrow">Vill ni hellre slippa allt själva?</p>
            <h2>Vi kan sköta hela marknadsföringen åt er</h2>
            <p className="body" style={{ fontSize: "1.02rem" }}>
              Annonser, innehåll och uppföljning av varje förfrågan — helt hanterat av oss.
              Boka ett gratis strategisamtal så går vi igenom vad som passar er studio bäst.
            </p>
            <SiteLink className="btn btn-secondary" href="/#bokning" style={{ marginTop: 10 }}>
              Boka gratis strategisamtal
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  );
}
