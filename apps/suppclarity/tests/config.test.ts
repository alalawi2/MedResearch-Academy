import { strict as assert } from "node:assert";
import { test } from "node:test";
import config from "../app.config.ts";
import type { ConfigContext } from "expo/config";

test("Academy web prefix never leaks into the default native asset configuration", () => {
  const previous = process.env.SUPPCLARITY_WEB_BASE_PATH;
  try {
    delete process.env.SUPPCLARITY_WEB_BASE_PATH;
    const native = config({
      config: { name: "SuppClarity", slug: "suppclarity" },
    } as ConfigContext);
    assert.equal(native.experiments?.baseUrl, undefined);
    process.env.SUPPCLARITY_WEB_BASE_PATH = "/suppclarity";
    const web = config({
      config: { name: "SuppClarity", slug: "suppclarity" },
    } as ConfigContext);
    assert.equal(web.experiments?.baseUrl, "/suppclarity");
  } finally {
    if (previous === undefined) delete process.env.SUPPCLARITY_WEB_BASE_PATH;
    else process.env.SUPPCLARITY_WEB_BASE_PATH = previous;
  }
});
