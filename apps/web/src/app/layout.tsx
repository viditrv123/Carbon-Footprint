import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/components/providers/query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'EcoTrack — Carbon Footprint Tracker', template: '%s | EcoTrack' },
  description: 'Track, understand, and reduce your personal carbon footprint with personalized insights.',
  keywords: ['carbon footprint', 'sustainability', 'climate', 'eco', 'green', 'environment'],
  authors: [{ name: 'EcoTrack' }],
  openGraph: {
    title: 'EcoTrack — Carbon Footprint Tracker',
    description: 'Track, understand, and reduce your personal carbon footprint.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#2D6A4F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
