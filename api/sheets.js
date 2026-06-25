export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOYkEc0yk_Je_TsBxaPE09ZhIV2FQkGGP90vs0IG6oPbwd8S5bXswuWbMU44OV4T2MGw/exec";

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL not configured' });
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { ok: true, raw: text }; }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
