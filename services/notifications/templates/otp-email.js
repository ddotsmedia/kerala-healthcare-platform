// otp-email.js — login OTP email template (Malayalam + English).
// No new package: returns subject/html/text strings for the email transport.

const BRAND_ML = 'കേരള ഹെൽത്ത് പോർട്ടൽ';
const BRAND_EN = 'Kerala Health Portal';
const TTL_MINUTES = 10;

/**
 * @param {string} code 6-digit OTP
 * @param {'ml'|'en'} locale
 * @returns {{subject:string, html:string, text:string}}
 */
function otpEmailTemplate(code, locale = 'ml') {
  const ml = locale !== 'en';
  const brand = ml ? BRAND_ML : BRAND_EN;
  // Subject kept in English per spec so the code is scannable in any inbox.
  const subject = `Your Kerala Health OTP: ${code}`;
  const heading = ml ? 'നിങ്ങളുടെ ലോഗിൻ കോഡ്' : 'Your login code';
  const intro = ml
    ? 'കേരള ഹെൽത്ത് പോർട്ടലിൽ ലോഗിൻ ചെയ്യാൻ ചുവടെയുള്ള കോഡ് നൽകുക:'
    : 'Enter the code below to log in to Kerala Health Portal:';
  const validity = ml
    ? `ഈ കോഡ് ${TTL_MINUTES} മിനിറ്റ് വരെ സാധുവാണ്.`
    : `This code is valid for ${TTL_MINUTES} minutes.`;
  const ignore = ml
    ? 'നിങ്ങൾ ഇത് അഭ്യർത്ഥിച്ചിട്ടില്ലെങ്കിൽ ഈ ഇമെയിൽ അവഗണിക്കുക. നിങ്ങളുടെ കോഡ് ആരുമായും പങ്കിടരുത്.'
    : 'If you did not request this, ignore this email. Never share your code with anyone.';

  const text = `${heading}\n\n${code}\n\n${intro}\n${validity}\n\n${ignore}\n\n— ${brand}`;

  const html = `<!doctype html>
<html lang="${ml ? 'ml' : 'en'}">
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Noto Sans Malayalam',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <p style="margin:0 0 4px;font-size:14px;color:#0d9488;font-weight:700;">${brand}</p>
      <h1 style="margin:16px 0 8px;font-size:18px;color:#111827;">${heading}</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.5;">${intro}</p>
      <div style="margin:16px auto;font-size:34px;letter-spacing:8px;font-weight:800;color:#111827;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px;display:inline-block;">${code}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">${validity}</p>
      <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">${ignore}</p>
    </div>
    <p style="margin:16px 0 0;text-align:center;font-size:11px;color:#9ca3af;">© ${brand}</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export { otpEmailTemplate };
