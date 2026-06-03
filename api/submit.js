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

async function writeData(data) {
  const body = JSON.stringify(data);
  await fetch(`${BLOB_URL}/${FILE}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${BLOB_TOKEN}`,
      'Content-Type': 'application/json',
      'x-api-version': '7',
    },
    body,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, scores } = req.body;
  if (!name || !scores) return res.status(400).json({ error: 'Missing name or scores' });

  const nameKey = name.trim().toLowerCase();
  const data = await readData();

  if (data.names.includes(nameKey)) {
    return res.status(409).json({ error: 'Already submitted' });
  }

  data.names.push(nameKey);
  data.submissions.push({ name: name.trim(), scores, submittedAt: Date.now() });

  await writeData(data);
  return res.status(200).json({ ok: true });
}
