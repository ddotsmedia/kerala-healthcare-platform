// Admin root layout — dark sidebar shell, theme, toasts, keyboard shortcuts.
// Access restricted to verification_agent / platform_admin (enforced per page).

import './globals.css';
import AdminShell from '@/components/shell/AdminShell';

export const metadata = {
  title: 'KHP Admin',
  description: 'Kerala Health Portal — internal operations dashboard'
};

// Apply theme before paint to avoid a flash.
const themeInit = `try{var t=localStorage.getItem('khp-admin-theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
