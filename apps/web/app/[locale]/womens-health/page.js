// Women's Health Hub.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { searchDoctors } from '@/lib/providers';
import { getSpecialtyBySlug } from '@/lib/landing';
import { listPublishedContent } from '@/lib/knowledge';
import { TrustSection } from '@/components/trust/TrustParts';
import { HubHero, TopicGrid, HelplineBand, Disclaimer } from '@/components/hubs/HubParts';
import ArticleCard from '@/components/health/ArticleCard';
import { DoctorCard } from '@khp/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'സ്ത്രീ ആരോഗ്യം | MalayaliDoctor' : "Women's Health | MalayaliDoctor",
    description: "Women's health information in Malayalam — pregnancy, PCOS, menopause, fertility, breast health."
  };
}

export default async function WomensHealth(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const h = `/${locale}/health?category=`;

  const gyn = await getSpecialtyBySlug('gynecology');
  const [doctors, articles] = await Promise.all([
    gyn ? searchDoctors({ specialtyId: gyn.id, page: 1, limit: 4 }) : Promise.resolve([]),
    listPublishedContent({ category: 'womens-health', limit: 3 })
  ]);

  const topics = [
    { icon: '🤰', ml: 'ഗർഭകാലം', en: 'Pregnancy', href: `${h}pregnancy` },
    { icon: '🌸', ml: 'പോളിസിസ്റ്റിക് ഓവറി', en: 'PCOS', href: `/${locale}/diseases?search=pcos` },
    { icon: '🔄', ml: 'ആർത്തവ ആരോഗ്യം', en: 'Menstrual Health', href: `${h}menstrual` },
    { icon: '💗', ml: 'ഫെർട്ടിലിറ്റി', en: 'Fertility', href: `${h}fertility` },
    { icon: '🌺', ml: 'മെനോപോസ്', en: 'Menopause', href: `${h}menopause` },
    { icon: '🎀', ml: 'സ്തന ആരോഗ്യം', en: 'Breast Health', href: `${h}breast-health` },
    { icon: '🔬', ml: 'സർവൈക്കൽ', en: 'Cervical Screening', href: `${h}cervical` },
    { icon: '💊', ml: 'പോഷകാഹാരം', en: 'Nutrition', href: `${h}nutrition` }
  ];
  const tools = [
    { ml: 'പ്രസവ തീയതി കാൽക്കുലേറ്റർ', en: 'Pregnancy Due Date', href: `/${locale}/tools/due-date` },
    { ml: 'BMI കാൽക്കുലേറ്റർ', en: 'BMI Calculator', href: `/${locale}/tools/bmi` }
  ];

  return (
    <div className="-my-6">
      <HubHero
        title={ml ? 'സ്ത്രീ ആരോഗ്യം' : "Women's Health"}
        subtitle={ml ? 'കേരളത്തിലെ സ്ത്രീകൾക്കായുള്ള ആരോഗ്യ വിവരങ്ങൾ' : 'Health information for women in Kerala'}
      />
      <HelplineBand tone="brand" title={ml ? 'സ്ത്രീ ഹെൽപ്‌ലൈൻ:' : "Women's helpline:"}
        lines={[{ label: ml ? 'വനിതാ ഹെൽപ്‌ലൈൻ' : "Women's", number: '1091' }, { label: ml ? 'ഗാർഹിക പീഡനം' : 'Domestic Violence', number: '181' }]} />

      <TrustSection title={ml ? 'വിഷയങ്ങൾ' : 'Topics'}>
        <TopicGrid items={topics} locale={locale} />
      </TrustSection>

      {doctors.length > 0 && (
        <TrustSection title={ml ? 'ഗൈനക്കോളജിസ്റ്റുകൾ' : 'Gynecologists'} tint="gray">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} locale={locale} />)}
          </div>
          <div className="mt-4 text-center">
            <Link href={`/${locale}/specialties/gynecology`} className="text-sm font-semibold text-brand hover:underline">
              {ml ? 'എല്ലാ ഗൈനക്കോളജിസ്റ്റുകളും →' : 'All gynecologists →'}
            </Link>
          </div>
        </TrustSection>
      )}

      <TrustSection title={ml ? 'സ്ത്രീകൾക്കുള്ള ഹെൽത്ത് ടൂളുകൾ' : 'Health tools for women'}>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {tools.map((t, i) => (
            <Link key={i} href={t.href} className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-medium text-gray-800 shadow-sm hover:shadow-md">
              {ml ? t.ml : t.en}
            </Link>
          ))}
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 sm:col-span-2">
            <span className="font-semibold text-gray-900">{ml ? 'ആർത്തവ ചക്രം ട്രാക്ക് ചെയ്യുക: ' : 'Track your cycle: '}</span>
            {ml ? 'ആർത്തവത്തിന്റെ ആദ്യ ദിവസം മുതൽ അടുത്ത ആർത്തവത്തിന്റെ ആദ്യ ദിവസം വരെ എണ്ണുക.' : 'count from the first day of your period to the first day of the next period.'}
          </div>
        </div>
      </TrustSection>

      {articles.length > 0 && (
        <TrustSection title={ml ? 'പ്രധാന ലേഖനങ്ങൾ' : 'Key articles'} tint="gray">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {articles.map((a) => <ArticleCard key={a.id} item={a} locale={locale} />)}
          </div>
        </TrustSection>
      )}

      <TrustSection>
        <Disclaimer>{ml ? 'ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രം. വൈദ്യോപദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക.' : 'This information is for education only. Consult a doctor for medical advice.'}</Disclaimer>
      </TrustSection>
    </div>
  );
}
