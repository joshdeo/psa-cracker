// Shared logic for the daily news job. Pure functions so they can be tested offline.
const gn = (q) => "https://news.google.com/rss/search?q=" + encodeURIComponent(q + " when:2d") + "&hl=en-US&gl=US&ceid=US:en";

export const FEEDS = [
  { name: "Sports Collectors Daily", url: "https://www.sportscollectorsdaily.com/feed/" },
  { name: "Google News", url: gn("Cooper Flagg card"), gnews: true },
  { name: "Google News", url: gn("PSA 10 card sold"), gnews: true },
  { name: "Google News", url: gn("sports card record sale auction"), gnews: true },
  { name: "Google News", url: gn("Pokemon card sold auction"), gnews: true },
  { name: "Google News", url: gn("Yu-Gi-Oh card sold"), gnews: true },
  { name: "Google News", url: gn("baseball card sells"), gnews: true },
  { name: "Google News", url: gn("soccer card sells Messi OR Yamal OR Mbappe"), gnews: true },
];

const RELEVANT = /\b(card|cards|psa|graded|slab|topps|panini|bowman|upper deck|pok[eé]mon|yu-?gi-?oh|auction|rookie|autograph|logoman|refractor|goldin|fanatics collect|heritage auctions)\b/i;
const TOPICS = [
  ["pokemon", /pok[eé]mon|pikachu|charizard/i],
  ["yugioh", /yu-?gi-?oh|blue-eyes|dark magician/i],
  ["soccer", /soccer|football card|messi|yamal|mbapp[eé]|haaland|pel[eé]\b|ronaldo|world cup/i],
  ["basketball", /basketball|nba|wnba|flagg|lebron|jordan|kobe|curry|wembanyama|doncic/i],
  ["baseball", /baseball|mlb|ohtani|mantle|judge|trout|ruth|topps chrome|bowman/i],
];

export const clean = (s = "") =>
  String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();

export function classify(text) {
  for (const [t, re] of TOPICS) if (re.test(text)) return t;
  return "market";
}
export const isCardStory = (t) => RELEVANT.test(t);

export function parseFeed(xml, feed) {
  const out = [];
  const items = String(xml).match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const it of items) {
    const get = (tag) => { const m = it.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i")); return m ? clean(m[1]) : ""; };
    let title = get("title"); const link = get("link"); const pub = get("pubDate");
    let source = feed.name; let summary = clean(get("description"));
    if (feed.gnews) {
      const sm = it.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      if (sm) { source = clean(sm[1]); title = title.replace(new RegExp("\\s+-\\s+" + source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"), ""); }
      summary = ""; // Google News descriptions only repeat the headline
    } else if (summary.length > 220) summary = summary.slice(0, 217).replace(/\s+\S*$/, "") + "...";
    const t = Date.parse(pub);
    if (!title || !/^https:\/\//.test(link) || !t) continue;
    out.push({ id: link, title, url: link, source, summary, date: new Date(t).toISOString().slice(0, 10), ts: t });
  }
  return out;
}

export function torontoHour(ms) {
  return Number(new Intl.DateTimeFormat("en-CA", { hour: "numeric", hourCycle: "h23", timeZone: "America/Toronto" }).format(new Date(ms)));
}

// Pick up to `n` new stories: newest first, relevant to cards, spread across topics and publishers.
export function pickArticles(candidates, existing, now, n = 4) {
  const seen = new Set(existing.map((x) => x.url));
  const seenTitle = new Set(existing.map((x) => x.title.toLowerCase()));
  const fresh = candidates
    .filter((c) => !seen.has(c.url) && !seenTitle.has(c.title.toLowerCase()) && c.ts <= now + 3600e3 && now - c.ts < 4 * 86400e3 && isCardStory(c.title + " " + c.summary))
    .map((c) => ({ ...c, topic: classify(c.title + " " + c.summary) }))
    .sort((a, b) => b.ts - a.ts);
  const picked = []; const topics = new Set(); const pubs = new Set();
  for (const c of fresh) { if (picked.length >= n) break; if (topics.has(c.topic) || pubs.has(c.source)) continue; picked.push(c); topics.add(c.topic); pubs.add(c.source); }
  for (const c of fresh) { if (picked.length >= n) break; if (!picked.includes(c)) picked.push(c); }
  return picked.map(({ ts, ...rest }) => rest);
}
