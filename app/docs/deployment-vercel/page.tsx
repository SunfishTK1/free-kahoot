import fs from 'node:fs';
import path from 'node:path';
import Markdown from 'react-markdown';

function getDoc() {
  const docPath = path.join(process.cwd(), 'docs', 'deployment-vercel.md');
  return fs.readFileSync(docPath, 'utf-8');
}

export default function DeploymentDocPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <Markdown>{getDoc()}</Markdown>
    </article>
  );
}
