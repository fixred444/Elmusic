import './globals.css';
import { AppProvider } from '@/lib/store';
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
