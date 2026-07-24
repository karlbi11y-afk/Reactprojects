import { SiteLink } from "../utils/siteRouter";
import { buildPageTitle, usePageMetadata } from "../utils/pageMetadata";
import { useT } from "../i18n/LanguageContext";

export function NotFoundPage() {
  const t = useT();

  usePageMetadata({
    title: buildPageTitle(t("notFound.metaTitle")),
    description: t("notFound.metaDescription"),
    noIndex: true
  });

  return (
    <section className="section section--white">
      <div className="container">
        <div className="empty-panel">
          <p className="eyebrow">404</p>
          <h2>{t("notFound.title")}</h2>
          <p>{t("notFound.text")}</p>
          <div className="cta-row">
            <SiteLink className="btn btn-primary" href="/">
              {t("notFound.home")}
            </SiteLink>
            <SiteLink className="btn btn-secondary" href="/studios">
              {t("notFound.studios")}
            </SiteLink>
          </div>
        </div>
      </div>
    </section>
  );
}
