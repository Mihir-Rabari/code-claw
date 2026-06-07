import Link from 'next/link';
import type { ReactNode } from 'react';

const sections = [
  {
    href: '/',
    label: 'Overview',
    note: 'Installation and current system health',
  },
  {
    href: '/repositories',
    label: 'Memory',
    note: 'Repository-owned markdown in .codeclaw/',
  },
  {
    href: '/reviews',
    label: 'Reviews',
    note: 'Latest review outcomes and follow-ups',
  },
  {
    href: '/observations',
    label: 'Observations',
    note: 'What the assistant noticed recently',
  },
];

export function AppShell({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brandMark">CodeClaw</div>
            <div>
              <h1 className="brandTitle">GitHub-first memory and review ops</h1>
              <p className="brandCopy">
                A focused dashboard for installation status, repository memory,
                review history, and observations.
              </p>
            </div>
          </div>

          <nav className="nav" aria-label="Primary">
            {sections.map((section) => {
              const active = pathname === section.href;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="navLink"
                  data-active={active}
                >
                  <span className="navLabel">
                    <strong>{section.label}</strong>
                    <span>{section.note}</span>
                  </span>
                  <span className={`pill ${active ? 'success' : 'neutral'}`}>
                    {active ? 'Open' : 'View'}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebarMeta">
            <div className="metaRow">
              <span>Memory source</span>
              <strong>.codeclaw/</strong>
            </div>
            <div className="metaRow">
              <span>Scope</span>
              <strong>GitHub repos</strong>
            </div>
            <div className="metaRow">
              <span>Chronicles</span>
              <strong>Disabled</strong>
            </div>
          </div>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
