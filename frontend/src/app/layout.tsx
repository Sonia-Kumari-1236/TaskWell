import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'Taskwell — Personal Task Management',
  description: 'A refined space for managing your tasks with clarity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body bg-cream text-ink antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0D0D0D',
                color: '#F7F5EF',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                borderRadius: '4px',
                padding: '12px 16px',
                border: '1px solid #2A2A22',
              },
              success: {
                iconTheme: { primary: '#6B8C74', secondary: '#F7F5EF' },
                duration: 3000,
              },
              error: {
                iconTheme: { primary: '#C4704B', secondary: '#F7F5EF' },
                duration: 4000,
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
