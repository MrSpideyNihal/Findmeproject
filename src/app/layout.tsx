import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import SessionProvider from '@/components/SessionProvider';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: {
    default: 'ProjectVault – Student Project Showcase',
    template: '%s | ProjectVault',
  },
  description:
    'ProjectVault is a platform where teachers publish student projects for the world to discover. Search, explore, and get inspired.',
  keywords: ['student projects', 'project showcase', 'academic projects', 'GitHub projects'],
  openGraph: {
    title: 'ProjectVault – Student Project Showcase',
    description: 'Discover amazing student projects across all batches and technologies.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ToastProvider>
            <Navbar />
            <main style={{ position: 'relative', zIndex: 1 }}>
              {children}
            </main>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
