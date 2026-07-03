'use client';

import { useState, use } from 'react';

export default function LoginPage(props) {
  const params = use(props.params);
  const locale = params.locale === 'en' ? 'en' : 'ml';
  const ml = locale === 'ml';

  // Email is the default channel — SMS gateway is not yet configured.
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('identity');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const t = (mlText, enText) => (ml ? mlText : enText);
  const identity = () => (method === 'email' ? { email, locale } : { mobile });

  async function sendOtp(e) {
    e.preventDefault();
    setMsg(''); setBusy(true);
    try {
      const r = await fetch('/api/auth/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identity())
      });
      const j = await r.json();
      if (r.ok && j.data?.sent) {
        setStage('code');
        setMsg(j.data.debugCode ? `Dev code: ${j.data.debugCode}` : t('OTP അയച്ചു', 'OTP sent'));
      } else if (r.status === 429) {
        setMsg(t('വളരെയധികം ശ്രമങ്ങൾ. കുറച്ച് കഴിഞ്ഞ് ശ്രമിക്കുക.', 'Too many attempts. Try again later.'));
      } else {
        setMsg(t('OTP അയയ്ക്കാൻ കഴിഞ്ഞില്ല', 'Could not send OTP'));
      }
    } catch {
      setMsg(t('ഒരു പിശക് സംഭവിച്ചു', 'Something went wrong'));
    } finally { setBusy(false); }
  }

  async function verify(e) {
    e.preventDefault();
    setMsg(''); setBusy(true);
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...identity(), code })
      });
      if (r.ok) window.location.href = `/${locale}/patient`;
      else setMsg(t('തെറ്റായ അല്ലെങ്കിൽ കാലഹരണപ്പെട്ട കോഡ്', 'Invalid or expired code'));
    } catch {
      setMsg(t('ഒരു പിശക് സംഭവിച്ചു', 'Something went wrong'));
    } finally { setBusy(false); }
  }

  function switchMethod(m) {
    setMethod(m); setStage('identity'); setCode(''); setMsg('');
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none';
  const btn = 'w-full rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60';
  const tab = (active) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`;

  return (
    <div className="mx-auto max-w-sm space-y-4 py-8">
      <h1 className="text-xl font-bold">{t('ലോഗിൻ', 'Login')}</h1>

      <div className="flex gap-2" role="tablist">
        <button type="button" role="tab" aria-selected={method === 'email'}
          className={tab(method === 'email')} onClick={() => switchMethod('email')}>
          {t('ഇമെയിൽ', 'Email Address')}
        </button>
        <button type="button" role="tab" aria-selected={method === 'mobile'}
          className={tab(method === 'mobile')} onClick={() => switchMethod('mobile')}>
          {t('മൊബൈൽ നമ്പർ', 'Mobile Number')}
        </button>
      </div>

      {stage === 'identity' ? (
        <form onSubmit={sendOtp} className="space-y-3">
          {method === 'email' ? (
            <input className={inp} type="email" autoComplete="email"
              placeholder={t('ഇമെയിൽ വിലാസം', 'Email address')}
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          ) : (
            <input className={inp} type="tel" inputMode="tel"
              placeholder={t('മൊബൈൽ നമ്പർ', 'Mobile number')}
              value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          )}
          <button className={btn} type="submit" disabled={busy}>
            {busy ? t('അയയ്ക്കുന്നു…', 'Sending…') : t('OTP അയയ്ക്കുക', 'Send OTP')}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <input className={inp} inputMode="numeric" autoComplete="one-time-code"
            placeholder={t('OTP കോഡ്', 'OTP code')}
            value={code} onChange={(e) => setCode(e.target.value)} required />
          <button className={btn} type="submit" disabled={busy}>
            {busy ? t('പരിശോധിക്കുന്നു…', 'Verifying…') : t('സ്ഥിരീകരിക്കുക', 'Verify')}
          </button>
          <button type="button" className="w-full text-sm text-gray-500" onClick={() => switchMethod(method)}>
            {t('തിരികെ', 'Back')}
          </button>
        </form>
      )}

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
