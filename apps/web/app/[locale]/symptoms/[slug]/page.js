// Symptom detail — urgency banner, related specialties, find-a-doctor CTA.
// MUST show "This is not a diagnosis. See a doctor."

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getSymptom, symptomDoctors } from '@/lib/knowledge';
import KnowledgeDisclaimer from '@/components/KnowledgeDisclaimer';

export const dynamic = 'force-dynamic';

const URGENCY_STYLE = {
  emergency: 'border-red-500 bg-red-50 text-red-800',
  urgent: 'border-orange-500 bg-orange-50 text-orange-800',
  soon: 'border-amber-500 bg-amber-50 text-amber-800',
  routine: 'border-gray-300 bg-gray-50 text-gray-700'
};

export async function generateMetadata({ params }) {
  const locale = resolveLocale(params.locale);
  const s = await getSymptom(params.slug);
  return { title: s ? `${locale === 'ml' ? s.name_ml : s.name_en} · ${t(locale, 'symptoms')}` : t(locale, 'symptoms') };
}

export default async function SymptomDetail({ params }) {
  const locale = resolveLocale(params.locale);
  const s = await getSymptom(params.slug);
  if (!s) notFound();
  const doctors = await symptomDoctors(params.slug);
  const topUrgency = s.specialties[0]?.urgency_level || 'routine';
  const topSpecialty = s.specialties[0];

  return (
    <article className="space-y-5">
      <h1 className="text-2xl font-bold">{locale === 'ml' ? s.name_ml : s.name_en}</h1>

      <div className={`rounded-lg border-l-4 px-4 py-3 text-sm font-medium ${URGENCY_STYLE[topUrgency]}`}>
        <span className="block text-xs uppercase tracking-wide opacity-70">{t(locale, 'when_to_seek')}</span>
        {t(locale, `urgency_${topUrgency}`)}
      </div>

      <KnowledgeDisclaimer locale={locale} />
      <p className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">{t(locale, 'not_diagnosis')}</p>

      {s.specialties.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{t(locale, 'related_specialists')}</h2>
          <div className="flex flex-wrap gap-2">
            {s.specialties.map((sp) => (
              <Link key={sp.slug} href={`/${locale}/doctors?specialty=${sp.id || ''}`}
                className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {locale === 'ml' ? sp.name_ml : sp.name_en}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link href={`/${locale}/doctors`}
        className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {t(locale, 'find_a_doctor')}
      </Link>

      {doctors.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{topSpecialty ? (locale === 'ml' ? topSpecialty.name_ml : topSpecialty.name_en) : ''}</h2>
          <div className="grid gap-2">
            {doctors.map((d) => (
              <Link key={d.id} href={`/${locale}/doctors/${d.slug}`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:shadow-sm">
                {d.display_name}{d.district_en ? ` · ${locale === 'ml' ? d.district_ml : d.district_en}` : ''}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
