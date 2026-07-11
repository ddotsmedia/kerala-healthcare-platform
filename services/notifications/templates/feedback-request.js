// feedback-request.js — post-appointment feedback email (ml + en). Star links
// deep-link to the feedback page with a pre-selected rating.

function render(locale, c) {
  const stars = [1, 2, 3, 4, 5].map((n) =>
    `<a href="${c.link}?rating=${n}" style="text-decoration:none;font-size:26px">⭐</a>`.repeat(1)).join(' ');
  const ml = locale === 'ml';
  const heading = ml ? `${c.provider_name} എന്നയാളുമായുള്ള നിങ്ങളുടെ സന്ദർശനം എങ്ങനെയായിരുന്നു?` : `How was your visit with Dr. ${c.provider_name}?`;
  const rate = ml ? 'റേറ്റ് ചെയ്യാൻ ഒരു നക്ഷത്രത്തിൽ ടാപ്പ് ചെയ്യുക:' : 'Tap a star to rate:';
  const detailed = ml ? 'വിശദമായ റിവ്യൂ എഴുതുക' : 'Leave a detailed review';
  const body = `<div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:16px">
    <h2 style="font-size:18px;color:#111">${heading}</h2>
    <p style="color:#555;font-size:14px">${rate}</p>
    <p style="text-align:center;margin:12px 0">
      ${[1, 2, 3, 4, 5].map((n) => `<a href="${c.link}?rating=${n}" style="text-decoration:none;font-size:28px;margin:0 3px">⭐</a>`).join('')}
    </p>
    <p style="text-align:center"><a href="${c.link}" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px">${detailed}</a></p>
  </div>`;
  return {
    subject: ml ? `നിങ്ങളുടെ സന്ദർശനം എങ്ങനെയായിരുന്നു? — ${c.provider_name}` : `How was your visit with Dr. ${c.provider_name}?`,
    body
  };
}

export { render };
