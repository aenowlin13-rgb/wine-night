import { put, head, getDownloadUrl } from '@vercel/blob';

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

async function writeSubmissions(data) {
  await put(BLOB_KEY, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
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
  const data = await readSubmissions();

  if (data.names.includes(nameKey)) {
    return res.status(409).json({ error: 'Already submitted' });
  }

  data.names.push(nameKey);
  data.submissions.push({ name: name.trim(), scores, submittedAt: Date.now() });

  await writeSubmissions(data);
  return res.status(200).json({ ok: true });
}
