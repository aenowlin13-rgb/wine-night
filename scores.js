import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ids = await kv.smembers('winenight:submissions');
  if (!ids || ids.length === 0) return res.status(200).json({ count: 0, totals: {}, orderCounts: {} });

  const totals = {};
  const orderCounts = {};
  for (let i = 1; i <= 20; i++) { totals[i] = 0; orderCounts[i] = 0; }

  for (const id of ids) {
    const sub = await kv.hgetall(`winenight:submission:${id}`);
    if (!sub || !sub.scores) continue;
    const scores = typeof sub.scores === 'string' ? JSON.parse(sub.scores) : sub.scores;
    for (let i = 1; i <= 20; i++) {
      const s = scores[i];
      if (!s) continue;
      totals[i] += (s.total || 0);
      if (s.order === true) orderCounts[i]++;
    }
  }

  return res.status(200).json({ count: ids.length, totals, orderCounts });
}
