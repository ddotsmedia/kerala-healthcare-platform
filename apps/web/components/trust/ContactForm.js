'use client';

// Contact form -> POST /api/contact. Honeypot field, success/error states.
import { useState } from 'react';

const SUBJECTS = ['General Enquiry', 'Doctor Registration', 'Hospital Partnership', 'Report a Problem', 'Media', 'Other'];

export default function ContactForm({ locale = 'ml', initialSubject = '' }) {
  const ml = locale === 'ml';
  const [subject, setSubject] = useState(SUBJECTS.includes(initialSubject) ? initialSubject : 'General Enquiry');
  const [state, setState] = useState('idle'); // idle|busy|done|error
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.value, email: f.email.value, subject: f.subject.value,
          message: f.message.value, company: f.company.value
        })
      });
      if (r.ok) { setState('done'); f.reset(); setMsg(ml ? 'നന്ദി! ഞങ്ങൾ 24 മണിക്കൂറിനുള്ളിൽ മറുപടി നൽകും.' : 'Thank you! We will reply within 24 hours.'); }
      else if (r.status === 429) { setState('error'); setMsg(ml ? 'വളരെയധികം സന്ദേശങ്ങൾ. പിന്നീട് ശ്രമിക്കുക.' : 'Too many messages. Please try later.'); }
      else { setState('error'); setMsg(ml ? 'എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക.' : 'Please fill all fields correctly.'); }
    } catch { setState('error'); setMsg(ml ? 'ഒരു പിശക് സംഭവിച്ചു' : 'Something went wrong'); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none';
  if (state === 'done') return <p className="rounded-xl bg-green-50 p-5 text-sm font-medium text-green-700">{msg}</p>;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input name="name" required placeholder={ml ? 'പേര്' : 'Name'} className={inp} />
      <input name="email" type="email" required placeholder={ml ? 'ഇമെയിൽ' : 'Email'} className={inp} />
      <select name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inp}>
        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <textarea name="message" required rows={5} placeholder={ml ? 'നിങ്ങളുടെ സന്ദേശം' : 'Your message'} className={inp} />
      <button type="submit" disabled={state === 'busy'}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto">
        {state === 'busy' ? (ml ? 'അയയ്ക്കുന്നു…' : 'Sending…') : (ml ? 'സന്ദേശം അയയ്ക്കുക' : 'Send message')}
      </button>
      {msg && state === 'error' && <p className="text-sm text-red-600">{msg}</p>}
    </form>
  );
}
