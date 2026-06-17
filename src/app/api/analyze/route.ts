import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "../../../services/gemini";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(["application/pdf", "text/plain"]);
const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
};

function resolveMimeType(file: File): string | null {
  if (file.type && SUPPORTED_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }

  return EXTENSION_TO_MIME[extension] || null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        {
          error: "A PDF or TXT file is required.",
          details: "Attach the document in the 'file' field before submitting the analysis request.",
        },
        { status: 400 }
      );
    }

    const file = fileEntry;

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The uploaded file is empty.",
          details: "Please upload a non-empty PDF or TXT filing/transcript.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "The uploaded file exceeds the 50MB limit.",
          details: `Received ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please upload a smaller PDF or TXT document.`,
        },
        { status: 413 }
      );
    }

    const mimeType = resolveMimeType(file);
    if (!mimeType) {
      return NextResponse.json(
        {
          error: "Unsupported file type.",
          details: "Only PDF (.pdf) and plain text (.txt) financial documents are supported.",
        },
        { status: 415 }
      );
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
