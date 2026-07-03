// All districts index — SEO landing hub with doctor counts.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { districtCountsAll, districtSlug } from '@/lib/landing';
import { LandingHero, Breadcrumb, SITE } from '@/components/landing/LandingParts';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'കേരളത്തിലെ എല്ലാ ജില്ലകളും | MalayaliDoctor' : 'All Kerala Districts | MalayaliDoctor',
    description: ml
      ? 'കേരളത്തിലെ 14 ജില്ലകളിലെയും ഡോക്ടർമാരെയും ആശുപത്രികളെയും കണ്ടെത്തൂ.'
      : 'Find doctors and hospitals across all 14 districts of Kerala.',
    alternates: { canonical: `${SITE}/${locale}/districts` }
  };
}

export default async function DistrictsIndex(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const districts = await districtCountsAll();

  return (
    <div className="-my-6">
      <LandingHero
        icon="🗺️"
        breadcrumb={<Breadcrumb items={[
          { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
          { name: ml ? 'ഡോക്ടർമാർ' : 'Doctors', href: `/${locale}/doctors` },
          { name: ml ? 'ജില്ലകൾ' : 'Districts' }
        ]} />}
        title={ml ? 'കേരളത്തിലെ എല്ലാ ജില്ലകളും' : 'All Kerala Districts'}
        subtitle={ml ? 'ജില്ല അനുസരിച്ച് ഡോക്ടർമാരെ കണ്ടെത്തൂ' : 'Find doctors by district'}
      />

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {districts.map((d) => (
              <Link key={d.id} href={`/${locale}/districts/${districtSlug(d.name_en)}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{ml ? d.name_ml : d.name_en}</span>
                  <span className="block text-xs text-gray-500">{ml ? d.name_en : d.name_ml}</span>
                </span>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-brand">{d.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <MedicalDisclaimer locale={locale} />
    </div>
  );
}
