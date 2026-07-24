// Campaign landing page — branded hero, educational content, featured specialists,
// related articles, screening CTA, WhatsApp share. Awareness only, never diagnosis.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getCampaign, isRunning } from '@/lib/campaigns';
import { searchDoctors } from '@/lib/providers';
import { listPublishedContent } from '@/lib/knowledge';
import { DoctorCard } from '@khp/ui';
import { JsonLd, Breadcrumb, SITE } from '@/components/landing/LandingParts';
import CampaignShare from '@/components/campaigns/CampaignShare';

export const dynamic = 'force-dynamic';

const DEFAULT_THEME = '#0F766E';
const HEX = /^#[0-9A-Fa-f]{6}$/;
const DOCTOR_LIMIT = 6;
const ARTICLE_LIMIT = 3;

const pick = (ml, a, b) => (ml ? a : b) || b;
const theme = (c) => (HEX.test(c || '') ? c : DEFAULT_THEME);

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const c = await getCampaign(slug);
  if (!c) return { title: 'Campaign · MalayaliDoctor' };
  const ml = locale === 'ml';
  const title = pick(ml, c.title_ml, c.title_en);
  return {
    title: `${title} · MalayaliDoctor`.slice(0, 60),
    description: (pick(ml, c.description_ml, c.description_en) || title).slice(0, 160),
    alternates: {
      canonical: `/${locale}/campaigns/${c.slug}`,
      languages: { ml: `/ml/campaigns/${c.slug}`, en: `/en/campaigns/${c.slug}` }
    }
  };
}

export default async function CampaignPage(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const campaign = await getCampaign(slug);
  if (!campaign) notFound();

  const [doctors, articles] = await Promise.all([
    campaign.specialty_id
      ? searchDoctors({ specialtyId: campaign.specialty_id, page: 1, limit: DOCTOR_LIMIT })
      : Promise.resolve([]),
    listPublishedContent({ limit: ARTICLE_LIMIT })
  ]);

  const title = pick(ml, campaign.title_ml, campaign.title_en);
  const desc = pick(ml, campaign.description_ml, campaign.description_en);
  const body = pick(ml, campaign.content_ml, campaign.content_en);
  const colour = theme(campaign.theme_color);
  const url = `${SITE}/${locale}/campaigns/${campaign.slug}`;
  const specialtyName = pick(ml, campaign.specialty_ml, campaign.specialty_en);
  const bookHref = campaign.specialty_id
    ? `/${locale}/doctors?specialty=${campaign.specialty_id}`
    : `/${locale}/doctors`;

  return (
    <main className="space-y-8 pb-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: title,
        description: desc || title,
        url,
        inLanguage: locale === 'ml' ? 'ml-IN' : 'en-IN'
      }} />

      <header style={{ backgroundColor: colour }} className="px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl space-y-3">
          <Breadcrumb items={[
            { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
            { name: ml ? 'ക്യാമ്പയിനുകൾ' : 'Campaigns' },
            { name: title }
          ]} />
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          {desc && <p className="text-sm text-white/90">{desc}</p>}
          {isRunning(campaign) && (
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              ● {ml ? 'ഇപ്പോൾ നടക്കുന്നു' : 'Running now'}
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-8 px-4">
        {body && (
          <section aria-label={ml ? 'വിവരങ്ങൾ' : 'Information'}
            className="prose prose-sm max-w-none text-gray-700 [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: body }} />
        )}

        <section className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: colour }}>
          <p className="text-sm font-semibold text-gray-900">
            {ml ? 'ഒരു പരിശോധന ബുക്ക് ചെയ്യണോ?' : 'Want to book a screening?'}
          </p>
          <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link href={bookHref} style={{ backgroundColor: colour }}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              {ml ? 'പരിശോധന ബുക്ക് ചെയ്യുക →' : 'Book a screening →'}
            </Link>
            <CampaignShare title={title} url={url} locale={locale} />
          </div>
        </section>

        {doctors.length > 0 && (
          <section aria-label={ml ? 'വിദഗ്ധർ' : 'Specialists'}>
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              {specialtyName
                ? (ml ? `${specialtyName} വിദഗ്ധർ` : `Featured ${specialtyName} specialists`)
                : (ml ? 'വിദഗ്ധർ' : 'Featured specialists')}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section aria-label={ml ? 'ബന്ധപ്പെട്ട ലേഖനങ്ങൾ' : 'Related articles'}>
            <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ബന്ധപ്പെട്ട ലേഖനങ്ങൾ' : 'Related articles'}</h2>
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link href={`/${locale}/health/${a.slug}`}
                    className="block rounded-xl border border-gray-200 bg-white p-3 hover:border-brand">
                    <span className="text-sm font-semibold text-gray-900">{pick(ml, a.title_ml, a.title_en)}</span>
                    {(a.excerpt_ml || a.excerpt_en) && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{pick(ml, a.excerpt_ml, a.excerpt_en)}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div role="note" aria-label="medical-disclaimer"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          {ml
            ? 'ഈ ക്യാമ്പയിൻ പേജ് പൊതു ആരോഗ്യ അവബോധത്തിന് മാത്രമുള്ളതാണ് — രോഗനിർണയമോ ചികിത്സാ നിർദ്ദേശമോ അല്ല. ആരോഗ്യ പ്രശ്നങ്ങൾക്ക് യോഗ്യതയുള്ള ഡോക്ടറെ സമീപിക്കുക. അടിയന്തര സാഹചര്യങ്ങളിൽ 112 അല്ലെങ്കിൽ ആംബുലൻസിന് 108 വിളിക്കുക.'
            : 'This campaign page is general health awareness only — it is not a diagnosis or treatment advice. Always consult a qualified doctor for health concerns. In an emergency call 112, or 108 for an ambulance.'}
        </div>
      </div>
    </main>
  );
}
