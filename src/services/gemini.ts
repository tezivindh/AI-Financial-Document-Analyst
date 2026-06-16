import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Analyzes a single filing or transcript
  async analyzeDocument(fileBuffer: Buffer, mimeType: string, period: string, docType: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const parts: any[] = [];

    if (mimeType === "application/pdf") {
      parts.push({
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      });
    } else {
      parts.push({
        text: fileBuffer.toString("utf8"),
      });
    }

    const prompt = `You are a Senior Financial Analyst and Investment Manager.
Analyze the attached financial document (reporting period: ${period}, type: ${docType}).

Your task is to extract, structure, and analyze the document contents. Return a single JSON object that perfectly conforms to the schema below. Make sure to identify all named financial figures, calculate margins if not explicitly stated, analyze management tone, and extract key risk factors.

JSON Schema:
{
  "companyName": "Name of the company (be exact)",
  "ticker": "Ticker symbol if available, or null",
  "period": "${period}",
  "documentType": "${docType}",
  "financials": {
    "revenue": number or null, // in millions USD (e.g. 51700 for $51.7B)
    "ebitda": number or null, // in millions USD
    "netIncome": number or null, // in millions USD
    "operatingCashFlow": number or null, // in millions USD
    "capex": number or null, // in millions USD
    "totalDebt": number or null, // in millions USD
    "cashAndEquivalents": number or null, // in millions USD
    "grossMargin": number or null, // as percentage (e.g. 43.5)
    "operatingMargin": number or null, // as percentage (e.g. 15.2)
    "ebitdaMargin": number or null, // as percentage (e.g. 20.1)
    "netMargin": number or null, // as percentage (e.g. 10.5)
    "eps": number or null // in USD (e.g. 3.25)
  },
  "mda": {
    "summary": "1-2 paragraph analytical summary of the Management Discussion & Analysis or presentation.",
    "keyHighlights": ["highlight statement 1", "highlight statement 2", "highlight statement 3"]
  },
  "toneAnalysis": {
    "sentiment": number, // between -1.0 (very pessimistic/bearish) and 1.0 (very optimistic/bullish)
    "confidence": number, // between 0.0 (uncertain/hedging) and 1.0 (completely certain/direct)
    "hedgingScore": number, // between 0.0 (no hedging) and 1.0 (high hedging/protective language)
    "analysisSummary": "Detailed commentary explaining the management's tone. Note whether they are expressing confidence or hiding behind hedging, cautious, or protective language.",
    "keyQuotes": [
      {
        "quote": "Exact sentence from the text demonstrating this tone",
        "context": "Context of what they were discussing (e.g. guidance, supply chain)",
        "tone": "confident" | "cautious" | "hedged" | "neutral"
      }
    ]
  },
  "riskFactors": [
    {
      "category": "market" | "operational" | "financial" | "regulatory" | "strategic" | "other",
      "description": "Clear explanation of the specific risk factor mentioned in the document",
      "severity": "high" | "medium" | "low"
    }
  ]
}

Strict requirements:
1. Do not invent any numbers. If a financial figure is not mentioned, use null.
2. If the document is a transcript, focus on extracting the guidance figures, tone, and Q&A insights.
3. Keep the output clean. Just the raw JSON.`;

    parts.push({ text: prompt });

    const result = await callWithRetry(() => model.generateContent(parts));
    const textResponse = result.response.text();
    return cleanAndParseJSON(textResponse);
  }
}

function cleanAndParseJSON(text: string): any {
  let cleanText = text.trim();
  
  // Remove markdown code block fences if present
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();

  // Strip trailing commas from objects/arrays
  cleanText = cleanText.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("Standard JSON parsing failed, attempting repair. Error:", e);
    try {
      const repaired = repairJSONString(cleanText);
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error("Failed to repair JSON:", repairError);
      throw new Error(`Invalid JSON format returned by Gemini: ${(e as Error).message}`);
    }
  }
}

function repairJSONString(json: string): string {
  let inString = false;
  let escapeNext = false;
  let result = "";
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      if (!inString) {
        inString = true;
        result += char;
      } else {
        let isClosing = false;
        let j = i + 1;
        while (j < json.length && /\s/.test(json[j])) {
          j++;
        }
        if (j < json.length) {
          const nextChar = json[j];
          if (nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':') {
            isClosing = true;
          }
        } else {
          isClosing = true;
        }
        
        if (isClosing) {
          inString = false;
          result += char;
        } else {
          result += '\\"';
        }
      }
      continue;
    }
    
    result += char;
  }
  
  return result;
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status;
    const isTransient = status === 503 || status === 429 || !status || status >= 500;
    
    if (retries > 0 && isTransient) {
      console.warn(`Transient error encountered (status: ${status}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
