// Manual trigger for testing: /.netlify/functions/news-refresh?key=YOUR_REFRESH_KEY
import { runNews } from "../lib/run-news.mjs";
export default async (req) => {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.REFRESH_KEY || key !== process.env.REFRESH_KEY) return new Response("Forbidden", { status: 403 });
  return new Response(await runNews(), { status: 200 });
};
