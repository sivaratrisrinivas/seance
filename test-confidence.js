import { handleRequest } from "./server.js";

async function run() {
  const response = await handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987" }),
  });
  console.log(response.body);
  console.log("MATCH:", /Confidence/i.test(response.body));
}
run();
