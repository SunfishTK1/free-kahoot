import Link from 'next/link';

const sections = [
  {
    title: 'User Management & Plans',
    items: [
      'Email + password auth with JWT cookies',
      'FREE plan limits enforced via middleware helpers',
      'Usage counters for AI generations and hosted games',
    ],
  },
  {
    title: 'Quiz Creation & Review',
    items: [
      'Quiz, Question, Option models with validation',
      'Draft → Published lifecycle and audit fields',
      'Review metadata for AI-generated content',
    ],
  },
  {
    title: 'AI Quiz Generation',
    items: [
      'Upload PDFs or fetch URLs and create AI jobs',
      'Azure OpenAI integration with deterministic output schema',
      'Async job orchestration and clear failure reporting',
    ],
  },
  {
    title: 'Real-time Game Hosting',
    items: [
      'Game + Player session models with scoring utilities',
      'Plan-aware player caps and lobby validation',
      'WebSocket-friendly payload contracts for events',
    ],
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p>
          This monorepo contains the reference implementation requested in the PRDs. Explore the{' '}
          <Link href="/docs/deployment-vercel" className="underline">deployment guide</Link> to learn how to run it on Vercel.
        </p>
        <p>
          The backend is powered by Next.js App Router, Prisma, and Azure OpenAI integrations. Unit tests cover critical
          business logic including plan limits, quiz validation, and the game state machine.
        </p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-2">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
