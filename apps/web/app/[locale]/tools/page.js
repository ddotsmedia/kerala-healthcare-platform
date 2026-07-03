// Health tools index.

import Link from 'next/link';
import { resolveLocale, t } from '@/lib/i18n';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: `${t(locale, 'tools')} · ${t(locale, 'site')}` };
}

export default async function ToolsIndex(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const tools = [
    { slug: 'bmi', icon: '🧮', ml: 'BMI കാൽക്കുലേറ്റർ', en: 'BMI Calculator' },
    { slug: 'due-date', icon: '📅', ml: 'പ്രസവ തീയതി', en: 'Pregnancy Due Date' },
    { slug: 'water-intake', icon: '💧', ml: 'വാട്ടർ ഇൻടേക്ക്', en: 'Water Intake' },
    { slug: 'heart-rate', icon: '❤️', ml: 'ഹൃദയമിടിപ്പ് സോണുകൾ', en: 'Heart Rate Zones' },
    { slug: 'blood-pressure', icon: '🩸', ml: 'രക്തസമ്മർദ്ദ ഗൈഡ്', en: 'Blood Pressure Guide' },
    { slug: 'sleep', icon: '🌙', ml: 'സ്ലീപ്പ് കാൽക്കുലേറ്റർ', en: 'Sleep Calculator' }
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{ml ? 'ഹെൽത്ത് ടൂളുകൾ' : 'Health Tools'}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tools.map((x) => (
          <Link key={x.slug} href={`/${locale}/tools/${x.slug}`}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-3xl">{x.icon}</span>
            <span className="mt-2 text-sm font-semibold text-gray-900">{ml ? x.ml : x.en}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
