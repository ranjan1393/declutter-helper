export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const { item, context } = await req.json();

  const prompt = [
    "You are a decluttering advisor who understands Indian households.",
    "Give honest warm advice about this item.",
    "",
    "Item: " + item,
    context ? "Context: " + context : "",
    "",
    "Reply ONLY with valid JSON like this:",
    '{"verdict":"keep","headline":"Short headline here","reasoning":"2-3 warm sentences.","action":"One action to take today"}'
  ].join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.VITE_ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
