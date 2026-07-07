// Full candidate profile for recruiters — contact hidden until request accepted.
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getSession } from '@/lib/session';
import { getCandidateForEmployer } from '@/lib/recruiter';
import RequestContactButton from '@/components/jobs/RequestContactButton';

export const dynamic = 'force-dynamic';

export default async function CandidateProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  if (!(await getSession())) redirect(`/${locale}/login`);
  const c = await getCandidateForEmployer(params.id);
  if (c === null) redirect(`/${locale}/employer`);
  if (!c) notFound();

  const district = (ml ? c.district_ml : c.district_en) || c.current_location;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <Link href={`/${locale}/employer/candidates`} className="text-sm text-brand">← {ml ? 'തിരയലിലേക്ക്' : 'Back to search'}</Link>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">{c.headline || (ml ? 'ഉദ്യോഗാർത്ഥി' : 'Candidate')}</h1>
        {c.role_category && <p className="text-brand">{c.role_category}{c.specialty_en ? ` · ${c.specialty_en}` : ''}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>{c.experience_years || 0} {ml ? 'വർഷം പരിചയം' : 'yrs experience'}</span>
          {district && <span>📍 {district}</span>}
          {c.expected_salary_min != null && <span>₹{Number(c.expected_salary_min).toLocaleString('en-IN')}+/mo</span>}
          {c.notice_period_days != null && <span>{ml ? 'നോട്ടീസ്' : 'Notice'}: {c.notice_period_days}d</span>}
        </div>
      </header>

      {c.summary && <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'സംഗ്രഹം' : 'Summary'}</h2>
        <p className="text-sm text-gray-700 whitespace-pre-line">{c.summary}</p></section>}

      {Array.isArray(c.experience) && c.experience.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'റോളുകൾ' : 'Roles'}</h2>
          <ul className="flex flex-wrap gap-1">{c.experience.map((e, i) => e.role && <li key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{e.role}</li>)}</ul>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'കോൺടാക്റ്റ്' : 'Contact'}</h2>
        {c.contact_visible && c.contact ? (
          <div className="space-y-1 text-sm text-gray-700">
            {c.contact.email && <p>✉ {c.contact.email}</p>}
            {c.contact.linkedin_url && <p>🔗 <a href={c.contact.linkedin_url} className="text-brand">{c.contact.linkedin_url}</a></p>}
            {c.contact.resume_url && <p>📄 <a href={c.contact.resume_url} className="text-brand">{ml ? 'റെസ്യൂം' : 'Resume'}</a></p>}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">🔒 {ml ? 'ഉദ്യോഗാർത്ഥി അംഗീകരിച്ചാൽ കോൺടാക്റ്റ് ദൃശ്യമാകും.' : 'Contact details are hidden until the candidate accepts your request.'}</p>
            <RequestContactButton candidateId={c.id} locale={locale} initialStatus={c.request_status} />
          </div>
        )}
      </section>
    </main>
  );
}
