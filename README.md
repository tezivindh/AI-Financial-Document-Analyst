# AI Financial Document Analyst

An intelligent financial document analysis platform that leverages Google Gemini AI to extract, compare, and explain financial statements — the way a professional analyst would, in seconds.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google)

---

## Features

### Document Ingestion & Processing
- Upload **PDF** or **TXT** financial filings (10-K, 10-Q, earnings transcripts)
- Automatic extraction of structured financial metrics via Gemini AI
- Supports FormData-based file upload with server-side processing

### Financial Metric Extraction
- **Revenue**, **EBITDA**, **Net Income**, **EPS**, **Cash Flow** extraction
- Gross, Operating, EBITDA, and Net **Margin** calculations
- Year-over-Year (YoY) and Quarter-over-Quarter (QoQ) growth computation
- Automated financial data normalization to USD millions

### NLP Intelligence & Tone Analysis
- **Sentiment Scoring** (-1.0 bearish to +1.0 bullish)
- **Confidence Rating** with directness vs. hedging measurement
- **Hedging Language Detection** — identifies cautious, protective phrasing
- Key quote extraction with tone classification (confident / cautious / hedged / neutral)

### Risk Factor Analysis
- Automated **risk factor extraction** categorized by type (market, operational, financial, regulatory, strategic)
- **Period-over-Period risk comparison** — detects new, escalated, de-escalated risks
- Severity tracking across disclosure periods

### Competitor Benchmarking
- Side-by-side financial comparison across multiple companies
- Margin profile benchmarking with interactive charts
- Liquidity and capital allocation comparison visualizations

### Investment Memo Generation
- AI-generated structured investment memos with:
  - Executive summary & investment thesis
  - Bull/Bear case arguments grounded in extracted data
  - Key risks to monitor
  - Critical questions for management
- Export as Markdown with copy/download functionality

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **AI Engine** | Google Gemini 2.5 Flash |
| **Icons** | Lucide React |

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # Document ingestion & Gemini extraction
│   │   ├── compare/route.ts    # Period-over-period risk/tone comparison
│   │   ├── health/route.ts     # Health check endpoint
│   │   └── memo/route.ts       # Investment memo generation
│   ├── globals.css             # Design system & animations
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Main dashboard UI (6 tabs)
│   └── presetData.ts           # Type definitions & demo data
├── components/
│   └── FinancialCharts.tsx     # Recharts visualization components
└── services/
    └── gemini.ts               # Gemini AI service layer
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Upload and analyze a financial document |
| `POST` | `/api/compare` | Compare two periods for risk/tone shifts |
| `POST` | `/api/memo` | Generate an investment memo |
| `GET` | `/api/health` | Server health check |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/tezivindh/AI-Financial-Document-Analyst.git
cd AI-Financial-Document-Analyst

# Install dependencies
npm install

# Set up environment variables from the included sample file
cp .env.example .env.local
# Add your Gemini API key to .env.local
```

### Environment Variables

An example file is included at `.env.example`. Copy it to `.env.local` and provide your Gemini key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Demo

1. Click **"Load Test Presets"** to load 4 pre-analyzed financial documents (Tesla 2023/2024, Apple 2024, NVIDIA 2024)
2. Navigate through the tabs to explore:
   - **Financial Metrics** — extracted key figures with YoY comparison
   - **Management Tone** — sentiment scoring and hedging detection
   - **Risk Comparison** — period-over-period risk shift analysis
   - **Benchmarking** — side-by-side competitor comparison
   - **Investment Memo** — AI-generated structured memo

---

## Success Metrics / Test Cases

The built-in presets and app flows are designed to satisfy the assignment criteria directly:

- **Metric extraction from test filings**: Load the presets and inspect Tesla FY 2023 / FY 2024, Apple FY 2024, and NVIDIA FY 2024 in the **Financial Metrics** tab. The app extracts revenue, EBITDA, net income, cash flow, capex, debt, cash, margins, and EPS in structured form.
- **Planted cautious vs. confident tone detection**: Compare Tesla FY 2023 versus Tesla FY 2024 in **Management Tone** and **Risk Comparison**. FY 2023 is intentionally confident, while FY 2024 preserves the planted cautious / hedged FSD and capex language needed for the success test.
- **New year-2 risk flagging**: Use the preset Tesla comparison in **Risk Factor Comparison**. The FY 2024 regulatory / compute-cluster disclosure is flagged as a new year-2 risk with elevated severity.
- **Competitor benchmarking across Tesla, Apple, and NVIDIA**: Load presets and open **Competitor Benchmarking**. The table and charts compare Tesla, Apple, and NVIDIA side by side, including derived metrics such as revenue growth, EBITDA margin, free cash flow, net debt, and capex as a percent of revenue where available.
- **Grounded investment memo with bull and bear cases**: Select Tesla FY 2024 in **Investment Memo**. The generated memo is grounded in extracted figures, forward guidance, and source evidence, and includes company overview, financial summary, bull case, bear case, key risks, and questions to investigate.

---

## Team Contributions

| Member | Role | Key Contributions |
|--------|------|-------------------|
| **tezivindh** | Backend APIs & Integration | Gemini service layer, API route handlers, document ingestion pipeline, project setup |
| **NUll-O7** | Financial Analysis Engine | Financial data models, metric extraction schemas, preset data, data normalization |
| **chinna-328** | NLP Intelligence Layer | Tone analysis, sentiment scoring, hedging detection, risk comparison logic |
| **Aparna-Singha** | Frontend & Visualization | Dashboard UI, Recharts integration, tab navigation, responsive design, memo rendering |
| **TODO: add fifth member** | TBD | Assignment expects a five-student team; replace this placeholder with the final teammate name and contribution summary. |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project is built for educational and demonstration purposes as part of a college curriculum.
