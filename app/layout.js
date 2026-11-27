import './globals.css';
import { AppProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/auth';
import AuthGate from '@/components/AuthGate';
import Shell from '@/components/Shell';

export const metadata = {
  title: 'El Music',
  description: 'El Music — putar musik dengan tampilan liquid glass.',
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport = {
  themeColor: '#0a0908',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
      </head>
      <body>
        <AuthProvider>
          <AuthGate>
            <AppProvider>
              <Shell>{children}</Shell>
            </AppProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
