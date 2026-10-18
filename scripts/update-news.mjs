// Refreshes news.json with current headlines about Dessau from Google News (RSS).
// Run by .github/workflows/update-news.yml once a day; needs Node 18 or newer, no packages.
// Only headlines, sources, dates and links are stored, never article text.
import { readFile, writeFile } from 'node:fs/promises';

const QUERIES = ['Dessau-Roßlau', 'Dessau Bauhaus', 'Dessau Stadt'];
const MAX_ITEMS = 10, MAX_AGE_DAYS = 45;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml, t) => { const m = xml.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')); return m ? decode(m[1]) : ''; };

async function feed(q) {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=de&gl=DE&ceid=DE:de';
  const res = await fetch(url, { headers: { 'User-Agent': 'desscover-news-bot' } });
  if (!res.ok) throw new Error(q + ': HTTP ' + res.status);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
    const it = m[1], src = tag(it, 'source'); let title = tag(it, 'title');
    if (src && title.endsWith(' - ' + src)) title = title.slice(0, -(src.length + 3));
    return { title, url: tag(it, 'link'), src, date: new Date(tag(it, 'pubDate')) };
  }).filter(n => n.title && n.url && !isNaN(n.date));
}

const pinned = JSON.parse(await readFile('news-pinned.json', 'utf8')).items || [];
const seen = new Set(pinned.map(n => n.title.toLowerCase())), auto = [];
for (const q of QUERIES) {
  try { for (const n of await feed(q)) { const key = n.title.toLowerCase(); if (seen.has(key)) continue; seen.add(key); auto.push(n); } }
  catch (e) { console.warn('skipped', e.message); }
}
const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
const fresh = auto.filter(n => n.date.getTime() > cutoff).sort((a, b) => b.date - a.date).slice(0, MAX_ITEMS)
  .map((n, i) => ({ d: n.date.getUTCDate() + ' ' + MONTHS[n.date.getUTCMonth()] + ' ' + n.date.getUTCFullYear(), id: 'auto' + i, title: n.title, text: '', src: n.src || 'Google News', url: n.url }));
if (!fresh.length) { console.log('No fresh headlines found; news.json left unchanged.'); process.exit(0); }
const today = new Date(), stamp = 'Updated automatically on ' + today.getUTCDate() + ' ' + MONTHS[today.getUTCMonth()] + ' ' + today.getUTCFullYear() + ' from Google News.';
await writeFile('news.json', JSON.stringify({ stamp, items: pinned.concat(fresh) }, null, 2) + '\n');
console.log('news.json updated with', fresh.length, 'headlines.');
