'use client';

// Resume wizard step forms. `ctl` supplies state + mutation helpers from the
// orchestrator: { r, setPersonal, setField, addItem, setItem, removeItem, tr }.

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
const lbl = 'block text-xs font-medium text-gray-600 mb-1';

function Field({ label, children }) {
  return <label className="block"><span className={lbl}>{label}</span>{children}</label>;
}

function Repeater({ title, items, cols, onAdd, onSet, onRemove, addLabel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <button type="button" onClick={onAdd} className="rounded-lg border border-brand px-2 py-1 text-xs font-medium text-brand">+ {addLabel}</button></div>
      {items.length === 0 && <p className="text-xs text-gray-400">—</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
          {cols.map((c) => (
            c.type === 'textarea'
              ? <textarea key={c.k} rows={2} value={it[c.k] || ''} placeholder={c.ph} onChange={(e) => onSet(i, c.k, e.target.value)} className={inp} />
              : c.type === 'check'
                ? <label key={c.k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!it[c.k]} onChange={(e) => onSet(i, c.k, e.target.checked)} /> {c.ph}</label>
                : <input key={c.k} value={it[c.k] || ''} placeholder={c.ph} onChange={(e) => onSet(i, c.k, e.target.value)} className={inp} />
          ))}
          <button type="button" onClick={() => onRemove(i)} className="text-xs text-red-600">{addLabel === 'Add' ? 'Remove' : 'നീക്കം'}</button>
        </div>
      ))}
    </div>
  );
}

export function Step1({ ctl }) {
  const { r, setPersonal, setField, tr } = ctl;
  const p = r.personal || {};
  return (
    <div className="space-y-3">
      <Field label={tr('Resume title', 'റെസ്യൂം ശീർഷകം')}><input value={r.title || ''} onChange={(e) => setField('title', e.target.value)} placeholder="Dr. Anand Nair — Cardiologist CV" className={inp} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={tr('Full name', 'പേര്')}><input value={p.name || ''} onChange={(e) => setPersonal('name', e.target.value)} className={inp} /></Field>
        <Field label={tr('Headline', 'തലക്കെട്ട്')}><input value={p.headline || ''} onChange={(e) => setPersonal('headline', e.target.value)} className={inp} /></Field>
        <Field label={tr('Email', 'ഇമെയിൽ')}><input value={p.email || ''} onChange={(e) => setPersonal('email', e.target.value)} className={inp} /></Field>
        <Field label={tr('Phone', 'ഫോൺ')}><input value={p.phone || ''} onChange={(e) => setPersonal('phone', e.target.value)} className={inp} /></Field>
        <Field label={tr('Address', 'വിലാസം')}><input value={p.address || ''} onChange={(e) => setPersonal('address', e.target.value)} className={inp} /></Field>
        <Field label={tr('LinkedIn', 'ലിങ്ക്ഡ്ഇൻ')}><input value={p.linkedin || ''} onChange={(e) => setPersonal('linkedin', e.target.value)} className={inp} /></Field>
      </div>
      <Field label={tr('Photo URL', 'ഫോട്ടോ URL')}><input value={p.photo_url || ''} onChange={(e) => setPersonal('photo_url', e.target.value)} className={inp} /></Field>
      <Field label={tr('Objective / summary', 'ലക്ഷ്യം / സംഗ്രഹം')}><textarea rows={4} value={p.objective || ''} onChange={(e) => setPersonal('objective', e.target.value)} className={inp} /></Field>
    </div>
  );
}

export function Step2({ ctl }) {
  const { r, addItem, setItem, removeItem, tr } = ctl;
  return (
    <Repeater title={tr('Work experience', 'പ്രവൃത്തിപരിചയം')} items={r.experience || []} addLabel={tr('Add', 'ചേർക്കുക')}
      onAdd={() => addItem('experience', { title: '', org: '', from: '', to: '', current: false, description: '' })}
      onSet={(i, k, v) => setItem('experience', i, k, v)} onRemove={(i) => removeItem('experience', i)}
      cols={[{ k: 'title', ph: tr('Job title', 'തസ്തിക') }, { k: 'org', ph: tr('Organisation', 'സ്ഥാപനം') },
        { k: 'from', ph: tr('From (2020)', 'മുതൽ') }, { k: 'to', ph: tr('To (2023)', 'വരെ') },
        { k: 'current', type: 'check', ph: tr('Current job', 'ഇപ്പോഴത്തെ ജോലി') }, { k: 'description', type: 'textarea', ph: tr('Description', 'വിവരണം') }]} />
  );
}

export function Step3({ ctl }) {
  const { r, addItem, setItem, removeItem, tr } = ctl;
  return (
    <div className="space-y-6">
      <Repeater title={tr('Education', 'വിദ്യാഭ്യാസം')} items={r.education || []} addLabel={tr('Add', 'ചേർക്കുക')}
        onAdd={() => addItem('education', { degree: '', institution: '', year: '', grade: '' })}
        onSet={(i, k, v) => setItem('education', i, k, v)} onRemove={(i) => removeItem('education', i)}
        cols={[{ k: 'degree', ph: tr('Degree', 'ബിരുദം') }, { k: 'institution', ph: tr('Institution', 'സ്ഥാപനം') }, { k: 'year', ph: tr('Year', 'വർഷം') }, { k: 'grade', ph: tr('Grade', 'ഗ്രേഡ്') }]} />
      <Repeater title={tr('Certifications', 'സർട്ടിഫിക്കേഷനുകൾ')} items={r.certifications || []} addLabel={tr('Add', 'ചേർക്കുക')}
        onAdd={() => addItem('certifications', { name: '', issuer: '', year: '', expiry: '' })}
        onSet={(i, k, v) => setItem('certifications', i, k, v)} onRemove={(i) => removeItem('certifications', i)}
        cols={[{ k: 'name', ph: tr('Name', 'പേര്') }, { k: 'issuer', ph: tr('Issuer', 'നൽകിയത്') }, { k: 'year', ph: tr('Year', 'വർഷം') }, { k: 'expiry', ph: tr('Expiry', 'കാലാവധി') }]} />
      <Repeater title={tr('Publications', 'പ്രസിദ്ധീകരണങ്ങൾ')} items={r.publications || []} addLabel={tr('Add', 'ചേർക്കുക')}
        onAdd={() => addItem('publications', { title: '', journal: '', year: '', url: '' })}
        onSet={(i, k, v) => setItem('publications', i, k, v)} onRemove={(i) => removeItem('publications', i)}
        cols={[{ k: 'title', ph: tr('Title', 'ശീർഷകം') }, { k: 'journal', ph: tr('Journal', 'ജേണൽ') }, { k: 'year', ph: tr('Year', 'വർഷം') }, { k: 'url', ph: 'URL' }]} />
    </div>
  );
}

export function Step4({ ctl }) {
  const { r, setField, addItem, setItem, removeItem, tr } = ctl;
  return (
    <div className="space-y-6">
      <Field label={tr('Skills (comma separated)', 'നൈപുണ്യങ്ങൾ (കോമ കൊണ്ട് വേർതിരിക്കുക)')}>
        <textarea rows={3} value={(r.skills || []).join(', ')} onChange={(e) => setField('skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className={inp} />
      </Field>
      <Repeater title={tr('Languages', 'ഭാഷകൾ')} items={r.languages || []} addLabel={tr('Add', 'ചേർക്കുക')}
        onAdd={() => addItem('languages', { language: '', proficiency: '' })}
        onSet={(i, k, v) => setItem('languages', i, k, v)} onRemove={(i) => removeItem('languages', i)}
        cols={[{ k: 'language', ph: tr('Language', 'ഭാഷ') }, { k: 'proficiency', ph: tr('Proficiency', 'പ്രാവീണ്യം') }]} />
      <Repeater title={tr('References', 'റഫറൻസുകൾ')} items={r.refs || []} addLabel={tr('Add', 'ചേർക്കുക')}
        onAdd={() => addItem('refs', { name: '', designation: '', org: '', phone: '', email: '' })}
        onSet={(i, k, v) => setItem('refs', i, k, v)} onRemove={(i) => removeItem('refs', i)}
        cols={[{ k: 'name', ph: tr('Name', 'പേര്') }, { k: 'designation', ph: tr('Designation', 'പദവി') }, { k: 'org', ph: tr('Organisation', 'സ്ഥാപനം') }, { k: 'phone', ph: tr('Phone', 'ഫോൺ') }, { k: 'email', ph: tr('Email', 'ഇമെയിൽ') }]} />
    </div>
  );
}
