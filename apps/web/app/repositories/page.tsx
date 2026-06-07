import Link from 'next/link';
import { AppShell } from '@/components/shell';
import { Section } from '@/components/section';
import { StatusChip } from '@/components/status-chip';
import { repositoryMemory } from '@/lib/data';

export default function RepositoriesPage() {
  return (
    <AppShell pathname="/repositories">
      <section className="hero">
        <div className="heroTop">
          <div>
            <StatusChip tone="success">Memory browser</StatusChip>
            <h1>Repository-owned markdown, surfaced plainly.</h1>
          </div>
          <div className="heroActions">
            <Link className="button primary" href="/">
              Back to overview
            </Link>
          </div>
        </div>
        <p>
          This page stays close to the source of truth: repository memory lives
          in <code>.codeclaw/</code>, and the UI shows the important pieces
          without inventing a separate knowledge system.
        </p>
      </section>

      <Section
        eyebrow="Indexed memory"
        title="Browse the current repository memory set"
        description="Each entry points to the markdown path it would come from in a real repo checkout."
      >
        <div className="list">
          {repositoryMemory.map((item) => (
            <article key={item.file} className="memoryCard">
              <div className="memoryCardHeader">
                <div>
                  <div className="memoryPath">
                    {item.repo} · {item.file}
                  </div>
                  <h3>{item.title}</h3>
                </div>
                <StatusChip tone={item.tone}>{item.updated}</StatusChip>
              </div>
              <p>{item.excerpt}</p>
              <div className="memoryFooter">
                <span>Markdown-backed memory</span>
                <span>Open in repo context</span>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
