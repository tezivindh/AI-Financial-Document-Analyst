import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "../../../services/gemini";

export async function POST(req: NextRequest) {
  try {
    const { documents, targetCompany } = await req.json();
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: "A list of financial documents is required." }, { status: 400 });
    }

    // Resolve API Key
    let apiKey = req.headers.get("x-api-key") || req.headers.get("x-gemini-key");
    if (!apiKey || apiKey.trim() === "") {
      apiKey = process.env.GEMINI_API_KEY || "";
    }
    
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({ error: "Gemini API Key is required." }, { status: 401 });
    }

    const service = new GeminiService(apiKey);
    const memo = await service.generateInvestmentMemo(documents, targetCompany);

    return NextResponse.json({ success: true, memo });
  } catch (err: any) {
    console.error("Error generating memo:", err);
    return NextResponse.json({
      error: "Memo generation failed.",
      details: err.message || err,
    }, { status: 500 });
  }
}
