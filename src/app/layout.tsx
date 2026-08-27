import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SentiBotProvider } from '@/context/SentiBotContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SentiBot AI - Emotion-Aware Virtual Help-Desk Chatbot',
  description: 'Production-ready emotion-aware virtual help-desk chatbot powered by hybrid DistilRoBERTa emotion classification, Gemini LLM fallback, and Supabase pgvector RAG.',
  keywords: ['AI Chatbot', 'Emotion Aware AI', 'Help-Desk Chatbot', 'Next.js', 'FastAPI', 'Supabase'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased overflow-x-hidden`}>
        <SentiBotProvider>{children}</SentiBotProvider>
      </body>
    </html>
  );
}
