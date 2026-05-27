import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { item, context } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a decluttering advisor who deeply understands Indian households and emotions. Give honest, warm advice about this item.

Item: "${item}"
${context ? Context: "${context}" : ''}

Consider: sentimental value, practical use, Indian family dynamics, guilt around gifts, "might need someday" thinking.

Respond ONLY in this exact JSON format, nothing else:
{
  "verdict": "keep" or "donate" or "repurpose" or "trash",
  "headline": "Short warm 6-8 word headline",
  "reasoning": "2-3 sentences. Honest, warm, culturally aware.",
  "action": "One specific action to take today"
}`
      }],
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
