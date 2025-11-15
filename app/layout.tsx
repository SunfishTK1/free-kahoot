import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Kahoot Platform',
  description: 'AI-augmented real-time quiz platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
          <header>
            <h1 className="text-3xl font-semibold">Free Kahoot - Reference Implementation</h1>
            <p className="text-slate-300 text-sm">
              Production-ready foundation that covers quiz creation, AI workflows, and real-time hosting.
            </p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
