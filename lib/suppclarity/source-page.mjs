import { lookup } from "node:dns/promises";
import { get } from "node:https";
import { isIP } from "node:net";
import { safeSource } from "./source-url.mjs";
export function publicAddress(address) {
  if (isIP(address) === 4) {
    const n = address.split(".").map(Number);
    return !(
      n[0] === 0 ||
      n[0] === 10 ||
      n[0] === 127 ||
      n[0] >= 224 ||
      (n[0] === 169 && n[1] === 254) ||
      (n[0] === 172 && n[1] >= 16 && n[1] <= 31) ||
      (n[0] === 192 && (n[1] === 168 || n[1] === 0)) ||
      (n[0] === 100 && n[1] >= 64 && n[1] <= 127) ||
      (n[0] === 198 && (n[1] === 18 || n[1] === 19 || n[1] === 51)) ||
      (n[0] === 203 && n[1] === 0 && n[2] === 113)
    );
  }
  return (
    isIP(address) === 6 &&
    /^[23]/i.test(address) &&
    !/^2001:db8:/i.test(address) &&
    !/^2002:/i.test(address)
  );
}
export function pageText(html) {
  return html
    .replace(/<(script|style|noscript|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff)),
    )
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCodePoint(Math.min(Number(n), 0x10ffff)),
    )
    .replace(
      /&(?:nbsp|amp|quot|apos|lt|gt|micro);/g,
      (s) =>
        ({
          "&nbsp;": " ",
          "&amp;": "&",
          "&quot;": '"',
          "&apos;": "'",
          "&lt;": "<",
          "&gt;": ">",
          "&micro;": "µ",
        })[s],
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30000);
}
export async function readSourcePage(
  url,
  { signal, resolve = lookup, request = get } = {},
) {
  if (!safeSource(url)) throw Error("Unsafe source");
  let target = new URL(url).href;
  for (let redirects = 0; redirects <= 2; redirects++) {
    const u = new URL(target);
    const addresses = await resolve(u.hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some((x) => !publicAddress(x.address)))
      throw Error("Non-public source");
    const pinned = addresses.find((x) => x.family === 4) || addresses[0];
    const result = await new Promise((done, fail) => {
      const req = request(
        u,
        {
          signal,
          servername: u.hostname,
          headers: {
            Accept: "text/html",
            "Accept-Encoding": "identity",
            "User-Agent": "SuppClarity/0.4 product-label-check",
          },
          lookup: (_host, options, callback) =>
            options.all
              ? callback(null, [pinned])
              : callback(null, pinned.address, pinned.family),
        },
        (res) => {
          if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
            res.resume();
            try {
              done({ redirect: new URL(res.headers.location, u).href });
            } catch {
              fail(Error("Bad source redirect"));
            }
            return;
          }
          if (
            res.statusCode !== 200 ||
            !String(res.headers["content-type"] || "").includes("text/html") ||
            !["", "identity"].includes(
              String(res.headers["content-encoding"] || ""),
            )
          ) {
            res.resume();
            fail(Error("Unreadable source"));
            return;
          }
          let size = 0;
          const chunks = [];
          res.on("data", (chunk) => {
            size += chunk.length;
            if (size > 512000) {
              req.destroy(Error("Source too large"));
              return;
            }
            chunks.push(chunk);
          });
          res.on("end", () =>
            done({ text: pageText(Buffer.concat(chunks).toString("utf8")) }),
          );
          res.on("error", fail);
        },
      );
      req.setTimeout(7000, () => req.destroy(Error("Source timeout")));
      req.on("error", fail);
    });
    if (result.text) return { text: result.text, url: target };
    if (!safeSource(result.redirect)) throw Error("Unsafe redirect");
    target = new URL(result.redirect).href;
  }
  throw Error("Too many source redirects");
}
