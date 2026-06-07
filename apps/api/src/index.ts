import http from "node:http";
import type { CodeClawProject } from "@codeclaw/types";

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);

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

const server = http.createServer((request, response) => {
  const url = request.url ?? "/";

  if (url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, service: "api" }));
    return;
  }

  if (url === "/project") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(sampleProject));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`CodeClaw API listening on http://localhost:${port}`);
});
