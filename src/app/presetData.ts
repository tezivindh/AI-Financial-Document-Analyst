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

export const PRESET_DOCUMENTS: AnalyzedDocument[] = [
  {
    id: "preset-tesla-2023",
    companyName: "Tesla, Inc.",
    ticker: "TSLA",
    period: "FY 2023",
    documentType: "10-K",
    fileName: "tsla_10k_2023_preset.pdf",
    uploadedAt: "2026-06-14T23:50:00Z",
    financials: {
      revenue: 96773,
      ebitda: 13800,
      netIncome: 14997,
      operatingCashFlow: 13256,
      capex: 8899,
      totalDebt: 9500,
      cashAndEquivalents: 29095,
      grossMargin: 18.2,
      operatingMargin: 9.2,
      ebitdaMargin: 14.3,
      netMargin: 15.5,
      eps: 4.30
    },
    mda: {
      summary: "In 2023, Tesla maintained electric vehicle delivery leadership, driven by high production capacity at Gigafactory Texas and Berlin. The Model Y became the best-selling vehicle globally. However, operating income decreased slightly due to price cuts aimed at driving volume growth and high R&D spend on Cybertruck and AI initiatives.",
      keyHighlights: [
        "Delivered over 1.8 million vehicles, representing 38% YoY growth.",
        "Model Y became the best-selling vehicle of any kind globally.",
        "Commenced Cybertruck commercial deliveries in late Q4.",
        "Expanded energy storage deployments to 14.7 GWh, up 125% YoY."
      ]
    },
    toneAnalysis: {
      sentiment: 0.75,
      confidence: 0.88,
      hedgingScore: 0.18,
      analysisSummary: "Management demonstrated strong confidence in their scaling capability, manufacturing efficiencies, and the upcoming launch of Cybertruck. Language was highly direct, emphasizing execution speed and market leadership.",
      keyQuotes: [
        {
          quote: "Our factories are running at record efficiency, and we expect Cybertruck to set a new standard for engineering and manufacturing capability.",
          context: "Production scaling and operations",
          tone: "confident"
        },
        {
          quote: "We have the liquidity and operational cash flow to fully fund our product roadmap, including Gigafactory expansions and neural network training.",
          context: "Capital expenditure planning",
          tone: "confident"
        },
        {
          quote: "While competitor pricing presents short-term headwinds, our cost structure remains unmatched in the industry.",
          context: "Competitor dynamic",
          tone: "confident"
        }
      ]
    },
    riskFactors: [
      {
        category: "market",
        description: "Intense price competition in the global electric vehicle market, leading to lower average selling prices.",
        severity: "medium"
      },
      {
        category: "operational",
        description: "Manufacturing complexity and bottlenecks in ramping up the Cybertruck production line.",
        severity: "high"
      },
      {
        category: "financial",
        description: "High capital requirements for expanding Gigafactory Shanghai, Berlin, and Texas simultaneously.",
        severity: "medium"
      }
    ]
  },
  {
    id: "preset-tesla-2024",
    companyName: "Tesla, Inc.",
    ticker: "TSLA",
    period: "FY 2024",
    documentType: "10-K",
    fileName: "tsla_10k_2024_preset.pdf",
    uploadedAt: "2026-06-14T23:51:00Z",
    financials: {
      revenue: 102500,
      ebitda: 11200,
      netIncome: 11500,
      operatingCashFlow: 12100,
      capex: 9500,
      totalDebt: 11000,
      cashAndEquivalents: 31500,
      grossMargin: 16.5,
      operatingMargin: 7.8,
      ebitdaMargin: 10.9,
      netMargin: 11.2,
      eps: 3.32
    },
    mda: {
      summary: "For 2024, Tesla's revenue growth slowed to 5.9% YoY. Earnings and margins experienced contraction due to continued vehicle price adjustments, rising labor costs, and a pivot towards AI cluster build-outs. Free cash flow decreased due to heavy capex on Dojo and NVIDIA H100 clusters.",
      keyHighlights: [
        "Total automotive revenues rose slightly, offset by falling average selling prices.",
        "Operating margin compressed to 7.8% as vehicle pricing strategies squeezed margins.",
        "Capital expenditures rose to $9.5B, driven by Dojo supercomputer hardware.",
        "Energy generation and storage business became a meaningful driver of profit growth."
      ]
    },
    toneAnalysis: {
      sentiment: 0.15,
      confidence: 0.42,
      hedgingScore: 0.68,
      analysisSummary: "Planted Cautious Passage Test: Management tone is noticeably cautious and heavily hedged compared to FY2023. They speak of volume growth slowing down dramatically, regulatory hurdles for autonomous driving, and supply constraints on computing power.",
      keyQuotes: [
        {
          quote: "Our vehicle volume growth rate may be notably lower in 2024 as our teams work on the launch of the next-generation vehicle, which is subject to substantial execution risks.",
          context: "Future delivery volume guidance",
          tone: "cautious"
        },
        {
          quote: "The deployment of our Full Self-Driving technology is contingent on regulatory permissions which are unpredictable and outside of our control.",
          context: "FSD technology deployment",
          tone: "hedged"
        },
        {
          quote: "We must warn that capital expenditures are rising rapidly to procure AI hardware, but compute bottlenecks could delay our autonomous vehicle timelines.",
          context: "AI capital expenditures and computing power",
          tone: "cautious"
        }
      ]
    },
    riskFactors: [
      {
        category: "market",
        description: "Price compression and inventory build-up from low-cost global EV manufacturers, particularly in Asian markets.",
        severity: "high"
      },
      {
        category: "operational",
        description: "Manufacturing complexity and bottlenecks in ramping up the Cybertruck production line.",
        severity: "medium"
      },
      {
        category: "financial",
        description: "High capital requirements for expanding Gigafactory Shanghai, Berlin, and Texas simultaneously.",
        severity: "low"
      },
      {
        category: "regulatory",
        description: "Full Self-Driving (FSD) AI regulatory investigations, safety compliance testing, and hardware liability risk, alongside specialized GPU compute cluster supply chain delays.",
        severity: "high"
      }
    ]
  },
];
