// Runs at 12:00 and 13:00 UTC. Only the run that lands on 8 am Toronto time does the work (handles daylight saving).
import { runNews } from "../lib/run-news.mjs";
import { torontoHour } from "../lib/feed.mjs";

export default async () => {
  if (torontoHour(Date.now()) !== 8) return new Response("Not 8 am in Toronto", { status: 200 });
  const msg = await runNews();
  console.log(msg);
  return new Response(msg, { status: 200 });
};
export const config = { schedule: "0 12,13 * * *" };
