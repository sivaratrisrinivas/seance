import http from "node:http";

import { handleRequest } from "./src/handle-request.js";

export { handleRequest };

export function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    const result = handleRequest({
      method: request.method ?? "GET",
      pathname: url.pathname,
      searchParams: url.searchParams,
    });

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
