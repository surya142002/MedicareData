import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// expands a user search into multiple related terms/synonyms
export const expandQuery = async (fields, datasetType, query) => {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  console.log("🔑 OpenAI Key Prefix:", process.env.OPENAI_API_KEY?.slice(0, 6));

  const prompt = `
You are assisting medical code lookup.
Dataset type: ${datasetType}
Searchable fields: ${fields.join(", ")}

User query: "${query}"

Return a SHORT comma-separated list of search phrases, synonyms,
related terms, alternate wording, spelling corrections, and common
medical equivalents that might match rows in this dataset.

Do NOT explain anything. Only output phrases.
Example output: term1, term2, term3...
`;

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices[0].message.content;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};
