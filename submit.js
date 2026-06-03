import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, scores } = req.body;
  if (!name || !scores) return res.status(400).json({ error: 'Missing name or scores' });

  const nameKey = name.trim().toLowerCase();

  const alreadySubmitted = await kv.sismember('winenight:names', nameKey);
  if (alreadySubmitted) return res.status(409).json({ error: 'Already submitted' });

  await kv.sadd('winenight:names', nameKey);

  const submissionId = `${nameKey}-${Date.now()}`;
  await kv.hset(`winenight:submission:${submissionId}`, { name: name.trim(), scores: JSON.stringify(scores) });
  await kv.sadd('winenight:submissions', submissionId);

  return res.status(200).json({ ok: true });
}
