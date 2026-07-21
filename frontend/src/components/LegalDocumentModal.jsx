import { LEGAL_DOCUMENTS } from "../data/legalContent";
import { SiteLink } from "../utils/siteRouter";

export function LegalDocumentModal({ activeDocument, onClose }) {
  const content = LEGAL_DOCUMENTS[activeDocument];

  if (!content) {
    return null;
  }

  return (
    <div className="legal-document" role="presentation">
      <div className="legal-document__backdrop" onClick={onClose} />
      <section
        className="legal-document__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-document-title"
      >
        <div className="legal-document__header">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="legal-document-title">{content.title}</h2>
          </div>
          <button
            className="legal-document__close"
            type="button"
            onClick={onClose}
            aria-label="Stäng dokumentet"
          >
            ×
          </button>
        </div>

        <div className="legal-document__content">
          {content.groups.map((group) => (
            <section key={group.heading}>
              <h3>{group.heading}</h3>
              {group.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <p>
            <SiteLink href={content.path} onClick={onClose}>
              Öppna som egen sida
            </SiteLink>
          </p>
        </div>
      </section>
    </div>
  );
}
