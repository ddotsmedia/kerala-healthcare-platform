'use client';

// Live resume preview — renders the shared template HTML + scoped CSS.
import { useMemo } from 'react';
import { renderResumeBody, resumeCSS } from '@/lib/resumeRender';

export default function ResumePreview({ resume, templateId, locale }) {
  const html = useMemo(
    () => `<style>${resumeCSS()}</style>` + renderResumeBody(resume, templateId, locale),
    [resume, templateId, locale]
  );
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 bg-gray-100 p-3">
      <div className="mx-auto bg-white shadow-sm" style={{ maxWidth: 800 }}
        dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
