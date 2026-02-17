import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain, vercelPrice, siteId, projectName } = req.body || {};

  if (!domain || !vercelPrice || !siteId || !projectName) {
    return res.status(400).json({ error: 'Missing required fields: domain, vercelPrice, siteId, projectName' });
  }

  console.log(`[Domain Checkout] Creating session for: ${domain} (USD: $${vercelPrice})`);

  try {
    // Convert USD to GBP with markup: (usdPrice * 0.80) + 5
    const gbpPrice = Math.round((vercelPrice * 0.80 + 5) * 100) / 100;
    const amountInPence = Math.round(gbpPrice * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Domain Registration - ${domain}`,
              description: `1 year registration for ${domain}`,
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}?domain_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}?domain_payment=cancelled`,
      metadata: {
        type: 'domain_purchase',
        domain,
        projectName,
        siteId,
      },
    });

    console.log(`[Domain Checkout] Session created: ${session.id}, GBP: £${gbpPrice}`);
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('[Domain Checkout] Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
