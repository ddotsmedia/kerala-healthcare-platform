// Unsubscribe landing — email link deactivates an alert via HMAC token (no login).
import Link from 'next/link';
import { getPool } from '@khp/db';
import { verifyUnsubscribe } from '@khp/jobs';
import { resolveLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

async function deactivate(id) {
  try {
    const { rowCount } = await getPool().query(
      `UPDATE job_alerts SET is_active = false, updated_at = now()
        WHERE id = $1 AND deleted_at IS NULL`, [id]);
    return rowCount > 0;
  } catch { return false; }
}

export default async function Unsubscribe(props) {
  const params = await props.params;
  const sp = (await props.searchParams) || {};
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const ok = sp.id && verifyUnsubscribe(sp.id, sp.token) && await deactivate(sp.id);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="text-4xl">{ok ? '🔕' : '⚠️'}</div>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        {ok ? (ml ? 'അലേർട്ട് നിർത്തി' : 'Alert paused')
            : (ml ? 'ലിങ്ക് അസാധുവാണ്' : 'Invalid link')}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {ok
          ? (ml ? 'ഈ ജോലി അലേർട്ടിനുള്ള ഇമെയിലുകൾ നിർത്തി. അലേർട്ട് പേജിൽ വീണ്ടും ഓണാക്കാം.'
                : 'You will no longer receive emails for this alert. You can re-enable it from your alerts page.')
          : (ml ? 'ഈ അൺസബ്‌സ്‌ക്രൈബ് ലിങ്ക് സാധുവല്ല അല്ലെങ്കിൽ കാലഹരണപ്പെട്ടു.'
                : 'This unsubscribe link is invalid or has expired.')}
      </p>
      <Link href={`/${locale}/jobs/alerts`} className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">
        {ml ? 'അലേർട്ടുകൾ കൈകാര്യം ചെയ്യുക' : 'Manage alerts'}
      </Link>
    </main>
  );
}
