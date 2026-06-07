declare const process: {
  env: Record<string, string | undefined>;
};

declare module "node:http" {
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
