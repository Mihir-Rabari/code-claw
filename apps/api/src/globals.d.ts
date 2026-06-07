declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'node:fs' {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function renameSync(oldPath: string, newPath: string): void;
  export function writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

declare module 'node:path' {
  export function dirname(path: string): string;
  export function join(...parts: string[]): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare const Buffer: {
  from(data: string, encoding: 'base64'): { toString(encoding: 'utf-8'): string };
};

declare module 'node:http' {
  export interface IncomingMessage {
    url?: string;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    on(event: 'data', listener: (chunk: string | Uint8Array) => void): IncomingMessage;
    on(event: 'end', listener: () => void): IncomingMessage;
    on(event: 'error', listener: (error: Error) => void): IncomingMessage;
  }

  export interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): ServerResponse;
    end(chunk?: string): void;
  }

  export interface Server {
    listen(port: number, callback?: () => void): void;
  }

  export function createServer(
    requestListener: (request: IncomingMessage, response: ServerResponse) => void
  ): Server;

  const http: {
    createServer: typeof createServer;
  };

  export default http;
}
