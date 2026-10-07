import { parseFeed, pickArticles, classify, torontoHour } from "../netlify/lib/feed.mjs";
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log("FAIL", m); } else console.log("ok  ", m); };
const now = Date.parse("2026-10-07T12:30:00Z");
const rss = `<rss><channel>
<item><title><![CDATA[Cooper Flagg rookie card hits new record &amp; more]]></title><link>https://example.com/a</link><pubDate>Tue, 06 Oct 2026 14:00:00 GMT</pubDate><description>A graded card sold.</description></item>
<item><title>Pokemon PSA 10 Charizard sells at auction - Goldin News</title><link>https://example.com/b</link><pubDate>Tue, 06 Oct 2026 15:00:00 GMT</pubDate><source url="https://x.com">Goldin News</source></item>
<item><title>Weather today</title><link>https://example.com/c</link><pubDate>Tue, 06 Oct 2026 15:00:00 GMT</pubDate></item>
<item><title>Bad link card</title><link>javascript:alert(1)</link><pubDate>Tue, 06 Oct 2026 15:00:00 GMT</pubDate></item>
</channel></rss>`;
const a = parseFeed(rss, { name: "Test" }); ok(a.length === 3, "skips non https links");
ok(a[0].title.includes("& more"), "decodes entities");
const g = parseFeed(rss, { name: "Google News", gnews: true });
ok(g[1].title === "Pokemon PSA 10 Charizard sells at auction" && g[1].source === "Goldin News", "google news publisher split");
ok(classify("Cooper Flagg card") === "basketball" && classify("Charizard PSA 10") === "pokemon", "classify");
const picked = pickArticles(a, [], now, 4); ok(picked.length === 2 && picked.every((x) => x.title !== "Weather today"), "drops non card stories");
ok(new Set(picked.map((x) => x.topic)).size === 2, "spreads topics");
ok(pickArticles(a, [{ url: "https://example.com/a", title: "x" }], now).length === 1, "skips already stored");
ok(torontoHour(Date.parse("2026-10-07T12:00:00Z")) === 8, "12:00 UTC is 8 am in October");
ok(torontoHour(Date.parse("2026-12-07T13:00:00Z")) === 8, "13:00 UTC is 8 am in December");
process.exit(fail ? 1 : 0);
