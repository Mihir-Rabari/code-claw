import Link from 'next/link';

import type { DashboardSnapshot } from '@/lib/models';

import { AppShell } from '@/components/shell';
import { Section } from '@/components/section';
import { StatusChip } from '@/components/status-chip';
import { fetchApiJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await fetchApiJson<DashboardSnapshot>('/api/dashboard');

  return (
    <AppShell pathname="/">
      <section className="hero">
        <div className="heroTop">
          <div>
            <StatusChip tone="success">Online</StatusChip>
            <h1>One place for repository memory and reviews.</h1>
          </div>
          <div className="heroActions">
            <Link className="button primary" href="/repositories">
              Browse memory
            </Link>
            <Link className="button" href="/reviews">
              Review history
            </Link>
          </div>
        </div>
        <p>
          CodeClaw is centered on GitHub. The dashboard surfaces installation
          status, repository-owned memory stored in <code>.codeclaw/</code>,
          recent review outcomes, and practical observations without adding a
          Chronicle layer.
        </p>
      </section>

      <section className="gridMetrics" aria-label="Dashboard metrics">
        {data.overviewMetrics.map((metric) => (
          <article key={metric.label} className="metric">
            <p className="metricLabel">{metric.label}</p>
            <p className="metricValue">{metric.value}</p>
            <p className="metricNote">{metric.note}</p>
          </article>
        ))}
      </section>

      <div className="panelGrid">
        <Section
          eyebrow="Installation"
          title="Current system status"
          description="The simplest useful view: what is connected, what is indexed, and what needs attention."
        >
          <div className="stack">
            {data.installationStatus.map((item) => (
              <article key={item.label} className="statusItem">
                <div className="statusTop">
                  <div>
                    <div className="statusLabel">{item.label}</div>
                    <h3>{item.summary}</h3>
                  </div>
                  <StatusChip tone={item.tone}>{item.tone}</StatusChip>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Observations"
          title="What changed recently"
          description="Short, actionable notes that help you understand the state of the repos at a glance."
          action={
            <Link className="button" href="/observations">
              View all
            </Link>
          }
        >
          <div className="stack">
            {data.observations.map((item) => (
              <article key={item.id} className="observationItem">
                <div className="observationTop">
                  <div>
                    <div className="observationTag">{item.tag}</div>
                    <h3>{item.title}</h3>
                  </div>
                  <StatusChip tone={item.tone}>{item.tone}</StatusChip>
                </div>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>

      <Section
        eyebrow="Repository memory"
        title="Browse the current memory index"
        description="This view is intentionally close to the source: repository-owned markdown files in `.codeclaw/`."
      >
        <div className="stack">
          {data.repositoryMemory.slice(0, 3).map((item) => (
            <article key={item.file} className="memoryCard">
              <div className="memoryCardHeader">
                <div>
                  <div className="memoryPath">{item.file}</div>
                  <h3>{item.title}</h3>
                </div>
                <StatusChip tone={item.tone}>{item.repo}</StatusChip>
              </div>
              <p>{item.excerpt}</p>
              <div className="memoryFooter">
                <span>{item.updated}</span>
                <span>Backed by markdown in the repo</span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Review history"
        title="Recent review outcomes"
        description="A compact log of the latest review decisions and the shape of the feedback."
        action={
          <Link className="button" href="/reviews">
            Open review log
          </Link>
        }
      >
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>PR</th>
                <th>Outcome</th>
                <th>Reviewer</th>
                <th>Summary</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.reviewHistory.map((row) => (
                <tr key={`${row.repo}-${row.pr}`}>
                  <td>{row.repo}</td>
                  <td>{row.pr}</td>
                  <td>{row.outcome}</td>
                  <td>{row.reviewer}</td>
                  <td className="small">{row.summary}</td>
                  <td>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
}
