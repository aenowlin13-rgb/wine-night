const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_URL = 'https://blob.vercel-storage.com';
const FILE = 'winenight-submissions.json';

async function readData() {
  try {
    const listRes = await fetch(`${BLOB_URL}?prefix=${FILE}&limit=1`, {
      headers: { Authorization: `Bearer ${BLOB_TOKEN}` }
    });
    const list = await listRes.json();
    if (!list.blobs || list.blobs.length === 0) return { names: [], submissions: [] };
    const dataRes = await fetch(list.blobs[0].url);
    return await dataRes.json();
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

  const data = await readData();
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
