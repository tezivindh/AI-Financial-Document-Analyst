import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "../../../services/gemini";

export async function POST(req: NextRequest) {
  try {
    const { doc1, doc2 } = await req.json();
    if (!doc1 || !doc2) {
      return NextResponse.json({ error: "Two document datasets (doc1 and doc2) are required for comparison." }, { status: 400 });
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
    const result = await service.comparePeriods(doc1, doc2);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Error during period comparison:", err);
    return NextResponse.json({
      error: "Comparison failed.",
      details: err.message || err,
    }, { status: 500 });
  }
}
