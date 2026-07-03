// All specialties index — SEO landing hub.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { specialtyCountsAll } from '@/lib/landing';
import { specialtyIcon } from '@/components/home/HomeSections';
import { LandingHero, Breadcrumb, SITE } from '@/components/landing/LandingParts';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'എല്ലാ സ്പെഷ്യാലിറ്റികളും | MalayaliDoctor' : 'All Specialties | MalayaliDoctor',
    description: ml
      ? 'കേരളത്തിലെ എല്ലാ മെഡിക്കൽ സ്പെഷ്യാലിറ്റികളും. വിദഗ്ധ ഡോക്ടർമാരെ കണ്ടെത്തൂ.'
      : 'Browse all medical specialties in Kerala. Find verified specialist doctors.',
    alternates: { canonical: `${SITE}/${locale}/specialties` }
  };
}

export default async function SpecialtiesIndex(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const specialties = await specialtyCountsAll();

  return (
    <div className="-my-6">
      <LandingHero
        icon="🩺"
        breadcrumb={<Breadcrumb items={[
          { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
          { name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', href: `/${locale}/doctors` },
          { name: ml ? 'സ്പെഷ്യാലിറ്റികൾ' : 'Specialties' }
        ]} />}
        title={ml ? 'എല്ലാ സ്പെഷ്യാലിറ്റികളും' : 'All Specialties'}
        subtitle={ml ? 'വിദഗ്ധ ഡോക്ടർമാരെ സ്പെഷ്യാലിറ്റി അനുസരിച്ച് കണ്ടെത്തൂ' : 'Find specialist doctors by specialty'}
      />

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {specialties.map((s) => (
              <Link key={s.id} href={`/${locale}/specialties/${s.slug}`}
                className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="text-3xl text-brand">{specialtyIcon(s.name_en)}</span>
                <span className="mt-2 text-sm font-semibold text-gray-900">{ml ? s.name_ml : s.name_en}</span>
                <span className="text-xs text-gray-500">{ml ? s.name_en : s.name_ml}</span>
                <span className="mt-1 text-xs font-medium text-brand">
                  {s.count} {ml ? 'ഡോക്ടർമാർ' : 'doctors'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <MedicalDisclaimer locale={locale} />
    </div>
  );
}
