import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Kahoot - Quiz Platform',
  description: 'AI-powered quiz creation and real-time game hosting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
