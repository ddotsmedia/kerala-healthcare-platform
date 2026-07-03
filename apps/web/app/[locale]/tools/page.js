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
  const tools = [
    { slug: 'bmi', label: t(locale, 'bmi') },
    { slug: 'due-date', label: t(locale, 'due_date') },
    { slug: 'water-intake', label: t(locale, 'water_intake') }
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'tools')}</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tools.map((x) => (
          <Link key={x.slug} href={`/${locale}/tools/${x.slug}`}
            className="rounded-xl border border-gray-200 bg-white p-5 text-center font-medium shadow-sm hover:shadow-md">
            {x.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
