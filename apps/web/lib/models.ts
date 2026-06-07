export type Tone = 'neutral' | 'success' | 'warn' | 'danger';

export interface DashboardMetric {
  label: string;
  value: string;
  note: string;
}

export interface InstallationStatus {
  label: string;
  tone: Tone;
  summary: string;
  detail: string;
}

export interface RepositoryMemoryItem {
  repo: string;
  file: string;
  title: string;
  excerpt: string;
  updated: string;
  tone: Tone;
}

export interface ReviewRecord {
  repo: string;
  pr: string;
  outcome: string;
  reviewer: string;
  summary: string;
  time: string;
}

export interface ObservationRecord {
  id: string;
  repo: string;
  tag: string;
  title: string;
  body: string;
  tone: Tone;
  createdAt: string;
}

export interface DashboardSnapshot {
  overviewMetrics: DashboardMetric[];
  installationStatus: InstallationStatus[];
  repositoryMemory: RepositoryMemoryItem[];
  reviewHistory: ReviewRecord[];
  observations: ObservationRecord[];
}
