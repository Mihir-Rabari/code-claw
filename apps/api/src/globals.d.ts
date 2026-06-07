declare const process: {
  env: Record<string, string | undefined>;
};

declare module "node:http" {
  interface IncomingMessage {
    url?: string;
  }

  interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): ServerResponse;
    end(chunk?: string): void;
  }

  interface Server {
    listen(port: number, callback?: () => void): void;
  }

  function createServer(
    requestListener: (request: IncomingMessage, response: ServerResponse) => void
  ): Server;

  const http: {
    createServer: typeof createServer;
  };

  export default http;
}
