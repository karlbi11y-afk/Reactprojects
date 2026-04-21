import { SiteLink } from "../utils/siteRouter";
import { getStudioTags } from "../utils/studioTags";

export function PublicStudioCard({ studio, compact = false, cardTheme = null }) {
  const tags = [...new Set(getStudioTags(studio))].slice(0, compact ? 3 : 5);
  const studioHref = `/studio/${studio.slug}`;
  const summary =
    studio.publicProfile?.cardSummary ||
    studio.publicProfile?.headline ||
    studio.description ||
    "Utforska studions stil, bilder och kontaktvägar här.";

  const mediaImageUrl = studio.heroImageUrl || studio.publicProfile?.galleryImageUrls?.[0] || null;
  const mediaStyle = mediaImageUrl
    ? {
        backgroundImage: cardTheme?.gradient
          ? `${cardTheme.gradient}, url(${mediaImageUrl})`
          : `linear-gradient(rgba(10, 26, 47, 0.2), rgba(10, 26, 47, 0.6)), url(${mediaImageUrl})`
      }
    : undefined;

  return (
    <SiteLink
      className={`studio-card ${compact ? "studio-card--compact" : ""}`}
      href={studioHref}
      aria-label={`Se studio ${studio.name}`}
    >
      <div className="studio-card__media" style={mediaStyle}>
        {studio.logoUrl ? (
          <img className="studio-card__logo" src={studio.logoUrl} alt={`${studio.name} logotyp`} />
        ) : null}
      </div>

      <div className="studio-card__body">
        <div className="studio-card__meta">
          <span>{studio.city || "Sverige"}</span>
          <span>{studio.publicProfile?.serviceArea || studio.city || "Tatueringsstudio"}</span>
        </div>

        <h3>{studio.name}</h3>
        <p>{summary}</p>

        {tags.length ? (
          <div className="badge-row">
            {tags.map((tag) => (
              <span
                key={tag}
                className="badge"
                style={
                  cardTheme?.badgeBg
                    ? { background: cardTheme.badgeBg, color: cardTheme.badgeText || "#fff", borderColor: cardTheme.badgeBg }
                    : undefined
                }
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <span
          className="btn btn-primary studio-card__cta"
          style={
            cardTheme?.ctaBg
              ? { background: cardTheme.ctaBg, color: cardTheme.ctaText || "#fff", borderColor: cardTheme.ctaBg }
              : undefined
          }
        >
          Se studio
        </span>
      </div>
    </SiteLink>
  );
}
