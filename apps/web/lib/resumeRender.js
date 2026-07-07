// resumeRender.js — pure resume→HTML renderer for 3 print-optimised templates.
// Shared by the export API (full document) and the live preview (body fragment).
// No server-only imports; safe in client + server. All user data HTML-escaped.

const TEMPLATE_IDS = ['kerala_classic', 'modern_minimal', 'gulf_ready'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function arr(v) { return Array.isArray(v) ? v : []; }

const L = (locale) => {
  const ml = locale === 'ml';
  return {
    summary: ml ? 'സംഗ്രഹം' : 'Professional Summary',
    experience: ml ? 'പ്രവൃത്തിപരിചയം' : 'Work Experience',
    education: ml ? 'വിദ്യാഭ്യാസം' : 'Education',
    skills: ml ? 'നൈപുണ്യങ്ങൾ' : 'Skills',
    certifications: ml ? 'സർട്ടിഫിക്കേഷനുകൾ' : 'Certifications',
    publications: ml ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications',
    languages: ml ? 'ഭാഷകൾ' : 'Languages',
    references: ml ? 'റഫറൻസുകൾ' : 'References',
    present: ml ? 'ഇപ്പോൾ' : 'Present'
  };
}

function section(title, inner) {
  return inner ? `<section class="r-sec"><h2>${esc(title)}</h2>${inner}</section>` : '';
}

function experienceHtml(list, t) {
  if (!list.length) return '';
  const items = list.map((e) => {
    const span = `${esc(e.from || '')}${(e.to || e.current) ? ' – ' + (e.current ? t.present : esc(e.to)) : ''}`;
    return `<div class="r-item">
      <div class="r-item-head"><strong>${esc(e.title || '')}</strong><span>${span}</span></div>
      <div class="r-item-sub">${esc(e.org || '')}</div>
      ${e.description ? `<p>${esc(e.description)}</p>` : ''}
    </div>`;
  }).join('');
  return section(t.experience, items);
}

function educationHtml(list, t) {
  if (!list.length) return '';
  const items = list.map((e) => `<div class="r-item">
    <div class="r-item-head"><strong>${esc(e.degree || '')}</strong><span>${esc(e.year || '')}</span></div>
    <div class="r-item-sub">${esc(e.institution || '')}${e.grade ? ' · ' + esc(e.grade) : ''}</div>
  </div>`).join('');
  return section(t.education, items);
}

function skillsHtml(list, t) {
  if (!list.length) return '';
  return section(t.skills, `<ul class="r-tags">${list.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`);
}

function certsHtml(list, t) {
  if (!list.length) return '';
  const items = list.map((c) => `<div class="r-line"><strong>${esc(c.name || '')}</strong>${c.issuer ? ' — ' + esc(c.issuer) : ''}${c.year ? ` (${esc(c.year)})` : ''}${c.expiry ? ` · exp ${esc(c.expiry)}` : ''}</div>`).join('');
  return section(t.certifications, items);
}

function pubsHtml(list, t) {
  if (!list.length) return '';
  const items = list.map((p) => `<div class="r-line">${p.url ? `<a href="${esc(p.url)}">${esc(p.title || '')}</a>` : `<strong>${esc(p.title || '')}</strong>`}${p.journal ? ' — ' + esc(p.journal) : ''}${p.year ? ` (${esc(p.year)})` : ''}</div>`).join('');
  return section(t.publications, items);
}

function langsHtml(list, t) {
  if (!list.length) return '';
  return section(t.languages, `<ul class="r-tags">${list.map((x) => `<li>${esc(x.language || '')}${x.proficiency ? ` (${esc(x.proficiency)})` : ''}</li>`).join('')}</ul>`);
}

function refsHtml(list, t) {
  if (!list.length) return '';
  const items = list.map((r) => `<div class="r-line"><strong>${esc(r.name || '')}</strong>${r.designation ? ', ' + esc(r.designation) : ''}${r.org ? ', ' + esc(r.org) : ''}${r.phone ? ' · ' + esc(r.phone) : ''}${r.email ? ' · ' + esc(r.email) : ''}</div>`).join('');
  return section(t.references, items);
}

/** Inner body HTML for a resume (no <html>/<head>). */
function renderResumeBody(resume, templateId, locale = 'ml') {
  const r = resume || {};
  const p = r.personal || {};
  const t = L(locale);
  const tmpl = TEMPLATE_IDS.includes(templateId) ? templateId : (TEMPLATE_IDS.includes(r.template_id) ? r.template_id : 'kerala_classic');
  const summary = r.ai_enhanced_summary || p.objective || '';
  const contact = [p.email, p.phone, p.address, p.linkedin].filter(Boolean).map((c) => `<span>${esc(c)}</span>`).join('<i>·</i>');
  const photo = p.photo_url ? `<img class="r-photo" src="${esc(p.photo_url)}" alt="" />` : '';

  return `<article class="resume tmpl-${tmpl}" id="resume-print">
    <header class="r-head">
      ${photo}
      <div class="r-head-main">
        <h1>${esc(p.name || r.title || '')}</h1>
        ${p.headline ? `<p class="r-headline">${esc(p.headline)}</p>` : ''}
        ${contact ? `<div class="r-contact">${contact}</div>` : ''}
      </div>
    </header>
    ${summary ? section(t.summary, `<p>${esc(summary)}</p>`) : ''}
    ${experienceHtml(arr(r.experience), t)}
    ${educationHtml(arr(r.education), t)}
    ${skillsHtml(arr(r.skills), t)}
    ${certsHtml(arr(r.certifications), t)}
    ${pubsHtml(arr(r.publications), t)}
    ${langsHtml(arr(r.languages), t)}
    ${refsHtml(arr(r.refs), t)}
  </article>`;
}

/** Template + print CSS. Scoped under .resume so it is safe to inline in-page. */
function resumeCSS() {
  return `
  .resume{--ink:#1f2937;--muted:#6b7280;--rule:#e5e7eb;color:var(--ink);background:#fff;max-width:800px;margin:0 auto;padding:32px;font-size:13px;line-height:1.5;box-sizing:border-box}
  .resume h1{font-size:24px;margin:0}
  .resume h2{font-size:14px;text-transform:uppercase;letter-spacing:.04em;margin:0 0 8px}
  .resume .r-head{display:flex;gap:16px;align-items:center;margin-bottom:16px}
  .resume .r-photo{width:84px;height:84px;object-fit:cover;border-radius:8px}
  .resume .r-headline{margin:2px 0;color:var(--muted)}
  .resume .r-contact{display:flex;flex-wrap:wrap;gap:6px;align-items:center;color:var(--muted);font-size:12px;margin-top:4px}
  .resume .r-contact i{color:var(--rule);font-style:normal}
  .resume .r-sec{margin-top:16px}
  .resume .r-item{margin-bottom:10px}
  .resume .r-item-head{display:flex;justify-content:space-between;gap:8px}
  .resume .r-item-head span{color:var(--muted);font-size:12px;white-space:nowrap}
  .resume .r-item-sub{color:var(--muted);font-size:12px}
  .resume .r-item p{margin:4px 0 0}
  .resume .r-line{margin:3px 0}
  .resume .r-tags{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0}
  .resume .r-tags li{background:#f3f4f6;border-radius:999px;padding:2px 10px;font-size:12px}
  .resume a{color:#0f766e;text-decoration:none}

  .tmpl-kerala_classic h1{color:#0f766e}
  .tmpl-kerala_classic h2{color:#0f766e;border-bottom:2px solid #0f766e;padding-bottom:3px}
  .tmpl-kerala_classic .r-sec{border-left:3px solid #f0fdfa;padding-left:12px}

  .tmpl-modern_minimal{font-family:Arial,Helvetica,sans-serif}
  .tmpl-modern_minimal h1{font-weight:700}
  .tmpl-modern_minimal h2{color:#111;border-bottom:1px solid var(--rule);padding-bottom:3px}
  .tmpl-modern_minimal .r-tags li{background:none;border:1px solid var(--rule)}
  .tmpl-modern_minimal .r-photo{display:none}

  .tmpl-gulf_ready h1{color:#111;letter-spacing:.02em}
  .tmpl-gulf_ready h2{background:#111;color:#fff;padding:4px 10px;letter-spacing:.06em}
  .tmpl-gulf_ready .r-head{border:2px solid #111;padding:14px;border-radius:6px}
  .tmpl-gulf_ready .r-sec{margin-top:14px}
  `;
}

/** Full standalone HTML document for export/print (auto-opens print dialog). */
function renderResumeDoc(resume, templateId, locale = 'ml', opts = {}) {
  const body = renderResumeBody(resume, templateId, locale);
  const title = esc((resume && resume.title) || 'Resume');
  const autoprint = opts.print ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},300);});<\/script>' : '';
  return `<!doctype html><html lang="${esc(locale)}"><head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>
      *{margin:0;padding:0}body{background:#f3f4f6;padding:20px 0;font-family:'Noto Sans Malayalam',system-ui,Segoe UI,Roboto,sans-serif}
      ${resumeCSS()}
      @media print{body{background:#fff;padding:0}.resume{box-shadow:none;max-width:none;padding:0 12mm}@page{margin:12mm}}
    </style>
  </head><body>${body}${autoprint}</body></html>`;
}

export { renderResumeBody, renderResumeDoc, resumeCSS, TEMPLATE_IDS };
