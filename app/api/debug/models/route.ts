import OpenAI from 'openai';

export async function GET() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const models = await openai.models.list();

  return Response.json({
    models: models.data.map((m) => m.id),
  });
}
