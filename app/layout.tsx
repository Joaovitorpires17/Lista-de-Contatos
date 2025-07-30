import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ToasterProvider } from '@/components/ToasterProvider';


export const metadata: Metadata = {
  title: 'Lista de Contatos',
  description: 'Aplicação para gerenciar contatos com Next.js 15',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
