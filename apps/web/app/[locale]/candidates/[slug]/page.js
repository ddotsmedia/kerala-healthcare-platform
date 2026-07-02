// Public candidate profile. Contact fields are NOT shown here (contact
// protection) — employers see contact only after shortlisting, in the
// employer application view.

import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getCandidateBySlug } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  const c = await getCandidateBySlug(params.slug);
  return { title: c ? `${c.headline || c.role_category} · ${t(locale, 'candidate')}` : t(locale, 'candidate') };
}

export default async function CandidateProfile({ params }) {
  const locale = resolveLocale(params.locale);
  const c = await getCandidateBySlug(params.slug);
  if (!c) notFound();

  return (
    <article className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{c.headline || c.role_category}</h1>
        <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-gray-600">
          <span>{c.role_category}</span>
          <span>{c.experience_years} {t(locale, 'years')} {t(locale, 'experience')}</span>
          <span>{locale === 'ml' ? c.district_ml : c.district_en}</span>
          {c.is_open_to_work && <span className="font-medium text-emerald-600">{t(locale, 'open_to_work')}</span>}
        </div>
      </header>
      {c.summary && <p className="text-sm leading-relaxed text-gray-800">{c.summary}</p>}

      {c.experience.length > 0 && (
        <section><h2 className="mb-1 text-sm font-semibold text-gray-700">{t(locale, 'experience')}</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            {c.experience.map((e, i) => <li key={i}>{e.role}{e.employer ? ` · ${e.employer}` : ''}{e.from_year ? ` (${e.from_year}–${e.to_year || ''})` : ''}</li>)}
          </ul></section>
      )}
      {c.education.length > 0 && (
        <section><h2 className="mb-1 text-sm font-semibold text-gray-700">Education</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            {c.education.map((e, i) => <li key={i}>{e.degree}{e.institution ? ` — ${e.institution}` : ''}{e.year ? ` (${e.year})` : ''}</li>)}
          </ul></section>
      )}
      <p className="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-600">Contact details are shared with employers after shortlisting.</p>
    </article>
  );
}
