import { LEGAL_DOCUMENTS } from "../data/legalContent";
import { buildPageTitle, usePageMetadata } from "../utils/pageMetadata";
import { SiteLink } from "../utils/siteRouter";

/**
 * Publik sida för integritetspolicy och användarvillkor.
 *
 * Måste gå att nå direkt på sin URL utan inloggning och utan att först klicka
 * runt i sajten — Googles OAuth-verifiering avvisar policylänkar som bara
 * öppnas som modal. Rutterna är därför också med i prerender.mjs.
 */
export function LegalPage({ document: documentKey }) {
  const content = LEGAL_DOCUMENTS[documentKey];
  const other = Object.values(LEGAL_DOCUMENTS).find((doc) => doc.path !== content.path);

  usePageMetadata({
    title: buildPageTitle(content.eyebrow),
    description: content.lead,
    path: content.path
  });

  return (
    <div>
      <section className="page-hero page-hero--directory">
        <div className="container">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="lead lead--dark">{content.lead}</p>
        </div>
      </section>

      <section className="section section--white">
        <div className="container" style={{ maxWidth: 800 }}>
          <p className="legal-page__updated">Senast uppdaterad: {content.updated}</p>

          {content.groups.map((group, index) => (
            <section
              key={group.heading}
              className="legal-page__group"
              data-reveal="up"
              data-reveal-delay={Math.min(index, 2) || undefined}
            >
              <h2 className="legal-page__heading">{group.heading}</h2>
              {group.paragraphs.map((paragraph) => (
                <p key={paragraph} className="legal-page__text">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div className="legal-page__footer" data-reveal="up">
            <p>
              Frågor om hur vi hanterar dina uppgifter?{" "}
              <a href="mailto:info@inkrevenue.online">info@inkrevenue.online</a>
            </p>
            {other && <SiteLink href={other.path}>Läs även: {other.eyebrow}</SiteLink>}
          </div>
        </div>
      </section>
    </div>
  );
}
