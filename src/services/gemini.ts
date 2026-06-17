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

Your task is to extract, structure, and analyze the document contents. Return a single JSON object that perfectly conforms to the schema below. Identify named financial figures, calculate margins if they can be derived from stated figures, analyze management tone, capture forward guidance, and ground the output in exact document language wherever possible.

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
  "forwardGuidance": {
    "revenueGuidance": "Revenue outlook or guidance language, or null",
    "marginGuidance": "Margin outlook or guidance language, or null",
    "capexGuidance": "Capex / investment outlook or guidance language, or null",
    "managementOutlook": "Short paragraph summarizing how management framed the next period, or null",
    "confidenceLevel": "high" | "medium" | "low" | null,
    "keyGuidanceQuotes": ["Exact guidance quote 1", "Exact guidance quote 2"]
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
      "severity": "high" | "medium" | "low",
      "supportingQuotes": ["Exact supporting sentence 1", "Exact supporting sentence 2"]
    }
  ],
  "sourceEvidence": {
    "financialEvidence": [
      {
        "metric": "revenue" | "ebitda" | "netIncome" | "operatingCashFlow" | "capex" | "totalDebt" | "cashAndEquivalents" | "grossMargin" | "operatingMargin" | "ebitdaMargin" | "netMargin" | "eps",
        "quote": "Exact sentence supporting the metric",
        "value": "Original value as stated in the document, or null"
      }
    ],
    "riskEvidence": ["Exact risk quote 1", "Exact risk quote 2"],
    "memoEvidence": ["Exact sentence useful for a grounded investment memo"]
  }
}

Strict requirements:
1. Do not invent any numbers. If a financial figure is not mentioned, use null.
2. Do not fabricate quotes or evidence. If exact support is unavailable, use an empty array or null.
3. If the document is a transcript, focus on guidance figures, tone, forward outlook, and Q&A insights.
4. Keep the output clean. Return raw JSON only.`;

    parts.push({ text: prompt });

    const result = await callWithRetry(() => model.generateContent(parts));
    const textResponse = result.response.text();

    if (!textResponse.trim()) {
      throw new Error("Gemini returned an empty analysis response.");
    }

    try {
      return cleanAndParseJSON(textResponse);
    } catch (error) {
      throw new Error(
        `Gemini returned an unreadable analysis payload for ${period} ${docType}. ${(error as Error).message}`
      );
    }
  }

  // Compares two periods for risks and tone
  async comparePeriods(doc1: any, doc2: any): Promise<any> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a Senior Financial Analyst comparing two financial disclosure periods for the same company:
Prior Period: ${doc1.period} (${doc1.documentType})
Current Period: ${doc2.period} (${doc2.documentType})

Compare the risk factors and management tone between these two periods. Identify which risks in the Current Period are brand new (did not exist or weren't disclosed in the Prior Period), which ones have escalated in severity, and which ones are unchanged or resolved.
Also compare the management commentary tone, noting any significant sentiment/confidence shifts (e.g. from highly confident to cautious).

Prior Period Data:
- Risks: ${JSON.stringify(doc1.riskFactors)}
- Tone Summary: ${JSON.stringify(doc1.toneAnalysis)}

Current Period Data:
- Risks: ${JSON.stringify(doc2.riskFactors)}
- Tone Summary: ${JSON.stringify(doc2.toneAnalysis)}

Output a single JSON object conforming to the schema below:
{
  "toneComparison": {
    "sentimentShift": number, // current sentiment minus prior sentiment
    "confidenceShift": number, // current confidence minus prior confidence
    "comparisonText": "Paragraph detailing how the tone, sentiment, and management vocabulary shifted between the periods. Be specific.",
    "toneChangeFlag": "cautious_shift" | "confident_shift" | "stable" | "hedged_shift"
  },
  "riskComparison": [
    {
      "risk": "Brief description of the risk",
      "category": "market" | "operational" | "financial" | "regulatory" | "strategic" | "other",
      "priorSeverity": "high" | "medium" | "low" | "none", // 'none' if brand new
      "currentSeverity": "high" | "medium" | "low",
      "status": "new" | "escalated" | "unchanged" | "de-escalated",
      "notes": "Brief explanation of why it is flagged as such (e.g. 'New regulatory compliance risk added due to European regulations' or 'Escalated from medium to high severity due to interest rate spikes')"
    }
  ]
}

Return ONLY the valid JSON object.`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const textResponse = result.response.text();
    return cleanAndParseJSON(textResponse);
  }

  // Generates an investment memo
  async generateInvestmentMemo(documents: any[], targetCompany: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a Senior Investment Analyst at a top-tier hedge fund.
Create a highly professional, structured Investment Memo for ${targetCompany || "the target company"}.
You must ground the entire memo in the extracted financial figures, forward guidance, risk factors, and source evidence provided. Do not make up any numbers. Cite specific revenues, margins, cash flows, risk factors, and management quotes from the supplied data. If the evidence is weak or incomplete, say so explicitly instead of inventing support.

Documents / Data Available:
${JSON.stringify(documents)}

Format your response in clean Markdown with the following exact structure:
# Investment Memo: [Company Name]
**Date**: [Current Date]
**Analyst**: AI Financial Analyst

## 1. Company Overview
Provide a concise overview of the business, its current operating position, and your overall investment stance (Bullish, Bearish, or Neutral).

## 2. Financial Summary
Summarize the financial health of the company. Address:
- Revenue growth and margin profiles (gross, operating, EBITDA margins).
- Cash flow dynamics (operating cash flow vs Capex, free cash flow conversion).
- Debt levels, liquidity (cash), and capital allocation strategy.
- Forward guidance, management outlook, and whether tone/evidence support confidence in the next period.
Include a small markdown table of the key metrics across the available periods.

## 3. Bull Case
Formulate 2-3 strong arguments for why this company is an attractive investment. Ground this in the company's positive financial metrics, expansion plans, margins, forward guidance, or confident management tone.

## 4. Bear Case
Formulate 2-3 strong arguments against investing in this company. Ground this in high debt, deteriorating margins, heavy capital expenditures, cautious/hedged management commentary, weak guidance, or market risks.

## 5. Key Risks to Monitor
Categorize and highlight the most critical risks (regulatory, operational, financial) that could derail the investment thesis. Reference the provided risk evidence or supporting quotes where useful.

## 6. Questions to Investigate
Formulate 4-5 tough questions that a buy-side analyst would ask the management team on the next earnings call or in a private meeting, based on discrepancies in the numbers, risk disclosures, or hedging language.

Make sure the tone is professional, critical, and objective.`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    return result.response.text();
  }
}

function cleanAndParseJSON(text: string): any {
  let cleanText = text.trim();

  if (!cleanText) {
    throw new Error("Gemini returned an empty JSON payload.");
  }
  
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
      const preview = cleanText.slice(0, 240).replace(/\s+/g, " ");
      throw new Error(
        `Gemini returned malformed JSON. Initial parse error: ${(e as Error).message}. Response preview: ${preview}`
      );
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
