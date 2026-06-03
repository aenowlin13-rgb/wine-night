import { head } from '@vercel/blob';

const BLOB_KEY = 'winenight-submissions.json';

async function readSubmissions() {
  try {
    const res = await head(BLOB_KEY);
    const data = await fetch(res.url);
    return await data.json();
  } catch (e) {
    return { names: [], submissions: [] };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const data = await readSubmissions();
  const { submissions = [] } = data;

  if (submissions.length === 0) {
    return res.status(200).json({ count: 0, totals: {}, orderCounts: {} });
  }

  const totals = {};
  const orderCounts = {};
  for (let i = 1; i <= 20; i++) { totals[i] = 0; orderCounts[i] = 0; }

  submissions.forEach(sub => {
    for (let i = 1; i <= 20; i++) {
      const s = sub.scores[i];
      if (!s) continue;
      totals[i] += (s.total || 0);
      if (s.order === true) orderCounts[i]++;
    }
  });

  return res.status(200).json({ count: submissions.length, totals, orderCounts });
}
