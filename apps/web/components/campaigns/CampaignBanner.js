// CampaignBanner.js — homepage strip for the campaign currently running.
// Rendered only when lib/campaigns.activeCampaign() returned a row.

import Link from 'next/link';

const DEFAULT_THEME = '#0F766E';
const HEX = /^#[0-9A-Fa-f]{6}$/;

export default function CampaignBanner({ campaign, locale = 'ml' }) {
  if (!campaign) return null;
  const ml = locale === 'ml';
  const title = (ml ? campaign.title_ml : campaign.title_en) || campaign.title_en;
  const desc = (ml ? campaign.description_ml : campaign.description_en) || campaign.description_en;
  const theme = HEX.test(campaign.theme_color || '') ? campaign.theme_color : DEFAULT_THEME;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <Link
        href={`/${locale}/campaigns/${campaign.slug}`}
        style={{ backgroundColor: theme }}
        className="flex flex-col gap-2 rounded-xl px-4 py-3 text-white shadow-sm transition hover:opacity-95 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <span className="mr-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {ml ? 'ക്യാമ്പയിൻ' : 'Campaign'}
          </span>
          <span className="text-sm font-bold">{title}</span>
          {desc && <p className="mt-0.5 text-xs text-white/90">{desc}</p>}
        </div>
        <span className="shrink-0 text-sm font-semibold">
          {ml ? 'കൂടുതൽ അറിയൂ →' : 'Learn more →'}
        </span>
      </Link>
    </div>
  );
}
