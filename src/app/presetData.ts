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

export type FinancialMetricKey = keyof Financials;

export interface Quote {
  quote: string;
  context: string;
  tone: "confident" | "cautious" | "hedged" | "neutral";
}

export interface ToneAnalysis {
  sentiment: number;
  confidence: number;
  hedgingScore: number;
  analysisSummary: string;
  keyQuotes: Quote[];
}

export interface ForwardGuidance {
  revenueGuidance: string | null;
  marginGuidance: string | null;
  capexGuidance: string | null;
  managementOutlook: string | null;
  confidenceLevel: "high" | "medium" | "low" | null;
  keyGuidanceQuotes: string[];
}

export interface MetricEvidence {
  metric: FinancialMetricKey;
  quote: string;
  value: string | null;
}

export interface SourceEvidence {
  financialEvidence: MetricEvidence[];
  riskEvidence: string[];
  memoEvidence: string[];
}

export interface RiskFactor {
  category: "market" | "operational" | "financial" | "regulatory" | "strategic" | "other";
  description: string;
  severity: "high" | "medium" | "low";
  supportingQuotes?: string[];
}

export interface AnalyzedDocument {
  id: string;
  companyName: string;
  ticker: string | null;
  period: string;
  documentType: "10-K" | "10-Q" | "transcript" | "other";
  fileName: string;
  uploadedAt: string;
  financials: Financials;
  mda: {
    summary: string;
    keyHighlights: string[];
  };
  forwardGuidance: ForwardGuidance;
  toneAnalysis: ToneAnalysis;
  riskFactors: RiskFactor[];
  sourceEvidence: SourceEvidence;
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
      eps: 4.3,
    },
    mda: {
      summary:
        "In 2023, Tesla maintained electric vehicle delivery leadership, driven by high production capacity at Gigafactory Texas and Berlin. The Model Y became the best-selling vehicle globally. However, operating income decreased slightly due to price cuts aimed at driving volume growth and high R&D spend on Cybertruck and AI initiatives.",
      keyHighlights: [
        "Delivered over 1.8 million vehicles, representing 38% YoY growth.",
        "Model Y became the best-selling vehicle of any kind globally.",
        "Commenced Cybertruck commercial deliveries in late Q4.",
        "Expanded energy storage deployments to 14.7 GWh, up 125% YoY.",
      ],
    },
    forwardGuidance: {
      revenueGuidance:
        "Management indicated 2024 growth would continue, but at a more measured pace as the company balanced affordability actions with mix and new program ramps.",
      marginGuidance:
        "Automotive margins were expected to remain under near-term pressure while manufacturing efficiency, product mix, and software monetization were scaled.",
      capexGuidance:
        "Capital spending was expected to stay elevated to fund Gigafactory expansion, compute infrastructure, and new vehicle platform investments.",
      managementOutlook:
        "Management framed the next period as execution-heavy but achievable, emphasizing strong liquidity, factory efficiency, and confidence in the broader product roadmap.",
      confidenceLevel: "high",
      keyGuidanceQuotes: [
        "Our factories are running at record efficiency, and we expect Cybertruck to set a new standard for engineering and manufacturing capability.",
        "We have the liquidity and operational cash flow to fully fund our product roadmap, including Gigafactory expansions and neural network training.",
      ],
    },
    toneAnalysis: {
      sentiment: 0.75,
      confidence: 0.88,
      hedgingScore: 0.18,
      analysisSummary:
        "Management demonstrated strong confidence in their scaling capability, manufacturing efficiencies, and the upcoming launch of Cybertruck. Language was highly direct, emphasizing execution speed and market leadership.",
      keyQuotes: [
        {
          quote:
            "Our factories are running at record efficiency, and we expect Cybertruck to set a new standard for engineering and manufacturing capability.",
          context: "Production scaling and operations",
          tone: "confident",
        },
        {
          quote:
            "We have the liquidity and operational cash flow to fully fund our product roadmap, including Gigafactory expansions and neural network training.",
          context: "Capital expenditure planning",
          tone: "confident",
        },
        {
          quote:
            "While competitor pricing presents short-term headwinds, our cost structure remains unmatched in the industry.",
          context: "Competitor dynamic",
          tone: "confident",
        },
      ],
    },
    riskFactors: [
      {
        category: "market",
        description:
          "Intense price competition in the global electric vehicle market, leading to lower average selling prices.",
        severity: "medium",
        supportingQuotes: [
          "While competitor pricing presents short-term headwinds, our cost structure remains unmatched in the industry.",
        ],
      },
      {
        category: "operational",
        description: "Manufacturing complexity and bottlenecks in ramping up the Cybertruck production line.",
        severity: "high",
        supportingQuotes: [
          "We expect Cybertruck to set a new standard for engineering and manufacturing capability.",
        ],
      },
      {
        category: "financial",
        description: "High capital requirements for expanding Gigafactory Shanghai, Berlin, and Texas simultaneously.",
        severity: "medium",
        supportingQuotes: [
          "We have the liquidity and operational cash flow to fully fund our product roadmap, including Gigafactory expansions and neural network training.",
        ],
      },
    ],
    sourceEvidence: {
      financialEvidence: [
        {
          metric: "revenue",
          quote:
            "Total revenues increased to roughly $96.8 billion as higher vehicle deliveries and energy storage deployments more than offset pricing pressure.",
          value: "$96.8B",
        },
        {
          metric: "operatingCashFlow",
          quote:
            "We continue to generate strong operating cash flow while investing heavily in manufacturing scale and AI infrastructure.",
          value: "$13.3B",
        },
        {
          metric: "capex",
          quote:
            "Capital expenditures remained elevated as we expanded Gigafactory capacity and funded new programs including Cybertruck and AI compute.",
          value: "$8.9B",
        },
      ],
      riskEvidence: [
        "While competitor pricing presents short-term headwinds, our cost structure remains unmatched in the industry.",
        "We have the liquidity and operational cash flow to fully fund our product roadmap, including Gigafactory expansions and neural network training.",
      ],
      memoEvidence: [
        "Delivered over 1.8 million vehicles, representing 38% YoY growth.",
        "Expanded energy storage deployments to 14.7 GWh, up 125% YoY.",
      ],
    },
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
      eps: 3.32,
    },
    mda: {
      summary:
        "For 2024, Tesla's revenue growth slowed to 5.9% YoY. Earnings and margins experienced contraction due to continued vehicle price adjustments, rising labor costs, and a pivot towards AI cluster build-outs. Free cash flow decreased due to heavy capex on Dojo and NVIDIA H100 clusters.",
      keyHighlights: [
        "Total automotive revenues rose slightly, offset by falling average selling prices.",
        "Operating margin compressed to 7.8% as vehicle pricing strategies squeezed margins.",
        "Capital expenditures rose to $9.5B, driven by Dojo supercomputer hardware.",
        "Energy generation and storage business became a meaningful driver of profit growth.",
      ],
    },
    forwardGuidance: {
      revenueGuidance:
        "Vehicle volume growth was framed as potentially much lower in the next period while the next-generation platform and AI programs absorb management bandwidth.",
      marginGuidance:
        "Management signaled that margin recovery depends on product mix, execution on manufacturing ramps, and the timing of autonomy-related revenue.",
      capexGuidance:
        "Capex was expected to remain elevated because of AI hardware procurement, compute clusters, and ongoing factory investment needs.",
      managementOutlook:
        "Management's outlook turned materially more cautious, emphasizing regulatory uncertainty around FSD, compute bottlenecks, and execution risk around new platforms.",
      confidenceLevel: "low",
      keyGuidanceQuotes: [
        "Our vehicle volume growth rate may be notably lower in 2024 as our teams work on the launch of the next-generation vehicle, which is subject to substantial execution risks.",
        "We must warn that capital expenditures are rising rapidly to procure AI hardware, but compute bottlenecks could delay our autonomous vehicle timelines.",
      ],
    },
    toneAnalysis: {
      sentiment: 0.15,
      confidence: 0.42,
      hedgingScore: 0.68,
      analysisSummary:
        "Planted Cautious Passage Test: Management tone is noticeably cautious and heavily hedged compared to FY2023. They speak of volume growth slowing down dramatically, regulatory hurdles for autonomous driving, and supply constraints on computing power.",
      keyQuotes: [
        {
          quote:
            "Our vehicle volume growth rate may be notably lower in 2024 as our teams work on the launch of the next-generation vehicle, which is subject to substantial execution risks.",
          context: "Future delivery volume guidance",
          tone: "cautious",
        },
        {
          quote:
            "The deployment of our Full Self-Driving technology is contingent on regulatory permissions which are unpredictable and outside of our control.",
          context: "FSD technology deployment",
          tone: "hedged",
        },
        {
          quote:
            "We must warn that capital expenditures are rising rapidly to procure AI hardware, but compute bottlenecks could delay our autonomous vehicle timelines.",
          context: "AI capital expenditures and computing power",
          tone: "cautious",
        },
      ],
    },
    riskFactors: [
      {
        category: "market",
        description:
          "Price compression and inventory build-up from low-cost global EV manufacturers, particularly in Asian markets.",
        severity: "high",
        supportingQuotes: [
          "Total automotive revenues rose slightly, offset by falling average selling prices.",
        ],
      },
      {
        category: "operational",
        description: "Manufacturing complexity and bottlenecks in ramping up the Cybertruck production line.",
        severity: "medium",
        supportingQuotes: [
          "Our vehicle volume growth rate may be notably lower in 2024 as our teams work on the launch of the next-generation vehicle, which is subject to substantial execution risks.",
        ],
      },
      {
        category: "financial",
        description: "High capital requirements for expanding Gigafactory Shanghai, Berlin, and Texas simultaneously.",
        severity: "low",
        supportingQuotes: [
          "Capital expenditures rose to $9.5B, driven by Dojo supercomputer hardware.",
        ],
      },
      {
        category: "regulatory",
        description:
          "Full Self-Driving (FSD) AI regulatory investigations, safety compliance testing, and hardware liability risk, alongside specialized GPU compute cluster supply chain delays.",
        severity: "high",
        supportingQuotes: [
          "The deployment of our Full Self-Driving technology is contingent on regulatory permissions which are unpredictable and outside of our control.",
          "We must warn that capital expenditures are rising rapidly to procure AI hardware, but compute bottlenecks could delay our autonomous vehicle timelines.",
        ],
      },
    ],
    sourceEvidence: {
      financialEvidence: [
        {
          metric: "revenue",
          quote:
            "Revenue growth slowed to 5.9% YoY as modest top-line gains were offset by lower average selling prices.",
          value: "$102.5B",
        },
        {
          metric: "operatingCashFlow",
          quote:
            "Operating cash flow remained positive but declined as price actions and AI build-outs weighed on cash conversion.",
          value: "$12.1B",
        },
        {
          metric: "capex",
          quote:
            "Capital expenditures rose to $9.5B, driven by Dojo supercomputer hardware.",
          value: "$9.5B",
        },
      ],
      riskEvidence: [
        "The deployment of our Full Self-Driving technology is contingent on regulatory permissions which are unpredictable and outside of our control.",
        "We must warn that capital expenditures are rising rapidly to procure AI hardware, but compute bottlenecks could delay our autonomous vehicle timelines.",
      ],
      memoEvidence: [
        "Operating margin compressed to 7.8% as vehicle pricing strategies squeezed margins.",
        "Energy generation and storage business became a meaningful driver of profit growth.",
      ],
    },
  },
  {
    id: "preset-apple-2024",
    companyName: "Apple Inc.",
    ticker: "AAPL",
    period: "FY 2024",
    documentType: "10-K",
    fileName: "aapl_10k_2024_preset.pdf",
    uploadedAt: "2026-06-14T23:52:00Z",
    financials: {
      revenue: 391035,
      ebitda: 124500,
      netIncome: 93736,
      operatingCashFlow: 110000,
      capex: 10500,
      totalDebt: 106000,
      cashAndEquivalents: 60000,
      grossMargin: 46.2,
      operatingMargin: 30.5,
      ebitdaMargin: 31.8,
      netMargin: 24.0,
      eps: 6.16,
    },
    mda: {
      summary:
        "Apple delivered robust performance in FY2024, supported by record Services revenue (App Store, iCloud, Music) and steady iPhone sales. Management highlights expansion of Apple Intelligence features. Operating cash flows remained exceptionally strong, supporting aggressive capital returns.",
      keyHighlights: [
        "Services revenue reached an all-time high, representing 25% of total sales.",
        "Launched Apple Intelligence, embedding generative AI across Apple platforms.",
        "Returned over $90B to shareholders through share repurchases and dividends.",
      ],
    },
    forwardGuidance: {
      revenueGuidance:
        "Management pointed to continued company-wide growth led by Services and a gradual lift from Apple Intelligence features across the installed base.",
      marginGuidance:
        "Gross margin was expected to stay structurally healthy, supported by the Services mix and premium device positioning.",
      capexGuidance:
        "Capex was expected to remain disciplined relative to revenue, focused on silicon, data center, and supply-chain resiliency investments.",
      managementOutlook:
        "Management sounded constructive, leaning on ecosystem stickiness and recurring Services monetization while acknowledging regulatory noise in the background.",
      confidenceLevel: "high",
      keyGuidanceQuotes: [
        "Our active installed base of devices has reached a new record, reflecting unparalleled ecosystem lock-in and customer loyalty.",
        "We continue to see meaningful opportunity to deepen engagement through services and on-device intelligence experiences.",
      ],
    },
    toneAnalysis: {
      sentiment: 0.65,
      confidence: 0.82,
      hedgingScore: 0.25,
      analysisSummary:
        "Management maintains a stable, confident posture, highlighting ecosystem loyalty and recurring Services high-margin revenue. Minor caution expressed over antitrust litigation in the US and Europe.",
      keyQuotes: [
        {
          quote:
            "Our active installed base of devices has reached a new record, reflecting unparalleled ecosystem lock-in and customer loyalty.",
          context: "Ecosystem engagement",
          tone: "confident",
        },
        {
          quote:
            "While antitrust challenges in the EU present compliance adjustments, we are confident in the legal merits of our business practices.",
          context: "Antitrust regulations",
          tone: "cautious",
        },
      ],
    },
    riskFactors: [
      {
        category: "regulatory",
        description:
          "Antitrust litigation and regulatory changes in the EU and US targeting App Store fees and ecosystem lock-in.",
        severity: "high",
        supportingQuotes: [
          "While antitrust challenges in the EU present compliance adjustments, we are confident in the legal merits of our business practices.",
        ],
      },
      {
        category: "market",
        description:
          "Elongated consumer device upgrade cycles and intense competition in the premium smartphone segment.",
        severity: "medium",
        supportingQuotes: [
          "Services revenue reached an all-time high, representing 25% of total sales.",
        ],
      },
      {
        category: "operational",
        description:
          "Highly concentrated supply chain dependencies in APAC regions, presenting geopolitical vulnerabilities.",
        severity: "high",
        supportingQuotes: [
          "Capex was expected to remain disciplined relative to revenue, focused on silicon, data center, and supply-chain resiliency investments.",
        ],
      },
    ],
    sourceEvidence: {
      financialEvidence: [
        {
          metric: "revenue",
          quote:
            "Apple delivered approximately $391.0 billion of revenue with Services again setting an all-time record.",
          value: "$391.0B",
        },
        {
          metric: "operatingCashFlow",
          quote:
            "Operating cash flow remained exceptionally strong, supporting both product investment and capital returns.",
          value: "$110.0B",
        },
        {
          metric: "grossMargin",
          quote:
            "A richer Services mix continued to support structurally high gross margins across the portfolio.",
          value: "46.2%",
        },
      ],
      riskEvidence: [
        "While antitrust challenges in the EU present compliance adjustments, we are confident in the legal merits of our business practices.",
        "Launched Apple Intelligence, embedding generative AI across Apple platforms.",
      ],
      memoEvidence: [
        "Services revenue reached an all-time high, representing 25% of total sales.",
        "Returned over $90B to shareholders through share repurchases and dividends.",
      ],
    },
  },
  {
    id: "preset-nvidia-2024",
    companyName: "NVIDIA Corporation",
    ticker: "NVDA",
    period: "FY 2024",
    documentType: "10-K",
    fileName: "nvda_10k_2024_preset.pdf",
    uploadedAt: "2026-06-14T23:53:00Z",
    financials: {
      revenue: 60922,
      ebitda: 34500,
      netIncome: 29760,
      operatingCashFlow: 28100,
      capex: 1200,
      totalDebt: 11000,
      cashAndEquivalents: 26000,
      grossMargin: 72.7,
      operatingMargin: 54.1,
      ebitdaMargin: 56.6,
      netMargin: 48.8,
      eps: 11.93,
    },
    mda: {
      summary:
        "NVIDIA experienced historic growth in FY2024, driven by the explosive expansion of Generative AI across data centers. Hopper architecture GPUs (H100) saw massive demand. The company transitioned from a hardware component manufacturer to a full-stack data center platform supplier.",
      keyHighlights: [
        "Data Center revenue surged over 200% YoY, representing the core growth engine.",
        "Gross margin expanded to 72.7% due to software integrations and strong pricing power.",
        "Maintained minimal capital expenditures due to fabless manufacturing model.",
      ],
    },
    forwardGuidance: {
      revenueGuidance:
        "Management expected data center momentum to remain exceptionally strong as AI infrastructure build-outs broadened across cloud, enterprise, and sovereign customers.",
      marginGuidance:
        "Margin guidance stayed constructive given pricing power, software attach, and a richer mix of accelerated computing platforms.",
      capexGuidance:
        "Capex was expected to remain modest relative to revenue because of the fabless model, even as operating expenses rise to support roadmap expansion.",
      managementOutlook:
        "Management struck a highly bullish tone, arguing that generative AI demand remains ahead of available supply and that the platform opportunity is still expanding.",
      confidenceLevel: "high",
      keyGuidanceQuotes: [
        "Generative AI has hit the tipping point. Demand is surging worldwide across companies, industries, and nations.",
        "Our supply chain partners are ramping capacity aggressively, but we expect demand to exceed supply for the foreseeable future.",
      ],
    },
    toneAnalysis: {
      sentiment: 0.95,
      confidence: 0.92,
      hedgingScore: 0.12,
      analysisSummary:
        "Management tone is highly bullish, bordering on euphoric. They cite secular demand shifts and technological lead. Minimal hedging, focusing on production supply ramp to meet backlog.",
      keyQuotes: [
        {
          quote:
            "Generative AI has hit the tipping point. Demand is surging worldwide across companies, industries, and nations.",
          context: "Market demand",
          tone: "confident",
        },
        {
          quote:
            "Our supply chain partners are ramping capacity aggressively, but we expect demand to exceed supply for the foreseeable future.",
          context: "Production backlog",
          tone: "confident",
        },
      ],
    },
    riskFactors: [
      {
        category: "operational",
        description:
          "Supply bottlenecks and reliance on TSMC for advanced packaging (CoWoS) and semiconductor fabrication.",
        severity: "high",
        supportingQuotes: [
          "Our supply chain partners are ramping capacity aggressively, but we expect demand to exceed supply for the foreseeable future.",
        ],
      },
      {
        category: "regulatory",
        description:
          "Export controls and trade restrictions imposed by the US government on shipping advanced computing chips to Asian markets.",
        severity: "high",
        supportingQuotes: [
          "Export controls continue to shape where the highest-end accelerated computing products can be shipped.",
        ],
      },
      {
        category: "market",
        description:
          "Hyperscalers (Microsoft, AWS, Google) developing custom in-house AI silicon, creating future customer churn risk.",
        severity: "medium",
        supportingQuotes: [
          "We are competing not only with chip vendors but also with customer internal engineering roadmaps.",
        ],
      },
    ],
    sourceEvidence: {
      financialEvidence: [
        {
          metric: "revenue",
          quote:
            "Revenue reached approximately $60.9 billion as data center demand accelerated dramatically across AI workloads.",
          value: "$60.9B",
        },
        {
          metric: "grossMargin",
          quote:
            "Gross margin expanded to 72.7% due to software integrations and strong pricing power.",
          value: "72.7%",
        },
        {
          metric: "operatingCashFlow",
          quote:
            "Strong profitability translated into exceptionally high operating cash flow even with minimal capital intensity.",
          value: "$28.1B",
        },
      ],
      riskEvidence: [
        "Our supply chain partners are ramping capacity aggressively, but we expect demand to exceed supply for the foreseeable future.",
        "Export controls continue to shape where the highest-end accelerated computing products can be shipped.",
      ],
      memoEvidence: [
        "Data Center revenue surged over 200% YoY, representing the core growth engine.",
        "Maintained minimal capital expenditures due to fabless manufacturing model.",
      ],
    },
  },
];

export const PRESET_COMPARISON = {
  toneComparison: {
    sentimentShift: -0.6,
    confidenceShift: -0.46,
    comparisonText:
      "Between FY 2023 and FY 2024, Tesla's management tone shifted from highly optimistic and expansion-oriented to extremely cautious and conservative. While FY 2023 commentary was filled with claims of efficiency and manufacturing excellence, FY 2024 introduces heavy hedging language, mentioning substantial execution risks, compute bottlenecks, and unpredictable regulatory approvals for their core autonomous vehicle (FSD) strategy. This signals a clear pivot from straightforward scaling to managing active operational constraints.",
    toneChangeFlag: "cautious_shift",
  },
  riskComparison: [
    {
      risk: "Price compression from low-cost competitors",
      category: "market",
      priorSeverity: "medium",
      currentSeverity: "high",
      status: "escalated",
      notes:
        "Escalated from medium to high severity due to aggressive pricing strategies by low-cost Chinese EV brands in key markets.",
    },
    {
      risk: "Manufacturing complexity and bottlenecks for Cybertruck",
      category: "operational",
      priorSeverity: "high",
      currentSeverity: "medium",
      status: "de-escalated",
      notes:
        "De-escalated to medium as the production line stabilized throughout 2024, though volume remains limited.",
    },
    {
      risk: "High capital requirements for Gigafactory expansions",
      category: "financial",
      priorSeverity: "medium",
      currentSeverity: "low",
      status: "de-escalated",
      notes:
        "De-escalated as major construction phases concluded and spending shifted from civil engineering to computational clusters.",
    },
    {
      risk: "Full Self-Driving (FSD) AI regulatory investigations and specialized GPU compute delays",
      category: "regulatory",
      priorSeverity: "none",
      currentSeverity: "high",
      status: "new",
      notes:
        "New Risk Added in Year 2: Planted risk factor highlighting FSD liability, regulatory scrutinies, and computing supply dependencies.",
    },
  ],
};
