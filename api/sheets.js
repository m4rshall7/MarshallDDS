export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKpzs77OhezQjDAVcHxwShtMUySRGmr8QD51tO_xNQvLr7Bj7VzJ3QsspSCpkKCFIH/exec";

  try {
    if (req.method === 'POST') {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        redirect: 'follow',
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { ok: true }; }
      return res.status(200).json(data);

    } else if (req.method === 'GET') {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow',
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { ok: false, raw: text }; }
      return res.status(200).json(data);

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
