import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body || {};

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return res.status(500).json({ error: 'Server configuration error: VERCEL_TOKEN not set' });
  }

  try {
    // 1. Retrieve and verify Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const domain = session.metadata?.domain;
    const projectName = session.metadata?.projectName;

    if (!domain || !projectName) {
      return res.status(400).json({ error: 'Missing domain or project info in session metadata' });
    }

    console.log(`[Domain Purchase] Processing purchase for: ${domain} → project: ${projectName}`);

    // 2. Test mode guard — skip real purchase with test Stripe keys
    if ((process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_')) {
      console.log(`[Domain Purchase] TEST MODE — Skipping real Vercel domain purchase`);
      return res.status(200).json({
        success: true,
        domain,
        orderId: `test_order_${Date.now()}`,
      });
    }

    // 3. Get fresh price from Vercel
    const priceRes = await fetch(
      `https://api.vercel.com/v1/registrar/domains/${encodeURIComponent(domain)}/price`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );

    if (!priceRes.ok) {
      throw new Error('Failed to get domain price from Vercel');
    }

    const priceData = await priceRes.json();

    // 4. Purchase the domain via Vercel
    const purchaseRes = await fetch(
      `https://api.vercel.com/v1/registrar/domains/${encodeURIComponent(domain)}/buy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expectedPrice: priceData.price || priceData.registration,
          autoRenew: true,
          years: 1,
        }),
      }
    );

    if (!purchaseRes.ok) {
      const text = await purchaseRes.text();
      console.error(`[Domain Purchase] Vercel buy failed (${purchaseRes.status}):`, text);
      throw new Error(`Domain purchase failed: ${text}`);
    }

    const purchaseData = await purchaseRes.json();
    console.log(`[Domain Purchase] Domain purchased:`, purchaseData);

    // 5. Add domain to project
    const teamId = process.env.VERCEL_TEAM_ID;
    const addDomainUrl = `https://api.vercel.com/v10/projects/${encodeURIComponent(projectName)}/domains${teamId ? `?teamId=${teamId}` : ''}`;

    const addRes = await fetch(addDomainUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    if (!addRes.ok) {
      const text = await addRes.text();
      console.error(`[Domain Purchase] Add domain to project failed (${addRes.status}):`, text);
      // Domain was purchased successfully even if adding to project failed
      // The user can manually add it later
    }

    return res.status(200).json({
      success: true,
      domain,
      orderId: purchaseData.orderId || purchaseData.id || `order_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Domain Purchase] Error:', error);
    return res.status(500).json({ error: error.message || 'Domain purchase failed' });
  }
}
