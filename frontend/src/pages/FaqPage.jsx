import { useMemo } from "react";
import { buildPageTitle, useJsonLd, usePageMetadata } from "../utils/pageMetadata";
import { SiteLink } from "../utils/siteRouter";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Frågan om pris renderas som en riktig lista i stället för ett stycke.
 * `rich: "pricing"` i ordboken markerar vilken fråga det gäller, så texten och
 * strukturen kan översättas var för sig.
 */
function PricingAnswer({ t, tList }) {
  return (
    <>
      <p>{t("faqPage.pricingIntro")}</p>
      <ul>
        {tList("faqPage.pricingItems").map((item) => (
          <li key={item.term}>
            <strong>{item.term}</strong>{item.text}
          </li>
        ))}
      </ul>
      <p>{t("faqPage.pricingOutro")}</p>
    </>
  );
}

export function FaqPage() {
  const { t, tList } = useLanguage();
  const items = tList("faqPage.items");

  usePageMetadata({
    title: buildPageTitle(t("faqPage.metaTitle")),
    description: t("faqPage.metaDescription"),
    path: "/faq"
  });

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": items.map(({ q, a }) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      }))
    }),
    [items]
  );

  useJsonLd(faqJsonLd);

  return (
    <div>
      <section className="page-hero page-hero--directory">
        <div className="container">
          <p className="eyebrow">{t("faqPage.eyebrow")}</p>
          <h1>{t("faqPage.title")}</h1>
          <p className="lead lead--dark">{t("faqPage.lead")}</p>
        </div>
      </section>

      <section className="section section--white">
        <div className="container" style={{ maxWidth: 800 }}>
          <dl className="faq-page__list">
            {items.map(({ q, a, rich }, index) => (
              <div key={q} className="faq-page__item" data-reveal="up" data-reveal-delay={Math.min(index, 2) || undefined}>
                <dt className="faq-page__q">{q}</dt>
                <dd className="faq-page__a">
                  {rich === "pricing" ? <PricingAnswer t={t} tList={tList} /> : a}
                </dd>
              </div>
            ))}
          </dl>

          <div className="faq-page__cta" data-reveal="up">
            <p>{t("faqPage.ctaText")}</p>
            <SiteLink className="btn btn-primary" href="/#bokning">
              {t("faqPage.ctaButton")}
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  );
}
