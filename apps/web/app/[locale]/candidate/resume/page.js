// Candidate Resume Builder — 5-step wizard with live preview + AI enhance.
import { redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { getMyResume } from '@/lib/resume';
import ResumeWizard from '@/components/resume/ResumeWizard';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  return { title: locale === 'ml' ? 'റെസ്യൂം ബിൽഡർ' : 'Resume Builder' };
}

export default async function ResumeBuilderPage(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  if (!(await getSession())) redirect(`/${locale}/login`);
  const existing = await getMyResume();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <ResumeWizard initial={existing || null} locale={locale} />
    </main>
  );
}
