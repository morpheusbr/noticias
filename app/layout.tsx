import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Notícias Locais Brasil',
  description: 'Fique por dentro das notícias da sua cidade e estado.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="bg-[#0a0a0a] font-sans text-slate-100 antialiased overflow-x-hidden">
        <main className="mx-auto min-h-screen max-w-md bg-[#0a0a0a] ring-1 ring-white/5 shadow-2xl relative">
          {children}
        </main>
      </body>
    </html>
  );
}
