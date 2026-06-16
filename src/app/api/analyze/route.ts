import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "../../../services/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    // Resolve API Key
    let apiKey = req.headers.get("x-api-key") || req.headers.get("x-gemini-key");
    if (!apiKey || apiKey.trim() === "") {
      apiKey = process.env.GEMINI_API_KEY || "";
    }
    
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({
        error: "Google Gemini API Key is missing.",
        details: "Please provide a key in the 'x-api-key' header or set the GEMINI_API_KEY environment variable on the server.",
      }, { status: 401 });
    }

    const documentType = (formData.get("documentType") as string) || "10-K";
    const periodVal = formData.get("period") as string;
    const customPeriod = formData.get("customPeriod") as string;
    const period = periodVal === "custom" ? customPeriod : (periodVal || "FY 2024");

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;

    const service = new GeminiService(apiKey);
    const result = await service.analyzeDocument(buffer, mimeType, period, documentType);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Error during document analysis:", err);
    return NextResponse.json({
      error: "Document analysis failed.",
      details: err.message || err,
    }, { status: 500 });
  }
}
