export function safeSource(value) {
  try {
    const u = new URL(value);
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      u.port ||
      !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname) ||
      /(^|\.)(localhost|local|internal|test|invalid)$/.test(u.hostname)
    )
      return null;
    u.hash = "";
    for (const key of [...u.searchParams.keys()])
      if (/^utm_/i.test(key) || ["gclid", "fbclid"].includes(key))
        u.searchParams.delete(key);
    if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/$/, "");
    return u.href;
  } catch {
    return null;
  }
}
