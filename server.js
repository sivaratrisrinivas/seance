import "dotenv/config";
import http from "node:http";

import { handleRequest } from "./src/handle-request.js";

export { handleRequest };

export function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    let result;
    try {
      result = await handleRequest({
        method: request.method ?? "GET",
        pathname: url.pathname,
        searchParams: url.searchParams,
      });
    } catch (e) {
      console.error('Handler error:', e.message);
      result = { status: 500, headers: {}, body: "Internal Error" };
    }
    
    if (!result || result.status === undefined) {
      console.error('Invalid result for', request.url, result);
      result = { status: 500, headers: {}, body: "Handler returned invalid result" };
    }

    response.writeHead(result.status, result.headers);
    response.end(result.body);
  });
}

export function startServer() {
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number.parseInt(process.env.PORT ?? "8000", 10);
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`Serving Seance on http://${host}:${port}`);
  });

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
