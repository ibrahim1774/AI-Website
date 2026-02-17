import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body || {};

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return res.status(500).json({ error: 'Server configuration error: VERCEL_TOKEN not set' });
  }

  console.log(`[Domain] Checking availability for: ${domain}`);

  try {
    // Check availability
    const availabilityRes = await fetch(
      `https://api.vercel.com/v1/registrar/domains/${encodeURIComponent(domain)}/availability`,
      {
        headers: { Authorization: `Bearer ${vercelToken}` },
      }
    );

    if (!availabilityRes.ok) {
      const text = await availabilityRes.text();
      console.error(`[Domain] Availability check failed (${availabilityRes.status}):`, text);
      return res.status(availabilityRes.status).json({ error: 'Failed to check domain availability' });
    }

    const availabilityData = await availabilityRes.json();
    const available = availabilityData.available === true;

    if (!available) {
      return res.status(200).json({ available: false });
    }

    // Get price if available
    const priceRes = await fetch(
      `https://api.vercel.com/v1/registrar/domains/${encodeURIComponent(domain)}/price`,
      {
        headers: { Authorization: `Bearer ${vercelToken}` },
      }
    );

    if (!priceRes.ok) {
      // Domain is available but price check failed — return available without price
      console.error(`[Domain] Price check failed (${priceRes.status})`);
      return res.status(200).json({ available: true, price: null, renewalPrice: null });
    }

    const priceData = await priceRes.json();

    return res.status(200).json({
      available: true,
      price: priceData.price || priceData.registration,
      renewalPrice: priceData.renewal || priceData.price,
    });
  } catch (error: any) {
    console.error('[Domain] Check error:', error);
    return res.status(500).json({ error: error.message || 'Failed to check domain' });
  }
}
