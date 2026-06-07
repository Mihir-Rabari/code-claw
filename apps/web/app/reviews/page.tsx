import Link from 'next/link';

import type { ReviewRecord } from '@/lib/models';

import { AppShell } from '@/components/shell';
import { Section } from '@/components/section';
import { StatusChip } from '@/components/status-chip';
import { fetchApiJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

const toneByOutcome: Record<string, 'success' | 'warn' | 'danger' | 'neutral'> = {
  Approved: 'success',
  'Approved with notes': 'warn',
  'Changes requested': 'danger',
  Merged: 'success',
};

export default async function ReviewsPage() {
  const webReviews = await fetchApiJson<ReviewRecord[]>('/api/reviews/acme%2Fweb');
  const apiReviews = await fetchApiJson<ReviewRecord[]>('/api/reviews/acme%2Fapi');
  const reviewHistory = [...webReviews, ...apiReviews];

  return (
    <AppShell pathname="/reviews">
      <section className="hero">
        <div className="heroTop">
          <div>
            <StatusChip tone="warn">Review log</StatusChip>
            <h1>Recent review outcomes, organized for follow-up.</h1>
          </div>
          <div className="heroActions">
            <Link className="button primary" href="/">
              Back to overview
            </Link>
          </div>
        </div>
        <p>
          CodeClaw’s review view highlights what happened, who reviewed it, and
          what still needs attention. The goal is to make the next action obvious.
        </p>
      </section>

      <Section
        eyebrow="History"
        title="Latest review records"
        description="A concise log of PR-level outcomes and the summary behind each result."
      >
        <div className="stack">
          {reviewHistory.map((item) => {
            const tone = toneByOutcome[item.outcome] ?? 'neutral';
            return (
              <article key={`${item.repo}-${item.pr}`} className="reviewItem">
                <div className="reviewTop">
                  <div>
                    <div className="reviewRef">
                      {item.repo} · {item.pr}
                    </div>
                    <h3>{item.outcome}</h3>
                  </div>
                  <StatusChip tone={tone}>{item.reviewer}</StatusChip>
                </div>
                <p>{item.summary}</p>
                <div className="reviewFooter">
                  <span>{item.time}</span>
                  <span>Reviewer: {item.reviewer}</span>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </AppShell>
  );
}
