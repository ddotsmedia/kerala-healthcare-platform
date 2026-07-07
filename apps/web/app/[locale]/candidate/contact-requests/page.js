// Candidate — incoming recruiter contact requests. Accept reveals contact.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { listContactRequests } from '@/lib/recruiter';
import ContactRequests from '@/components/jobs/ContactRequests';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: locale === 'ml' ? 'കോൺടാക്റ്റ് അഭ്യർത്ഥനകൾ' : 'Contact Requests' };
}

export default async function ContactRequestsPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  if (!(await getSession())) redirect(`/${locale}/login`);
  const requests = await listContactRequests();
  if (requests === null) redirect(`/${locale}/candidate`);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{ml ? '📨 കോൺടാക്റ്റ് അഭ്യർത്ഥനകൾ' : '📨 Contact Requests'}</h1>
        <Link href={`/${locale}/candidate`} className="text-sm text-brand">{ml ? 'ഡാഷ്ബോർഡ്' : 'Dashboard'}</Link>
      </div>
      <ContactRequests requests={requests} locale={locale} />
    </main>
  );
}
