import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/modules/apollo/ApolloWrapper';
import { I18nProvider } from '@/modules/i18n/I18nProvider';
import { ToastProvider } from '@/modules/ui/Toast';

// erxes core-ui uses Inter.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fafafa',
};

export const metadata: Metadata = {
  title: '7x portal',
  description: '7x training center portal for teachers and students',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ApolloWrapper>
          <I18nProvider>
            <ToastProvider>{children}</ToastProvider>
          </I18nProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
