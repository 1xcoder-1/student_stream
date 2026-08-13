import { GoogleGenerativeAI } from "@google/generative-ai";

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function autoFillSubscription(name: string): Promise<{
  provider: string;
  category: string;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "one-time";
  autoRenew: boolean;
}> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a subscription database assistant. 
Given a subscription service name, return accurate details.
Return ONLY valid JSON, no markdown, no explanation.
JSON shape: {
  "provider": string,
  "category": one of [
    "Entertainment","Productivity","Development",
    "Design","Marketing","Finance","Health",
    "Education","Cloud","Communication","Other"
  ],
  "amount": number (USD, most common plan price),
  "currency": "USD",
  "billingCycle": "monthly" | "yearly" | "one-time",
  "autoRenew": boolean
}

Subscription name: ${name}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Clean markdown block if model added it
  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

export async function summarizeSpending(subscriptions: {
  name: string;
  amount: number;
  billingCycle: string;
  category: string;
}[]): Promise<string> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a personal finance assistant specializing in 
subscription optimization. Analyze the user's subscriptions and 
give practical, specific advice. Be direct and actionable.
Format: 3-4 short paragraphs. No bullet points. No markdown headers.

Analyze my subscriptions: ${JSON.stringify(subscriptions)}`;

  const result = await model.generateContent(prompt);
  return result.response.text() || "Unable to generate summary.";
}
export async function summarizeSpendingStream(subscriptions: {
  name: string;
  amount: number;
  billingCycle: string;
  category: string;
}[]): Promise<ReadableStream> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a personal finance assistant specializing in 
subscription optimization. Analyze the user's subscriptions and 
give practical, specific advice. Be direct and actionable.
Format: 3-4 short paragraphs. No bullet points. No markdown headers.

Analyze my subscriptions: ${JSON.stringify(subscriptions)}`;

  const result = await model.generateContentStream(prompt);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            controller.enqueue(encoder.encode(chunkText));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
