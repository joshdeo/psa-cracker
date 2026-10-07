import { getStore } from "@netlify/blobs";
import { FEEDS, parseFeed, pickArticles } from "./feed.mjs";

export async function runNews(now = Date.now()) {
  const store = getStore("psac-news");
  const existing = (await store.get("items", { type: "json" }).catch(() => null)) || [];
  const all = [];
  for (const f of FEEDS) {
    try {
      const r = await fetch(f.url, { headers: { "user-agent": "PSACrackerNewsBot/1.0 (+https://psacracker.com)" } });
      if (r.ok) all.push(...parseFeed(await r.text(), f));
    } catch (e) { console.log("feed failed", f.url, String(e)); }
  }
  const picked = pickArticles(all, existing, now, 4);
  if (!picked.length) return "Nothing new";
  await store.setJSON("items", [...picked, ...existing].slice(0, 400));
  return "Added: " + picked.map((p) => p.title).join(" | ");
}
