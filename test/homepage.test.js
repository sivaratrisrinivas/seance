import assert from "node:assert/strict";
import test from "node:test";

import { renderHomepage } from "../src/render-homepage.js";

test("homepage shows the premise and both inputs", async () => {
  const body = renderHomepage();

  assert.match(body, /Hear a grounded sound reconstruction of any place and year\./);
  assert.match(body, /name="place"/);
  assert.match(body, /name="year"/);
  assert.match(body, /type="number"/);
});

test("homepage exposes a single Begin seance action tied to the ritual flow", async () => {
  const body = renderHomepage();

  assert.match(body, /<form action="\/ritual" method="get"/);
  assert.match(body, />Begin s(?:&eacute;|é)ance</);
});

test("homepage stays anonymous and account free", async () => {
  const body = renderHomepage();

  for (const phrase of ["Sign in", "Log in", "Create account", "Profile", "Saved"]) {
    assert.doesNotMatch(body, new RegExp(phrase));
  }
});

test("homepage supports mobile and desktop layouts", async () => {
  const body = renderHomepage();

  assert.match(body, /name="viewport"/);
  assert.match(body, /@media \(max-width: 720px\)/);
});

test("homepage shows subtle example queries after the primary form", async () => {
  const body = renderHomepage();

  assert.match(body, /Example queries/);
  assert.match(body, /Old City, Hyderabad\s*&middot;\s*1987/);
  assert.match(body, /Riverside, California\s*&middot;\s*1962/);
  assert.equal(body.indexOf("</form>") < body.indexOf("Example queries"), true);
});

test("example entries are clickable and start the ritual flow", async () => {
  const body = renderHomepage();

  assert.match(body, /href="\/ritual\?place=Old%20City%2C%20Hyderabad&year=1987"/);
  assert.match(body, /href="\/ritual\?place=Riverside%2C%20California&year=1962"/);
  assert.match(body, /href="\/ritual\?place=Kyoto%2C%20Japan&year=1912"/);
});
