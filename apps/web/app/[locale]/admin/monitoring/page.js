import { resolveLocale } from '@/lib/i18n';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MonitoringPanels from './MonitoringPanels';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  return {
    title: ml ? 'നിരീക്ഷണം | കേരള ഹെൽത്ത് പോർട്ടൽ' : 'Monitoring | Kerala Health Portal',
    description: ml ? 'പ്ലാറ്റ്‌ഫോം സ്ഥിതി നിരീക്ഷണം' : 'Platform health monitoring'
  };
}

export default async function MonitoringPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);

  const session = await getSession();
  if (!session?.role?.includes('admin')) {
    return redirect(`/${locale}/`);
  }

  const ml = locale === 'ml';
  const t = (key) => {
    const dict = {
      ml: {
        monitoring: 'നിരീക്ഷണം',
        platform_health: 'പ്ലാറ്റ്‌ഫോം ആരോഗ്യം'
      },
      en: {
        monitoring: 'Monitoring',
        platform_health: 'Platform Health'
      }
    };
    return dict[locale]?.[key] || key;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('monitoring')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('platform_health')}
          </p>
        </div>
        <MonitoringPanels locale={locale} />
      </div>
    </div>
  );
}
