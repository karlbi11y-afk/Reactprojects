import { buildPageTitle, useJsonLd, usePageMetadata } from "../utils/pageMetadata";
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
  },
  {
    q: "Vad kostar det?",
    a: "Priset beror på vilken plan ni väljer: Hemsidebygge (engångskostnad), Marknadsföringsplan (procentandel per inkommen kund), Bokningsplan (månadsabonnemang) eller Kombipaket (allt utom hemsidebygge, procentandel per kund). Boka ett gratis strategisamtal så går vi igenom vilket upplägg som passar er bäst.",
    aNode: (
      <>
        <p>Priset beror på vilken plan ni väljer. Vi erbjuder fyra upplägg:</p>
        <ul>
          <li><strong>Hemsidebygge</strong> — engångskostnad</li>
          <li><strong>Marknadsföringsplan</strong> — procentandel per inkommen kund, inget fast månadspris</li>
          <li><strong>Bokningsplan</strong> — fast månadsabonnemang utan bindningstid</li>
          <li><strong>Kombipaket</strong> — allt i ett (utom hemsidebygge), procentandel per inkommen kund</li>
        </ul>
        <p>Boka ett gratis strategisamtal så går vi igenom vilket upplägg som passar er bäst.</p>
      </>
    )
  },
  {
    q: "Hur kommer kunderna i kontakt med oss via Ink Revenue?",
    a: "På två sätt. Dels marknadsför vi er i era egna kanaler — Instagram, TikTok och Facebook — så att ni löpande får nya följare och förfrågningar därifrån. Dels syns ni i vår studio-katalog, där kunder filtrerar på stil och stad och skickar en förfrågan direkt via er studio-sida. Alla förfrågningar samlas hos er — vi svarar och bokar in."
  },
  {
    q: "Kan vi se hur många förfrågningar vi får?",
    a: "Ja. Ni loggar in och ser alla förfrågningar, bokningar och er statistik i realtid."
  }
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a }
  }))
};

export function FaqPage() {
  usePageMetadata({
    title: buildPageTitle("Vanliga frågor om Ink Revenue"),
    description:
      "Svar på vanliga frågor om Ink Revenue — hur tjänsten fungerar, vad det kostar, hur snabbt ni ser resultat och vad som händer om ni vill avsluta.",
    path: "/faq"
  });

  useJsonLd(faqJsonLd);

  return (
    <div>
      <section className="page-hero page-hero--directory">
        <div className="container">
          <p className="eyebrow">Vanliga frågor</p>
          <h1>Svar på det ni undrar</h1>
          <p className="lead lead--dark">
            Allt ni behöver veta om hur Ink Revenue fungerar — innan ni bokar ett samtal.
          </p>
        </div>
      </section>

      <section className="section section--white">
        <div className="container" style={{ maxWidth: 800 }}>
          <dl className="faq-page__list">
            {FAQ_ITEMS.map(({ q, a, aNode }, index) => (
              <div key={q} className="faq-page__item" data-reveal="up" data-reveal-delay={Math.min(index, 2) || undefined}>
                <dt className="faq-page__q">{q}</dt>
                <dd className="faq-page__a">{aNode ?? a}</dd>
              </div>
            ))}
          </dl>

          <div className="faq-page__cta" data-reveal="up">
            <p>Hittade du inte svar på din fråga?</p>
            <SiteLink className="btn btn-primary" href="/#bokning">
              Boka ett gratis strategisamtal
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  );
}
