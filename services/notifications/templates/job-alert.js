// job-alert.js — job-alert digest email (ml + en). HTML body + subject.

const PERIOD = { monthly: '/mo', annual: '/yr', daily: '/day', hourly: '/hr' };

function salaryLine(j, ml) {
  if (j.salary_min == null && j.salary_max == null) return '';
  const p = PERIOD[j.salary_period] || '';
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const range = j.salary_min != null && j.salary_max != null
    ? `${fmt(j.salary_min)}–${fmt(j.salary_max)}${p}`
    : `${fmt(j.salary_min ?? j.salary_max)}${p}`;
  return ` · ${range}`;
}

function jobRow(j, locale, appUrl) {
  const ml = locale === 'ml';
  const district = (ml ? j.district_ml : j.district_en) || '';
  const url = `${appUrl}/${locale}/jobs/${j.slug}`;
  const meta = [j.org_name, district].filter(Boolean).join(' · ') + salaryLine(j, ml);
  const apply = ml ? 'അപേക്ഷിക്കുക' : 'View & apply';
  return `<tr><td style="padding:12px 0;border-bottom:1px solid #eee">
    <a href="${url}" style="font-size:16px;font-weight:600;color:#0f766e;text-decoration:none">${j.title}</a>
    <div style="font-size:13px;color:#555;margin-top:2px">${meta}</div>
    <a href="${url}" style="display:inline-block;margin-top:6px;font-size:13px;color:#0f766e">${apply} →</a>
  </td></tr>`;
}

/**
 * @param {'ml'|'en'} locale
 * @param {object} c { alertName, jobs[], total, unsubscribeUrl, appUrl, locale }
 * @returns {{subject:string, body:string}}
 */
function render(locale, c) {
  const ml = locale === 'ml';
  const n = c.total ?? c.jobs.length;
  const appUrl = c.appUrl || '';
  const rows = c.jobs.map((j) => jobRow(j, locale, appUrl)).join('');
  const subject = ml
    ? `"${c.alertName}"-ന് ${n} പുതിയ ജോലി${n > 1 ? 'കൾ' : ''}`
    : `${n} new job${n > 1 ? 's' : ''} matching ${c.alertName}`;
  const heading = ml
    ? `നിങ്ങളുടെ അലേർട്ട് "${c.alertName}"-ന് ${n} പുതിയ ജോലി`
    : `${n} new job${n > 1 ? 's' : ''} for your alert "${c.alertName}"`;
  const manage = ml ? 'അലേർട്ടുകൾ കൈകാര്യം ചെയ്യുക' : 'Manage alerts';
  const unsub = ml ? 'അൺസബ്‌സ്‌ക്രൈബ് ചെയ്യുക' : 'Unsubscribe';
  const body = `<div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:16px">
    <h2 style="font-size:18px;color:#111;margin:0 0 12px">${heading}</h2>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <div style="margin-top:20px;font-size:12px;color:#888">
      <a href="${appUrl}/${locale}/jobs/alerts" style="color:#0f766e">${manage}</a>
      &nbsp;·&nbsp;
      <a href="${c.unsubscribeUrl}" style="color:#888">${unsub}</a>
    </div>
  </div>`;
  return { subject, body };
}

export { render };
