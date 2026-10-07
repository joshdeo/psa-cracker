# PSA Cracker: deploy guide

## The fastest good way: GitHub plus Netlify (about 15 minutes, once)
Every later change then goes live by itself, the daily 8 am news job runs, and the forms work.

1. Make a free account at github.com. Click New repository, name it `psa-cracker`, set it to Private, click Create.
2. On the empty repo page click "uploading an existing file". Drag in everything from this folder (`index.html`, `package.json`, `netlify.toml`, the `netlify` folder, the `assets` folder, the `tests` folder). Click Commit changes.
3. Make a free account at netlify.com (sign in with GitHub). Click Add new project, then Import an existing project, then GitHub, then pick `psa-cracker`.
4. Leave the build command empty. Publish directory: `.` Click Deploy. Wait for "Published".
5. Site configuration, then Environment variables, then Add: `REFRESH_KEY` with any long random string.
6. Forms: open the Forms tab. You should see `order` and `contact` after the first deploy. Click Form notifications and add your email so every order and message lands in your inbox.
7. Test the news job now: open `https://YOURSITE.netlify.app/.netlify/functions/news-refresh?key=YOUR_REFRESH_KEY`. It should say "Added: ...". Reload the News page.
8. Rename the site (Site configuration, Change site name) to something like psacracker. Share that link with your partner.
9. Later: Domain management, Add a domain. HTTPS is automatic.

## The two minute preview (no GitHub)
Go to app.netlify.com/drop and drag this whole folder onto the page. You get a live link at once and the forms should work. The daily news job may not run this way, so use the steps above for the real launch.

## What is a demo right now
- Checkout takes no real payment. The card box is a stand in and card details are never sent. Test card: 4242 4242 4242 4242, 12/29, 123.
- Order and contact forms DO submit to Netlify Forms once deployed. Orders arrive with the customer details, cert numbers and the order summary.
- Terms, privacy and shipping pages are drafts with placeholders. A lawyer should review them.
- Prices are CAD placeholders. Exchange rates are a snapshot from Oct 6, 2026.
- Only the menu, headings and main pages are translated. The checkout, contact, news and policy pages are English for now.

## Making payments real (next step)
1. Create a Stripe account (Canada, CAD).
2. Replace the demo card box with Stripe Checkout: a small Netlify function creates a Checkout session from the cart and redirects to Stripe. Add `STRIPE_SECRET_KEY` as an environment variable.
3. Test with Stripe test cards, then switch to live keys.
4. Turn on a confirmation email from Stripe or Netlify.

## What updates by itself
News: every day at 8 am Toronto time, up to four new card stories from Sports Collectors Daily and Google News searches. The function runs at 12:00 and 13:00 UTC and only acts on the run that lands on 8 am Toronto time. Scheduled functions run only on the published production deploy.

## News and copyright
The site shows the headline, source, date and a short blurb, and links out in a new tab. Never paste article text. Keep the credit on every card.

## Editing
Starter articles live inside `index.html` as `PSAC_NEWS_SEED`. Feed sources are in `netlify/lib/feed.mjs`. Run the feed tests with `npm install` then `npm test`.
