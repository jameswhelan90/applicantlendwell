import type { Metadata } from 'next';
import { ApplicationProvider } from '@/context/ApplicationContext';
import { ChatProvider } from '@/context/ChatContext';
import { Poppins } from 'next/font/google';
import './globals.css';

const neuSans = Poppins({
  variable: '--font-neumorphic',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mortgage Application — Lendwell',
  description: 'Your guided mortgage application journey',
  themeColor: '#1e3a6e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background" style={{ backgroundColor: '#F7F8FC' }}>
      <body className={`${neuSans.variable} font-sans bg-background text-foreground antialiased min-h-screen`} style={{ backgroundColor: '#F7F8FC' }}>
        <ApplicationProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </ApplicationProvider>
      </body>
    </html>
  );
}
