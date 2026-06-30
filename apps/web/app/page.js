// Root path redirects to the default locale (Malayalam-first).

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export default function RootIndex() {
  redirect(`/${DEFAULT_LOCALE}`);
}
