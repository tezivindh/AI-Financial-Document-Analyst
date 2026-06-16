export interface Financials {
  revenue: number | null;
  ebitda: number | null;
  netIncome: number | null;
  operatingCashFlow: number | null;
  capex: number | null;
  totalDebt: number | null;
  cashAndEquivalents: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  ebitdaMargin: number | null;
  netMargin: number | null;
  eps: number | null;
}

export interface Quote {
  quote: string;
  context: string;
  tone: 'confident' | 'cautious' | 'hedged' | 'neutral';
}

export interface ToneAnalysis {
  sentiment: number;
  confidence: number;
  hedgingScore: number;
  analysisSummary: string;
  keyQuotes: Quote[];
}

export interface RiskFactor {
  category: 'market' | 'operational' | 'financial' | 'regulatory' | 'strategic' | 'other';
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalyzedDocument {
  id: string;
  companyName: string;
  ticker: string | null;
  period: string;
  documentType: '10-K' | '10-Q' | 'transcript' | 'other';
  fileName: string;
  uploadedAt: string;
  financials: Financials;
  mda: {
    summary: string;
    keyHighlights: string[];
  };
  toneAnalysis: ToneAnalysis;
  riskFactors: RiskFactor[];
}

export const PRESET_DOCUMENTS: AnalyzedDocument[] = [];
