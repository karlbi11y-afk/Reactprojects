import { useEffect, useRef, useState } from "react";
import { PublicStudioCard } from "../components/PublicStudioCard";
import { StrategyCallForm } from "../components/StrategyCallForm";
import { getPublicStudios } from "../services/publicSiteApi";
import { buildPageTitle, usePageMetadata } from "../utils/pageMetadata";
import { SiteLink } from "../utils/siteRouter";

const FAQ_ITEMS = [
  {
    q: "Behöver vi sköta något själva?",
    a: "Nej. Ni godkänner material och svarar på våra frågor — det är allt. Vi sköter annonser, innehåll, kundkontakt och uppföljning. Ju mer ni berättar om er stil, desto bättre blir resultatet."
  },
  {
    q: "Hur snabbt ser vi resultat?",
    a: "De flesta studios ser de första förfrågningarna inom 1–2 veckor efter uppstart. Volym och kvalitet ökar löpande de första 60–90 dagarna allteftersom vi optimerar era kanaler."
  },
  {
    q: "Vad är skillnaden mot att sköta Instagram eller Google själv?",
    a: "Att göra det själv tar tid och ger ofta ojämna resultat. Vi är specialiserade på tatueringsbranschen och vet vad som fungerar — ni får en hel marknadsföringsavdelning till en bråkdel av kostnaden."
  },
  {
    q: "Hur ser vår studio-sida ut?",
    a: "Varje studio får en skräddarsydd sida med er logotyp, galleri, stil-taggar, om-oss-text och ett anpassat förfrågningsformulär. Kunder kan filtrera på stil, stad och känsla — och skicka en förfrågan med sin idé och budget direkt."
  },
  {
    q: "Vad händer om vi vill avsluta?",
    a: "Ni kan avsluta månad för månad utan förklaring. Ni äger alltid er data, era bilder och era sociala medier-kanaler. Vi hjälper till med överlämning om ni önskar."
  },
  {
    q: "Fungerar det för soloartister också?",
    a: "Absolut. Ink Revenue passar lika bra för soloartister som för studios med flera konstnärer. Vi anpassar upplägg och budget efter er situation."
  },
  {
    q: "Hur snabbt kan vi komma igång?",
    a: "Uppstart sker normalt inom 1 vecka efter att ni godkänt upplägget. Vi sätter upp er studio-sida, startar rätt kanaler och ni kan börja ta emot förfrågningar nästan direkt."
  }
];

function FaqItem({ q, a, revealDelay }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`faq-item${open ? " faq-item--open" : ""}`}
      data-reveal="up"
      data-reveal-delay={revealDelay || undefined}
    >
      <button
        className="faq-item__q"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <span className="faq-item__icon" aria-hidden="true">+</span>
      </button>
      <div className="faq-item__a">
        <div className="faq-item__a-inner">{a}</div>
      </div>
    </div>
  );
}

export function HomePage() {
  const [featuredStudios, setFeaturedStudios] = useState([]);
  const [loadingStudios, setLoadingStudios] = useState(true);

  usePageMetadata({
    title: buildPageTitle("Fler kunder till din tatueringsstudio"),
    description:
      "Ink Revenue tar hand om hela er marknadsföring — annonser, innehåll och kundförfrågningar från start till slut. Ni fokuserar på konsten. Vi fyller kalendern.",
    path: "/"
  });

  useEffect(() => {
    let active = true;

    getPublicStudios()
      .then((studios) => {
        if (active) setFeaturedStudios(studios.slice(0, 3));
      })
      .catch(() => {
        if (active) setFeaturedStudios([]);
      })
      .finally(() => {
        if (active) setLoadingStudios(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero" id="top">
        <div className="hero__orb hero__orb--left" />
        <div className="hero__orb hero__orb--right" />
        <div className="container hero__content">
          <div className="brand-lockup">
            <img className="brand-logo" src="/ink-revenue-logo.svg" alt="Ink Revenue logotyp" />
            <div className="brand-mark">Ink Revenue</div>
          </div>

          <h1>Fler bokningar. Mindre admin.<br />Vi sköter marknadsföringen åt er.</h1>
          <p className="lead">
            Ink Revenue tar hand om <strong>hela er marknadsföring</strong> — annonser, innehåll
            och kundförfrågningar från start till slut. Ni fokuserar på konsten. Vi fyller kalendern.
          </p>

          <div className="cta-row">
            <SiteLink className="btn btn-primary" href="#bokning">
              Boka gratis strategisamtal
              <svg className="btn__icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </SiteLink>
            <SiteLink className="btn btn-secondary btn-secondary--hero" href="/testa-gratis">
              <span>Testa gratis i 14 dagar</span>
              <svg className="btn__icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </SiteLink>
          </div>
          <p className="cta-note">Ingen bindning, inga dolda avgifter — testa själv eller låt oss sköta allt</p>

          <div className="audience-grid">
            <article className="audience-card audience-card--studio">
              <p className="audience-card__eyebrow">För studioägare</p>
              <h3>Sluta jaga kunder. Låt dem hitta er.</h3>
              <p>Vi sätter upp er studio-sida, kör annonser och hanterar förfrågningar — så ni kan hålla fokus på tatueringarna.</p>
              <SiteLink className="btn btn-secondary btn-secondary--light" href="#sa-funkar-det">
                Se hur vi hjälper studios
                <svg className="btn__icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </SiteLink>
            </article>

            <article className="audience-card audience-card--customer">
              <p className="audience-card__eyebrow">För tatueringskunder</p>
              <h3>Hitta rätt studio för just din stil.</h3>
              <p>Bläddra studios efter stil, stad och känsla — se galleri och skicka förfrågan direkt. Enklare än hashtag-jakt.</p>
              <SiteLink className="btn btn-primary" href="/studios">Utforska studios</SiteLink>
            </article>
          </div>
        </div>
      </section>

      {/* ── Så här fungerar det ── */}
      <section className="section section--white" id="sa-funkar-det">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px" }}>
            <p className="eyebrow">För Studioägare</p>
            <h2>Så här fungerar Ink Revenue</h2>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              Tre enkla steg från att ni kontaktar oss till att förfrågningarna börjar komma in.
            </p>
          </div>

          <div className="steps" data-reveal="fade">
            <div className="step" data-reveal="up" data-reveal-delay="1">
              <div className="step__number">1</div>
              <h3>Boka ett strategisamtal</h3>
              <p>Vi lär känna er studio, era mål och vilken typ av kunder ni vill nå. Samtalet är gratis och utan förpliktelser.</p>
            </div>
            <div className="step" data-reveal="up" data-reveal-delay="2">
              <div className="step__number">2</div>
              <h3>Vi sätter upp allt åt er</h3>
              <p>Vi bygger er studio-sida, optimerar er profil och startar rätt marknadsföringskanaler. Ni godkänner — vi kör.</p>
            </div>
            <div className="step" data-reveal="up" data-reveal-delay="3">
              <div className="step__number">3</div>
              <h3>Förfrågningarna börjar komma in</h3>
              <p>Ni loggar in och ser förfrågningar, bokningar och statistik samlat på ett ställe. Vi sköter uppföljningen — ni tatuerar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── För studioägare ── */}
      <section className="section section--lavender" id="for-studios">
        <div className="container">
          <div className="grid-2">
            <div data-reveal="left">
              <p className="eyebrow">För Studioägare</p>
              <h2>Ni sköter tatueringarna. Vi sköter resten.</h2>
              <p className="body" style={{ fontSize: "1.05rem" }}>
                De flesta studios tappar kunder för att de syns dåligt eller svarar för långsamt.
                Vi löser det åt er — ni behöver inte lära er ett enda marknadsföringsverktyg.
              </p>
              <p className="body">
                Ni får en studio-sida som säljer, annonser som leder till bokade kunder och en
                person som faktiskt följer upp varje förfrågan.
              </p>
              <div className="badge-row" style={{ marginTop: 18 }}>
                <span className="badge">✓ Ni sköter inga annonser</span>
                <span className="badge">✓ Ni skriver inga texter</span>
                <span className="badge">✓ Vi hanterar inkorgen</span>
              </div>
            </div>

            <div className="card-grid card-grid--single" style={{ gap: 16 }}>
              <div className="card" data-reveal="right" data-reveal-delay="1">
                <div className="card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3>Syns där kunderna letar</h3>
                <p>Vi ser till att ni syns på Google, i sociala medier och i vår studio-katalog — där kunderna redan letar.</p>
              </div>
              <div className="card" data-reveal="right" data-reveal-delay="2">
                <div className="card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <h3>En studio-sida som säljer er</h3>
                <p>Er sida lyfter stil, galleri och känsla — så att rätt kunder känner igen sig direkt och väljer just er.</p>
              </div>
              <div className="card" data-reveal="right" data-reveal-delay="3">
                <div className="card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Bättre förfrågningar från start</h3>
                <p>Kunder beskriver idé, placering och budget i förväg — ni slipper fram-och-tillbaka och kan svara med ett prisförslag direkt.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── För kunder ── */}
      <section className="section section--white" id="for-customers">
        <div className="container">
          <div className="section-heading" data-reveal="up">
            <div>
              <p className="eyebrow">För Tatueringskunder</p>
              <h2>Hitta studios efter din stil — inte efter hashtags</h2>
              <p className="body" style={{ maxWidth: 560, fontSize: "1.02rem" }}>
                Filtrera på stil, stad och känsla. Se galleri och läs om studion — skicka sedan en
                förfrågan direkt utan att behöva jaga DMs.
              </p>
            </div>
            <SiteLink className="btn btn-secondary" href="/studios" style={{ whiteSpace: "nowrap" }}>
              Se alla studios
            </SiteLink>
          </div>

          {loadingStudios ? (
            <div className="loading-state">Laddar studios...</div>
          ) : featuredStudios.length ? (
            <div className="studio-grid">
              {featuredStudios.map((studio, index) => (
                <PublicStudioCard key={studio.id} studio={studio} compact revealDelay={index + 1} />
              ))}
            </div>
          ) : (
            <div className="empty-panel" data-reveal="up">
              <h3>Fler studios kommer snart</h3>
              <p>Vi fyller på katalogen löpande. Kom tillbaka snart för att upptäcka fler studios och tatuerare.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Varför Ink Revenue fungerar ── */}
      <section className="section section--blue">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-title" data-reveal="fade">
            <div className="line" />
            <h2>Varför Ink Revenue Fungerar</h2>
            <div className="line" />
          </div>

          <div className="card-grid">
            <div className="card" data-reveal="up" data-reveal-delay="1">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>100% hanterad service</h3>
              <p>Ni betalar för resultat, inte för att lära er verktyg. Vi är er marknadsföringsavdelning — ni behöver inte lyfta ett finger.</p>
            </div>

            <div className="card" data-reveal="up" data-reveal-delay="2">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Bättre matchning från start</h3>
              <p>Kunder ser stil, plats och galleri tydligt — de hör av sig för att de redan har valt er, inte för att chansa.</p>
            </div>

            <div className="card" data-reveal="up" data-reveal-delay="3">
              <div className="card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>Ingen investering utan resultat</h3>
              <p>Vi arbetar löpande och ni ser statistik i realtid. Inga dolda kostnader, ingen bindningstid — avsluta när ni vill.</p>
            </div>
          </div>

          <div className="trust-bar" data-reveal="up">
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Ingen bindningstid
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Gratis strategisamtal
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Ni äger alltid er data
            </div>
            <div className="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Uppstart inom 1 vecka
            </div>
          </div>
        </div>
      </section>

      {/* ── Planer ── */}
      <section className="section section--white" id="planer">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 52px" }}>
            <p className="eyebrow">Upplägg &amp; Priser</p>
            <h2>Välj det som passar er</h2>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              Vi har fyra upplägg — ni betalar bara för det ni faktiskt behöver. Exakta priser går vi igenom under strategisamtalet.
            </p>
          </div>

          <div className="card-grid card-grid--4">
            <div className="card" data-reveal="up" data-reveal-delay="1">
              <h3>Hemsidebygge</h3>
              <p className="card__price-model">Engångskostnad</p>
              <p>Vi bygger er en egen hemsida från grunden — professionell, mobilanpassad och redo att ta emot kunder.</p>
            </div>
            <div className="card" data-reveal="up" data-reveal-delay="2">
              <h3>Marknadsföringsplan</h3>
              <p className="card__price-model">% per inkommen kund</p>
              <p>Vi kör er marknadsföring på sociala medier och annonser. Ni betalar en andel per kund vi genererar — ingen fast månadsavgift.</p>
            </div>
            <div className="card" data-reveal="up" data-reveal-delay="3">
              <h3>Bokningsplan</h3>
              <p className="card__price-model">Månadsabonnemang</p>
              <p>Fast månadsavgift utan bindningstid. Ni får er studio-sida i katalogen, bokningsformulär och egen inloggning med full översikt.</p>
              <SiteLink className="card__link" href="/testa-gratis">
                Testa gratis i 14 dagar
                <svg className="btn__icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </SiteLink>
            </div>
            <div className="card card--featured" data-reveal="up" data-reveal-delay="4">
              <h3>Kombipaket</h3>
              <p className="card__price-model">% per inkommen kund</p>
              <p>Allt i ett — marknadsföring, studio-sida och bokningshantering. Ni betalar per kund vi levererar.</p>
            </div>
          </div>

          <div data-reveal="up" style={{ textAlign: "center", marginTop: 40 }}>
            <SiteLink className="btn btn-primary" href="#bokning">
              Boka gratis strategisamtal — vi går igenom priserna
              <svg className="btn__icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h12M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </SiteLink>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section section--lavender" id="faq">
        <div className="container">
          <div data-reveal="up" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 44px" }}>
            <p className="eyebrow">Vanliga frågor</p>
            <h2>Svar på det ni undrar</h2>
          </div>

          <div className="faq" style={{ maxWidth: 760, margin: "0 auto" }}>
            {FAQ_ITEMS.map((item, index) => (
              <FaqItem key={item.q} q={item.q} a={item.a} revealDelay={Math.min(index, 5)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bokningsformulär ── */}
      <section className="section section--lavender" id="bokning">
        <div className="container booking">
          <div data-reveal="left">
            <p className="eyebrow">För Studioägare</p>
            <h2>Redo att få fler bokningar?</h2>
            <p className="body" style={{ fontSize: "1.05rem" }}>
              Boka ett gratis strategisamtal — 20 minuter. Vi går igenom era mål, vilka kunder ni
              vill nå och vilket upplägg som passar er bäst.
            </p>
            <p className="body">Samtalet är utan förpliktelser. Ni bestämmer om ni vill gå vidare.</p>
            <div className="badge-row" style={{ marginTop: 24 }}>
              <span className="badge">✓ Gratis samtal</span>
              <span className="badge">✓ 20 minuter</span>
              <span className="badge">✓ Svar inom 24h</span>
            </div>
          </div>

          <StrategyCallForm />
        </div>
      </section>
    </div>
  );
}
