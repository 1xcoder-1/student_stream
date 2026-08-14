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
  billingCycle: "monthly" | "yearly" | "one-time" | "weekly";
  autoRenew: boolean;
}> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a student expense database assistant in Pakistan. 
Given a student expense name (e.g., Zong data, Hostel rent, NUST fee, PTCL, indrive ride, mess food, Canva, etc.), return accurate details.
Return ONLY valid JSON, no markdown, no explanation.
JSON shape: {
  "provider": string (e.g. "Zong", "NUST", "SNGPL", "Indrive", "Hostel Warden", "Canva", "Google"),
  "category": one of [
    "Academics & Fees","Hostel & Rent","Food & Mess",
    "Mobile & Internet","Transport","Entertainment & Outings",
    "Freelance Tools & Learning","Other"
  ],
  "amount": number (most common price in PKR for Pakistani services, or USD for global SaaS tools),
  "currency": "PKR" | "USD" (default to PKR for local services, USD for international software),
  "billingCycle": "monthly" | "yearly" | "one-time" | "weekly",
  "autoRenew": boolean
}

Expense name: ${name}`;

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

  const prompt = `You are a student finance assistant and budget coach specializing in student expense optimization and money-saving hacks for university students in Pakistan. 
Analyze the user's student expenses and allowance, and give practical, specific advice in Pakistani context (e.g. using Metro bus instead of Indrive, optimizing Jazz/Zong data packages, hostel room sharing, local mess bills vs eating out, student software discounts like GitHub Student Pack, and managing freelance incomes).
Be direct, empathetic, and highly actionable.
Format: 3-4 short paragraphs. No bullet points. No markdown headers.

Analyze my student expenses: ${JSON.stringify(subscriptions)}`;

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

  const prompt = `You are a student finance assistant and budget coach specializing in student expense optimization and money-saving hacks for university students in Pakistan. 
Analyze the user's student expenses and allowance, and give practical, specific advice in Pakistani context (e.g. using Metro bus instead of Indrive, optimizing Jazz/Zong data packages, hostel room sharing, local mess bills vs eating out, student software discounts like GitHub Student Pack, and managing freelance incomes).
Be direct, empathetic, and highly actionable.
Format: 3-4 short paragraphs. No bullet points. No markdown headers.

Analyze my student expenses: ${JSON.stringify(subscriptions)}`;

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
