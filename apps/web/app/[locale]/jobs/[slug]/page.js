// Job detail (SSR) with JobPosting JSON-LD + apply CTA (login required).

import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getJobBySlug, currentCandidateProfile } from '@/lib/jobs';
import { getSession } from '@/lib/session';
import { jobPostingSchema } from '@/lib/schema';
import ApplyBox from '@/components/ApplyBox';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  const j = await getJobBySlug(params.slug);
  if (!j) return { title: t(locale, 'jobs') };
  return { title: `${j.title} · ${j.org_name}`.slice(0, 60), description: `${j.title} — ${j.org_name}, ${j.district_en || 'Kerala'}`.slice(0, 160) };
}

export default async function JobDetail({ params }) {
  const locale = resolveLocale(params.locale);
  const j = await getJobBySlug(params.slug);
  if (!j) notFound();
  const ld = jobPostingSchema(j, locale);
  const authed = !!getSession();

  return (
    <article className="space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{j.title}</h1>
        <p className="text-brand">{j.org_name}</p>
        <div className="flex flex-wrap gap-x-3 text-sm text-gray-600">
          <span>{locale === 'ml' ? j.district_ml : j.district_en}</span>
          <span>{t(locale, j.employment_type)}</span>
          <span>{j.experience_years_min}+ {t(locale, 'years')} {t(locale, 'experience')}</span>
          {j.salary_min && <span>₹{j.salary_min}{j.salary_max ? `–${j.salary_max}` : ''}</span>}
        </div>
      </header>

      {j.description && <p className="text-sm leading-relaxed text-gray-800">{j.description}</p>}
      {j.requirements && (
        <section><h2 className="mb-1 text-sm font-semibold text-gray-700">{t(locale, 'requirements')}</h2>
          <p className="text-sm text-gray-800">{j.requirements}</p></section>
      )}

      <ApplyBox jobId={j.id} authed={authed} loginHref={`/${locale}/login`}
        labels={{ login: t(locale, 'apply_login'), apply: t(locale, 'apply'), cover: '...', applied: t(locale, 'applied') || 'Applied', error: 'Error' }} />
    </article>
  );
}
