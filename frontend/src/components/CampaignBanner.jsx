import { useLanguage } from "../i18n/LanguageContext";
import {
  formatCampaignDeadline,
  isLastDay,
  selectVisibleCampaigns
} from "../utils/campaignBanner";

/**
 * Kampanjbannern ovanför bokningsformuläret.
 *
 * Det här är steget som faktiskt höjer konverteringen: kunder som INTE vet att
 * kampanjen finns får se den. Alla som skickar in formuläret under fönstret får
 * erbjudandet — ingen kod, ingen särskild länk, inget kunden behöver göra.
 *
 * Data kommer med i studioobjektet som redan hämtas (`GET /public/studios/:slug`),
 * så ingen egen endpoint behövs — och därmed ingen rad i proxyn som kan glömmas.
 *
 * Logiken (tidszon, typfiltrering) bor i `utils/campaignBanner.js` och testas där.
 * Får aldrig hamna här inline: det är exakt de två sakerna som går fel tyst.
 */
export function CampaignBanner({ campaigns, bookingType }) {
  const { t, locale } = useLanguage();
  const visible = selectVisibleCampaigns(campaigns, bookingType);

  if (!visible.length) return null;

  return (
    <div className="campaign-banner" role="status">
      {visible.map((campaign) => (
        <div key={campaign.id} className="campaign-banner-item">
          <span className="campaign-banner-badge">{t("leadForm.campaign.badge")}</span>
          <p className="campaign-banner-title">
            <span aria-hidden="true">🎁 </span>
            {campaign.label}
          </p>
          {campaign.description ? (
            <p className="campaign-banner-text">{campaign.description}</p>
          ) : null}
          <p className="campaign-banner-meta">
            {isLastDay(campaign.endsAt)
              ? t("leadForm.campaign.deadlineToday")
              : t("leadForm.campaign.deadline", {
                  date: formatCampaignDeadline(campaign.endsAt, locale)
                })}
          </p>
          <p className="campaign-banner-note">{t("leadForm.campaign.note")}</p>
        </div>
      ))}
    </div>
  );
}
