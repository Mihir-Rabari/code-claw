import "./styles.css";
import type { CodeClawProject } from "@codeclaw/types";

const app = document.querySelector<HTMLDivElement>("#app");

const sampleProject: CodeClawProject = {
  id: "codeclaw-demo",
  name: "CodeClaw",
  repository: {
    owner: "codeclaw",
    name: "codeclaw",
    fullName: "codeclaw/codeclaw",
    defaultBranch: "main"
  },
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="shell">
    <p class="eyebrow">CodeClaw</p>
    <h1>Monorepo scaffold is ready.</h1>
    <p class="lede">This workspace now has shared types, an API stub, and a lightweight web shell for later agents.</p>
    <section class="card">
      <h2>Sample project</h2>
      <pre>${escapeHtml(JSON.stringify(sampleProject, null, 2))}</pre>
    </section>
  </main>
`;

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
