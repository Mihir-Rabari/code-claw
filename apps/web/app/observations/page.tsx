import Link from 'next/link';

import type { ObservationRecord } from '@/lib/models';

import { AppShell } from '@/components/shell';
import { Section } from '@/components/section';
import { StatusChip } from '@/components/status-chip';
import { fetchApiJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ObservationsPage() {
  const webObservations = await fetchApiJson<ObservationRecord[]>('/api/observations/acme%2Fweb');
  const apiObservations = await fetchApiJson<ObservationRecord[]>('/api/observations/acme%2Fapi');
  const observations = [...webObservations, ...apiObservations];

  return (
    <AppShell pathname="/observations">
      <section className="hero">
        <div className="heroTop">
          <div>
            <StatusChip tone="neutral">Observations</StatusChip>
            <h1>Useful signals, not a chronicle.</h1>
          </div>
          <div className="heroActions">
            <Link className="button primary" href="/">
              Back to overview
            </Link>
          </div>
        </div>
        <p>
          The dashboard keeps observations short and operational. This makes it
          easier to see what deserves attention without creating a separate
          narrative layer.
        </p>
      </section>

      <Section
        eyebrow="Signal feed"
        title="Recent observations"
        description="A lightweight record of state, patterns, and actions worth taking next."
      >
        <div className="stack">
          {observations.map((item) => (
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
    </AppShell>
  );
}
