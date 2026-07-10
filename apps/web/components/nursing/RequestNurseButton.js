'use client';

// "Request a nurse" CTA — modal posting to /api/contact (honeypot + rate limited).
import { useState } from 'react';

export default function RequestNurseButton({ agencyName = '', locale = 'ml' }) {
  const ml = locale === 'ml';
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle'); // idle|busy|done|error

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    setState('busy');
    const message = `Home-nursing request for "${agencyName}".\n`
      + `Care needed: ${f.need.value}\nContact phone: ${f.phone.value}\n${f.message.value || ''}`;
    try {
      const r = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name.value, email: f.email.value, subject: 'General Enquiry', message, company: f.company.value })
      });
      setState(r.ok ? 'done' : 'error');
    } catch { setState('error'); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setState('idle'); }}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        🧑‍⚕️ {ml ? 'ഒരു നഴ്സിനെ അഭ്യർത്ഥിക്കുക' : 'Request a nurse'}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            {state === 'done' ? (
              <div className="text-center">
                <div className="text-3xl">✅</div>
                <p className="mt-2 font-medium text-gray-900">{ml ? 'അഭ്യർത്ഥന അയച്ചു' : 'Request sent'}</p>
                <p className="mt-1 text-sm text-gray-600">{ml ? 'ഏജൻസി/ടീം ഉടൻ ബന്ധപ്പെടും.' : 'The team will contact you shortly.'}</p>
                <button onClick={() => setOpen(false)} className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'അടയ്ക്കുക' : 'Close'}</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">{ml ? 'ഒരു നഴ്സിനെ അഭ്യർത്ഥിക്കുക' : 'Request a nurse'}</h3>
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <input name="name" required placeholder={ml ? 'നിങ്ങളുടെ പേര്' : 'Your name'} className={inp} />
                <input name="email" type="email" required placeholder={ml ? 'ഇമെയിൽ' : 'Email'} className={inp} />
                <input name="phone" required placeholder={ml ? 'ഫോൺ നമ്പർ' : 'Phone number'} className={inp} />
                <input name="need" required placeholder={ml ? 'ഏത് പരിചരണം? (ഉദാ: വയോജന കെയർ)' : 'Care needed (e.g. elderly care)'} className={inp} />
                <textarea name="message" rows={3} placeholder={ml ? 'കൂടുതൽ വിവരങ്ങൾ (ഓപ്ഷണൽ)' : 'More details (optional)'} className={inp} />
                {state === 'error' && <p className="text-sm text-red-600">{ml ? 'അയക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.' : 'Could not send. Try again.'}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={state === 'busy'} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
                    {state === 'busy' ? (ml ? 'അയക്കുന്നു…' : 'Sending…') : (ml ? 'അയക്കുക' : 'Send request')}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
