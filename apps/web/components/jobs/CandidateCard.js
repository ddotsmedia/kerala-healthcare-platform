// CandidateCard.js — recruiter search result (server). NO contact fields.
import Link from 'next/link';

function salary(c) {
  if (c.expected_salary_min == null) return null;
  return `₹${Number(c.expected_salary_min).toLocaleString('en-IN')}+/mo`;
}

export default function CandidateCard({ candidate: c, locale = 'ml' }) {
  const ml = locale === 'ml';
  const district = (ml ? c.district_ml : c.district_en) || c.current_location;
  const sal = salary(c);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{c.headline || (ml ? 'ഉദ്യോഗാർത്ഥി' : 'Candidate')}</h3>
          {c.role_category && <p className="text-sm text-brand">{c.role_category}{c.specialty_en ? ` · ${c.specialty_en}` : ''}</p>}
        </div>
        <Link href={`/${locale}/employer/candidates/${c.id}`} className="shrink-0 rounded-lg border border-brand px-2.5 py-1.5 text-xs font-medium text-brand">
          {ml ? 'പ്രൊഫൈൽ' : 'View'}
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
        <span>{c.experience_years || 0} {ml ? 'വർഷം' : 'yrs'}</span>
        {district && <span>📍 {district}</span>}
        {sal && <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700">{sal}</span>}
        {c.notice_period_days != null && <span>{ml ? 'നോട്ടീസ്' : 'Notice'}: {c.notice_period_days}d</span>}
      </div>
      {Array.isArray(c.preferred_job_types) && c.preferred_job_types.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {c.preferred_job_types.slice(0, 3).map((t) => <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t.replace('_', ' ')}</span>)}
        </div>
      )}
    </div>
  );
}
