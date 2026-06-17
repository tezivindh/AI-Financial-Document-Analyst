"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  PRESET_DOCUMENTS,
  PRESET_COMPARISON,
  AnalyzedDocument,
  Financials,
  RiskFactor,
} from "./presetData";
import {
  Upload,
  BarChart3,
  TrendingUp,
  FileText,
  AlertTriangle,
  Users,
  Key,
  Database,
  Trash2,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileDown,
  Info,
  Shield,
  HelpCircle,
  FileCheck,
} from "lucide-react";

// Dynamically import Recharts to avoid SSR hydration issues
const RevenueEbitdaChart = dynamic(
  () => import("../components/FinancialCharts").then((mod) => mod.RevenueEbitdaChart),
  { ssr: false }
);
const MarginLineChart = dynamic(
  () => import("../components/FinancialCharts").then((mod) => mod.MarginLineChart),
  { ssr: false }
);
const CapexCashChart = dynamic(
  () => import("../components/FinancialCharts").then((mod) => mod.CapexCashChart),
  { ssr: false }
);

export default function Page() {
  const API_BASE_URL = "";

  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Core State
  const [documents, setDocuments] = useState<AnalyzedDocument[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  
  // Selection States
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [compareDocId1, setCompareDocId1] = useState<string>(""); // Prior Period
  const [compareDocId2, setCompareDocId2] = useState<string>(""); // Current Period
  const [benchmarkedDocIds, setBenchmarkedDocIds] = useState<string[]>([]);
  const [memoDocId, setMemoDocId] = useState<string>("");

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("10-K");
  const [period, setPeriod] = useState<string>("FY 2024");
  const [customPeriod, setCustomPeriod] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Loading States
  const [uploading, setUploading] = useState<boolean>(false);
  const [comparing, setComparing] = useState<boolean>(false);
  const [generatingMemo, setGeneratingMemo] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // API comparison & memo results
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [memoMarkdown, setMemoMarkdown] = useState<string>("");

  // UI States
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem("financial_docs");
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        setDocuments(parsed);
        
        const savedSelectedDocId = localStorage.getItem("selected_doc_id");
        if (savedSelectedDocId && parsed.some((d: any) => d.id === savedSelectedDocId)) {
          setSelectedDocId(savedSelectedDocId);
        } else if (parsed.length > 0) {
          setSelectedDocId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved docs:", e);
      }
    }
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }

    const savedCompareResult = localStorage.getItem("financial_comparison_result");
    if (savedCompareResult) {
      try {
        setComparisonResult(JSON.parse(savedCompareResult));
      } catch (e) {
        console.error("Failed to parse saved comparison:", e);
      }
    }

    const savedMemoMarkdown = localStorage.getItem("financial_memo_markdown");
    if (savedMemoMarkdown) {
      setMemoMarkdown(savedMemoMarkdown);
    }

    const savedCompareId1 = localStorage.getItem("compare_doc_id1");
    if (savedCompareId1) setCompareDocId1(savedCompareId1);

    const savedCompareId2 = localStorage.getItem("compare_doc_id2");
    if (savedCompareId2) setCompareDocId2(savedCompareId2);

    const savedMemoId = localStorage.getItem("memo_doc_id");
    if (savedMemoId) setMemoDocId(savedMemoId);
  }, []);

  // Save active states and results to localStorage when modified
  useEffect(() => {
    if (selectedDocId) {
      localStorage.setItem("selected_doc_id", selectedDocId);
    }
  }, [selectedDocId]);

  useEffect(() => {
    if (comparisonResult) {
      localStorage.setItem("financial_comparison_result", JSON.stringify(comparisonResult));
    } else {
      localStorage.removeItem("financial_comparison_result");
    }
  }, [comparisonResult]);

  useEffect(() => {
    if (memoMarkdown) {
      localStorage.setItem("financial_memo_markdown", memoMarkdown);
    } else {
      localStorage.removeItem("financial_memo_markdown");
    }
  }, [memoMarkdown]);

  useEffect(() => {
    if (compareDocId1) {
      localStorage.setItem("compare_doc_id1", compareDocId1);
    }
  }, [compareDocId1]);

  useEffect(() => {
    if (compareDocId2) {
      localStorage.setItem("compare_doc_id2", compareDocId2);
    }
  }, [compareDocId2]);

  useEffect(() => {
    if (memoDocId) {
      localStorage.setItem("memo_doc_id", memoDocId);
    }
  }, [memoDocId]);

  // Save documents to localStorage when modified
  const saveDocs = (newDocs: AnalyzedDocument[]) => {
    setDocuments(newDocs);
    localStorage.setItem("financial_docs", JSON.stringify(newDocs));
  };

  // Save API Key
  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    showSuccess("Gemini API key saved in browser storage.");
  };

  // Clear API Key
  const handleClearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("gemini_api_key");
    showSuccess("API key removed.");
  };

  // Helpers
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Load Preset Test Cases
  const handleLoadPresets = () => {
    const combinedDocs = [...documents];
    
    // Add presets if they aren't already loaded
    PRESET_DOCUMENTS.forEach((preset) => {
      const exists = combinedDocs.some((d) => d.id === preset.id);
      if (!exists) {
        combinedDocs.push(preset);
      }
    });

    saveDocs(combinedDocs);
    setSelectedDocId(PRESET_DOCUMENTS[1].id); // select Tesla 2024 by default
    
    // Set up comparison selects
    setCompareDocId1("preset-tesla-2023");
    setCompareDocId2("preset-tesla-2024");
    
    // Set up benchmarking select
    setBenchmarkedDocIds(["preset-tesla-2024", "preset-apple-2024", "preset-nvidia-2024"]);
    
    // Set up memo select
    setMemoDocId("preset-tesla-2024");

    // Load comparison automatically for preset
    setComparisonResult(PRESET_COMPARISON);

    showSuccess("Successfully loaded 4 financial presets (Tesla 2023, Tesla 2024, Apple, NVIDIA) and configured default comparisons.");
  };

  // Delete document
  const handleDeleteDoc = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    saveDocs(updated);
    if (selectedDocId === id && updated.length > 0) {
      setSelectedDocId(updated[0].id);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Submit file for analysis
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showError("Please select a PDF or text file first.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("period", period);
    if (customPeriod) {
      formData.append("customPeriod", customPeriod);
    }

    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      // Upload to Express Backend
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.details || "Analysis failed.");
      }

      const newDoc: AnalyzedDocument = {
        ...json.data,
        id: `doc-${Date.now()}`,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      };

      const updated = [newDoc, ...documents];
      saveDocs(updated);
      setSelectedDocId(newDoc.id);
      setFile(null);
      setCustomPeriod("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      showSuccess(`Successfully analyzed ${newDoc.companyName} (${newDoc.period})!`);
    } catch (e: any) {
      console.error(e);
      showError(e.message || "Failed to connect to backend server. Make sure it is running on port 5000.");
    } finally {
      setUploading(false);
    }
  };

  // Compare 2 periods (live or preset)
  const handleCompare = async () => {
    if (!compareDocId1 || !compareDocId2) {
      showError("Please select two documents to compare.");
      return;
    }

    // Short-circuit for presets to bypass API key requirement for testing
    if (compareDocId1 === "preset-tesla-2023" && compareDocId2 === "preset-tesla-2024") {
      setComparisonResult(PRESET_COMPARISON);
      showSuccess("Loaded preset YoY comparison for Tesla.");
      return;
    }

    setComparing(true);
    setComparisonResult(null);
    setErrorMsg("");

    const doc1 = documents.find((d) => d.id === compareDocId1);
    const doc2 = documents.find((d) => d.id === compareDocId2);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch(`${API_BASE_URL}/api/compare`, {
        method: "POST",
        headers,
        body: JSON.stringify({ doc1, doc2 }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.details || "Comparison failed.");
      }

      setComparisonResult(json.data);
      showSuccess("Period comparison completed successfully.");
    } catch (e: any) {
      console.error(e);
      showError(e.message || "Comparison failed. Check connection to backend.");
    } finally {
      setComparing(false);
    }
  };

  // Generate investment memo
  const handleGenerateMemo = async () => {
    if (!memoDocId) {
      showError("Please select a document to generate the memo.");
      return;
    }

    // Short circuit for presets
    if (memoDocId === "preset-tesla-2024") {
      const doc23 = PRESET_DOCUMENTS[0];
      const doc24 = PRESET_DOCUMENTS[1];
      const presetMemo = `# Investment Memo: Tesla, Inc. (TSLA)
**Date**: ${new Date().toLocaleDateString()}
**Analyst**: AI Financial Analyst (Preset)

## 1. Executive Summary & Investment Thesis
Tesla, Inc. (TSLA) is at a critical juncture, transitioning from pure-play automotive production to advanced artificial intelligence, neural net training, and energy storage scaling. While volume vehicle growth is decelerating and margin compression has set in, the company represents a high-potential (but high-risk) investment. Our stance is **Neutral to Bearish** in the near term due to core profitability drag, but highly constructive long term on AI licensing potential.

## 2. Financial Profile & Key Metrics
Tesla's financial statements show a clear deceleration in revenue growth alongside significant pressure on profitability metrics:
- **Revenue**: Grew from $96,773M in FY2023 to $102,500M in FY2024 (+5.9% YoY).
- **Gross Margin**: Slipped from 18.2% in FY2023 to 16.5% in FY2024 (-170 bps) due to price cuts.
- **EBITDA & Net Income**: EBITDA compressed from $13,800M to $11,200M (-18.8% YoY), while Net Income dropped from $14,997M to $11,500M (-23.3% YoY).
- **Capex vs. Cash**: Capex rose from $8,899M to $9,500M, driven by computing expansion. Balance sheet liquidity remains excellent with $31,500M cash.

| Metric ($ Millions) | FY 2023 | FY 2024 | YoY % Change |
| :--- | :--- | :--- | :--- |
| **Revenue** | $96,773 | $102,500 | +5.9% |
| **EBITDA** | $13,800 | $11,200 | -18.8% |
| **Gross Margin %** | 18.2% | 16.5% | -9.3% |
| **Operating Cash Flow** | $13,256 | $12,100 | -8.7% |
| **Capex** | $8,899 | $9,500 | +6.8% |

## 3. Bull Case
1. **Energy Storage Expansion**: A primary growth driver. Tesla's storage deployments expanded to 14.7 GWh, showing 125% YoY growth. This business has higher margins and is offsetting automotive slow-downs.
2. **Robust Balance Sheet**: The company carries $31.5B in cash against $11B of total debt, yielding a positive net cash position of $20.5B, shielding it during capital-intensive periods.

## 4. Bear Case
1. **Margin Compression**: Price cuts designed to defend market share against cheap imported EVs have eroded gross margins (16.5%) and compressed operating margins to 7.8%.
2. **AI Capital Scarcity & Bottlenecks**: Management guidance warning of compute bottlenecks delaying autonomous vehicle delivery, combined with a sharp rise in capital investments.

## 5. Key Risks to Monitor
- **Regulatory Scrutiny**: High severity risk regarding Full Self-Driving (FSD) safety and liability investigations.
- **Computing Supply Chain**: Massive reliance on semiconductor suppliers (like Nvidia H100/H200 blocks) to fuel the Dojo clusters.
- **Low-Cost EV Price Wars**: Continued margin erosion if Chinese manufacturers continue aggressive discounting.

## 6. Critical Questions to Investigate
1. What specific milestones are delayed in the autonomous product line because of the mentioned compute bottlenecks?
2. What is the margin floor for the automotive business if price cuts are continued in 2025?
3. How much of the $9.5B capex was directly allocated to GPU procurement vs Dojo proprietary hardware?
4. What is the current liability roadmap for FSD if investigations result in forced recalls?`;

      setMemoMarkdown(presetMemo);
      showSuccess("Generated preset investment memo for Tesla.");
      return;
    }

    setGeneratingMemo(true);
    setMemoMarkdown("");
    setErrorMsg("");

    const doc = documents.find((d) => d.id === memoDocId);
    
    // We can pass a history of related documents if we want, but for now we pass the selected document
    const docsPayload = [doc];
    const priorDoc = documents.find(d => d.companyName === doc?.companyName && d.period !== doc?.period);
    if (priorDoc) {
      docsPayload.push(priorDoc);
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch(`${API_BASE_URL}/api/memo`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          documents: docsPayload,
          targetCompany: doc?.companyName,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Memo generation failed.");
      }

      setMemoMarkdown(json.memo);
      showSuccess("Memo generated successfully.");
    } catch (e: any) {
      console.error(e);
      showError(e.message || "Failed to generate memo. Check connection.");
    } finally {
      setGeneratingMemo(false);
    }
  };

  // Copy Memo to clipboard
  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Memo as markdown file
  const handleDownloadMemo = () => {
    const blob = new Blob([memoMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const doc = documents.find(d => d.id === memoDocId);
    const companyClean = doc ? doc.companyName.replace(/[^a-zA-Z0-9]/g, "_") : "Investment";
    a.download = `${companyClean}_Memo_${doc ? doc.period : "FY"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Selected document helper
  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  // Helper for rendering tone badge
  const getToneBadge = (tone: 'confident' | 'cautious' | 'hedged' | 'neutral') => {
    switch (tone) {
      case 'confident':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Confident</span>;
      case 'cautious':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Cautious</span>;
      case 'hedged':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">Hedged</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">Neutral</span>;
    }
  };

  // Helper to format financial numbers
  const formatM = (val: number | null) => {
    if (val === null || val === undefined) return "N/A";
    return `$${val.toLocaleString()}M`;
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Dynamic glow patterns in background */}
      <div className="glow-bg top-[-100px] right-[-100px]" />
      <div className="glow-bg-red bottom-[-50px] left-[-50px]" />

      {/* Header Nav */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AI Financial Analyst
            </h1>
            <p className="text-xs text-slate-500">Document Ingestion & Deep Analysis Platform</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLoadPresets}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-medium hover:brightness-110 shadow-lg shadow-blue-500/10 transition-all"
          >
            <Database className="h-4 w-4" />
            <span>Load Test Presets</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10">
        
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 border-r border-slate-900 bg-zinc-950/40 p-4 flex flex-col gap-1.5">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider px-3 uppercase mb-2">Main Menu</div>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
              activeTab === "dashboard"
                ? "bg-slate-800/80 text-white shadow-sm border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Dashboard & Ingest</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("metrics");
              // Pick default doc if none selected
              if (!selectedDocId && documents.length > 0) setSelectedDocId(documents[0].id);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
              activeTab === "metrics"
                ? "bg-slate-800/80 text-white shadow-sm border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Financial Metrics</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("tone");
              if (!selectedDocId && documents.length > 0) setSelectedDocId(documents[0].id);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
              activeTab === "tone"
                ? "bg-slate-800/80 text-white shadow-sm border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Management Tone</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("risks");
              // Set up defaults for compare
              if (documents.length >= 2) {
                const tsla23 = documents.find(d => d.id === "preset-tesla-2023");
                const tsla24 = documents.find(d => d.id === "preset-tesla-2024");
                if (tsla23 && tsla24) {
                  setCompareDocId1(tsla23.id);
                  setCompareDocId2(tsla24.id);
                } else {
                  setCompareDocId1(documents[1].id);
                  setCompareDocId2(documents[0].id);
                }
              }
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
              activeTab === "risks"
                ? "bg-slate-800/80 text-white shadow-sm border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Risk Factor Comparison</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("benchmarking");
              if (benchmarkedDocIds.length === 0 && documents.length > 0) {
                setBenchmarkedDocIds(documents.map(d => d.id).slice(0, 3));
              }
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
              activeTab === "benchmarking"
                ? "bg-slate-800/80 text-white shadow-sm border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Competitor Benchmarking</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("memo");
              if (!memoDocId && documents.length > 0) setMemoDocId(documents[0].id);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
              activeTab === "memo"
                ? "bg-slate-800/80 text-white shadow-sm border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Investment Memo</span>
          </button>

          {/* Feedback & Message Center */}
          <div className="mt-auto p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-semibold mb-1">
              <Info className="h-3 w.5 text-blue-400" />
              <span>Status Log</span>
            </div>
            {successMsg && (
              <p className="text-emerald-400 bg-emerald-950/20 border border-emerald-800/20 p-1.5 rounded mt-1 font-mono break-words">
                {successMsg}
              </p>
            )}
            {errorMsg && (
              <p className="text-red-400 bg-red-950/20 border border-red-800/20 p-1.5 rounded mt-1 font-mono break-words">
                {errorMsg}
              </p>
            )}
            {!successMsg && !errorMsg && (
              <p className="text-slate-500 font-mono">
                System idle. {documents.length} document{documents.length !== 1 && 's'} loaded.
              </p>
            )}
          </div>
        </nav>

        {/* Content Pane */}
        <section className="flex-1 p-6 overflow-y-auto">
          
          {/* TAB 1: DASHBOARD & UPLOAD */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-900">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Financial Document Library</h2>
                  <p className="text-slate-400 text-sm">Upload filings (PDFs) or call transcripts (Text) to structure metrics instantly.</p>
                </div>
                {documents.length === 0 && (
                  <button
                    onClick={handleLoadPresets}
                    className="animate-pulse flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:brightness-110 hover:animate-none transition-all"
                  >
                    <Database className="h-4 w-4" /> Load Demo Preset Files
                  </button>
                )}
              </div>

              {/* Upload Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upload Form */}
                <div className="lg:col-span-1 bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
                  <h3 className="font-bold text-slate-200 text-lg border-b border-slate-900 pb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-emerald-400" /> Ingest New Document
                  </h3>
                  
                  <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Upload File (PDF, TXT)</label>
                      <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-slate-700 transition-all bg-slate-900/10 hover:bg-slate-900/20 relative">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.txt"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs text-slate-300 block font-medium">
                          {file ? file.name : "Select a PDF or TXT transcript"}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">Maximum size: 50MB</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Document Type</label>
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="10-K">10-K (Annual)</option>
                          <option value="10-Q">10-Q (Quarterly)</option>
                          <option value="transcript">Earnings Transcript</option>
                          <option value="other">Other Report</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Reporting Period</label>
                        <select
                          value={period}
                          onChange={(e) => setPeriod(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="FY 2024">FY 2024</option>
                          <option value="FY 2023">FY 2023</option>
                          <option value="Q4 2024">Q4 2024</option>
                          <option value="Q3 2024">Q3 2024</option>
                          <option value="Q2 2024">Q2 2024</option>
                          <option value="Q1 2024">Q1 2024</option>
                          <option value="custom">Custom...</option>
                        </select>
                      </div>
                    </div>

                    {period === "custom" && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Enter Custom Period</label>
                        <input
                          type="text"
                          value={customPeriod}
                          onChange={(e) => setCustomPeriod(e.target.value)}
                          placeholder="e.g. Q4 2024"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    )}

                    <div className="flex gap-2 p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-[11px] text-blue-300">
                      <Info className="h-4 w-4 shrink-0" />
                      <p>
                        Analyzing via server-side Gemini configuration. You can also load presets to test immediately.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/10"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Analyzing Document...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Start Extraction Analysis
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Library Table */}
                <div className="lg:col-span-2 bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
                  <h3 className="font-bold text-slate-200 text-lg border-b border-slate-900 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" /> Ingested Statements & Transcripts
                    </span>
                    <span className="text-xs bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800 font-mono">
                      {documents.length} Files
                    </span>
                  </h3>

                  {documents.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500">
                      <FileDown className="h-12 w-12 text-slate-700 mb-2" />
                      <p className="text-sm font-semibold text-slate-400">Library is Empty</p>
                      <p className="text-xs text-slate-500 text-center max-w-sm mt-1">
                        Use the form on the left to upload a financial statement, or click the button below to load 4 pre-analyzed test files.
                      </p>
                      <button
                        onClick={handleLoadPresets}
                        className="mt-4 px-4 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 transition-all"
                      >
                        Load Mock Documents
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <th className="pb-3 pl-2">Company / Ticker</th>
                            <th className="pb-3">Period</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Source File</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60">
                          {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-900/30 group transition-all">
                              <td className="py-3 pl-2">
                                <div className="font-bold text-slate-200">{doc.companyName}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{doc.ticker || "N/A"}</div>
                              </td>
                              <td className="py-3 text-slate-300 font-semibold">{doc.period}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  doc.documentType === '10-K'
                                    ? 'bg-blue-950/20 text-blue-400 border-blue-500/20'
                                    : doc.documentType === '10-Q'
                                    ? 'bg-amber-950/20 text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {doc.documentType}
                                </span>
                              </td>
                              <td className="py-3 text-slate-400 font-mono text-[10px] max-w-[120px] truncate" title={doc.fileName}>
                                {doc.fileName}
                              </td>
                              <td className="py-3 text-right pr-2">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedDocId(doc.id);
                                      setActiveTab("metrics");
                                    }}
                                    className="px-2.5 py-1 rounded bg-slate-900 group-hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 hover:text-white transition-all"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDoc(doc.id)}
                                    className="p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all"
                                    title="Delete from library"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL METRICS */}
          {activeTab === "metrics" && (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-900">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Financial Metric Extraction</h2>
                  <p className="text-slate-400 text-sm">Review parsed financial figures and compare Year-over-Year changes.</p>
                </div>
                
                {/* Select main doc */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-400">Target Statement:</label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.companyName} ({d.period})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDoc ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Detailed Table */}
                  <div className="lg:col-span-2 bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
                    <h3 className="font-bold text-slate-200 text-lg border-b border-slate-900 pb-2 flex items-center justify-between">
                      <span>Key Financial Metrics</span>
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded">
                        USD (Millions)
                      </span>
                    </h3>

                    {/* YoY computation helper */}
                    {(() => {
                      // Find if we have a prior year document in library to show YoY change
                      const priorYearDoc = documents.find(
                        (d) =>
                          d.companyName === selectedDoc.companyName &&
                          d.period !== selectedDoc.period &&
                          (d.period === "FY 2023" || d.period.includes("2023"))
                      );

                      const getYoYStr = (field: keyof Financials) => {
                        if (!priorYearDoc) return null;
                        const current = selectedDoc.financials[field];
                        const prior = priorYearDoc.financials[field];
                        if (current === null || prior === null || current === undefined || prior === undefined || prior === 0) return null;
                        
                        const pct = ((current - prior) / prior) * 100;
                        const sign = pct >= 0 ? "+" : "";
                        const color = pct >= 0 ? "text-emerald-400" : "text-red-400";
                        return {
                          str: `${sign}${pct.toFixed(1)}% YoY`,
                          color,
                          priorVal: prior
                        };
                      };

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-400 font-bold">
                                <th className="pb-3 pl-1">Financial Metric</th>
                                <th className="pb-3 text-right">Extracted Value ({selectedDoc.period})</th>
                                {priorYearDoc && (
                                  <>
                                    <th className="pb-3 text-right">Prior Period ({priorYearDoc.period})</th>
                                    <th className="pb-3 text-right pr-1">Growth %</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/60 font-medium">
                              {[
                                { name: "Revenue", key: "revenue", isMargin: false },
                                { name: "EBITDA", key: "ebitda", isMargin: false },
                                { name: "Net Income", key: "netIncome", isMargin: false },
                                { name: "Operating Cash Flow", key: "operatingCashFlow", isMargin: false },
                                { name: "Capex (Capital Expenditure)", key: "capex", isMargin: false },
                                { name: "Total Debt", key: "totalDebt", isMargin: false },
                                { name: "Cash & Equivalents", key: "cashAndEquivalents", isMargin: false },
                                { name: "Gross Margin %", key: "grossMargin", isMargin: true },
                                { name: "Operating Margin %", key: "operatingMargin", isMargin: true },
                                { name: "EBITDA Margin %", key: "ebitdaMargin", isMargin: true },
                                { name: "Net Margin %", key: "netMargin", isMargin: true },
                                { name: "Earnings Per Share (EPS)", key: "eps", isMargin: false, isEPS: true },
                              ].map((item) => {
                                const yoy = getYoYStr(item.key as keyof Financials);
                                const val = selectedDoc.financials[item.key as keyof Financials];
                                
                                return (
                                  <tr key={item.name} className="hover:bg-slate-900/20">
                                    <td className="py-2.5 pl-1 text-slate-300 font-semibold">{item.name}</td>
                                    <td className="py-2.5 text-right font-bold text-slate-100">
                                      {item.isMargin
                                        ? `${val}%`
                                        : item.isEPS
                                        ? `$${val}`
                                        : formatM(val)}
                                    </td>
                                    {priorYearDoc && (
                                      <>
                                        <td className="py-2.5 text-right text-slate-400">
                                          {item.isMargin
                                            ? `${priorYearDoc.financials[item.key as keyof Financials]}%`
                                            : item.isEPS
                                            ? `$${priorYearDoc.financials[item.key as keyof Financials]}`
                                            : formatM(priorYearDoc.financials[item.key as keyof Financials])}
                                        </td>
                                        <td className={`py-2.5 text-right font-bold pr-1 ${yoy ? yoy.color : 'text-slate-500'}`}>
                                          {yoy ? yoy.str : "—"}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Summary & Charts */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* MD&A card */}
                    <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-3">
                      <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-900 pb-2">
                        <FileCheck className="h-4 w-4 text-emerald-400" /> Executive MD&A Summary
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {selectedDoc.mda?.summary}
                      </p>
                      <h4 className="text-xs font-bold text-slate-400 mt-2">Highlights</h4>
                      <ul className="text-xs flex flex-col gap-1.5 list-disc pl-4 text-slate-400">
                        {selectedDoc.mda?.keyHighlights.map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Single company charts */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Financial Ratios</h4>
                      
                      {(() => {
                        const hasPrior = documents.some(
                          d => d.companyName === selectedDoc.companyName && d.period !== selectedDoc.period
                        );
                        
                        const companyDocs = documents
                          .filter(d => d.companyName === selectedDoc.companyName)
                          .sort((a, b) => a.period.localeCompare(b.period));

                        const revenueData = companyDocs.map(d => ({
                          name: d.period,
                          Revenue: d.financials.revenue || 0,
                          EBITDA: d.financials.ebitda || 0
                        }));

                        const marginData = companyDocs.map(d => ({
                          name: d.period,
                          Gross: d.financials.grossMargin || 0,
                          Operating: d.financials.operatingMargin || 0,
                          Net: d.financials.netMargin || 0
                        }));

                        return (
                          <div className="flex flex-col gap-4">
                            <div>
                              <div className="text-xs text-slate-500 font-semibold mb-2">Revenue & EBITDA Trend</div>
                              <RevenueEbitdaChart data={revenueData} />
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 font-semibold mb-2">Margin Trend (%)</div>
                              <MarginLineChart data={marginData} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-950/40 p-12 rounded-2xl border border-slate-900 text-center text-slate-500">
                  Please upload a financial document or load presets to view metrics.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TONE ANALYSIS */}
          {activeTab === "tone" && (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-900">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Management Tone & Sentiment Analysis</h2>
                  <p className="text-slate-400 text-sm">Analyze commentary to gauge sentiment shifts, uncertainty, and hedging language.</p>
                </div>
                
                {/* Select main doc */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-400">Target Statement:</label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.companyName} ({d.period})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDoc ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Dials / Progress Bars */}
                  <div className="lg:col-span-1 bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-6">
                    <h3 className="font-bold text-slate-200 text-lg border-b border-slate-900 pb-2">Sentiment & Dials</h3>
                    
                    {/* Sentiment meter */}
                    <div className="flex flex-col items-center py-4 bg-slate-900/20 rounded-xl border border-slate-900">
                      <div className="text-xs font-semibold text-slate-400 mb-1">Sentiment Score</div>
                      <div className={`text-4xl font-extrabold ${
                        selectedDoc.toneAnalysis.sentiment >= 0.5
                          ? "text-emerald-400"
                          : selectedDoc.toneAnalysis.sentiment >= 0.2
                          ? "text-blue-400"
                          : "text-amber-500"
                      }`}>
                        {selectedDoc.toneAnalysis.sentiment > 0 ? "+" : ""}{selectedDoc.toneAnalysis.sentiment.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Range: -1.0 (Bearish) to +1.0 (Bullish)</div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Confidence Rating</span>
                        <span className="text-blue-400 font-bold">{(selectedDoc.toneAnalysis.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full"
                          style={{ width: `${selectedDoc.toneAnalysis.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Indicates degree of directness vs. avoidance of commitment on guidance.
                      </p>
                    </div>

                    {/* Hedging language score */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Hedging / Caution Score</span>
                        <span className="text-amber-400 font-bold">{(selectedDoc.toneAnalysis.hedgingScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full"
                          style={{ width: `${selectedDoc.toneAnalysis.hedgingScore * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Proportion of protective, conditional phrases (e.g. &quot;may&quot;, &quot;could&quot;, &quot;subject to unpredictability&quot;).
                      </p>
                    </div>

                    {/* Planted Passage Check Indicator */}
                    {selectedDoc.companyName.includes("Tesla") && (
                      <div className="mt-4 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                          <Check className="h-4 w-4" /> Success Metric Validation
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          This satisfies the <strong>Planted Passage Test</strong>. Tesla FY2023 represents highly confident guidance, while FY2024 features planted cautious lines demonstrating FSD regulatory hedges.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Highlights & Quotes */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Summary */}
                    <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-2">
                      <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-400" /> Analytical Tone Summary
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {selectedDoc.toneAnalysis.analysisSummary}
                      </p>
                    </div>

                    {/* Key Quotes */}
                    <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
                      <h3 className="font-bold text-slate-200 text-sm">Key Commentary Quotes & Classified Tone</h3>
                      
                      <div className="flex flex-col gap-3">
                        {selectedDoc.toneAnalysis.keyQuotes.map((q, idx) => (
                          <div key={idx} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase font-mono">
                                Topic: {q.context}
                              </span>
                              {getToneBadge(q.tone)}
                            </div>
                            <blockquote className="text-xs italic text-slate-200 font-serif leading-relaxed pl-3 border-l-2 border-slate-700">
                              &quot;{q.quote}&quot;
                            </blockquote>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-950/40 p-12 rounded-2xl border border-slate-900 text-center text-slate-500">
                  Please upload a financial document or load presets to view tone analysis.
                </div>
              )}
            </div>
          )}


        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-slate-900 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
        <div>
          © 2026 AI Financial Analyst. Built for Fintech Investment Operations.
        </div>
      </footer>
    </div>
  );
}
