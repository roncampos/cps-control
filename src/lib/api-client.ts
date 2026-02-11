/**
 * API Client for cps-documentation HTTP API
 * 
 * Current: Mock data (Phase 18A in progress)
 * Target: http://localhost:8000/api/*
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cps-documentation.onrender.com/api";

// Toggle between mock and real API
const USE_MOCK = false; // ✅ Phase 18A complete - using real API!

// ==========================================
// QUICKBOOKS API
// ==========================================

export async function getCashPosition() {
  if (USE_MOCK) {
    return {
      totalCash: 45250.00,
      bankAccounts: [
        { name: "Business Checking", balance: 32500.00 },
        { name: "Savings", balance: 12750.00 },
      ],
      asOf: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/quickbooks/cash-position`);
  if (!res.ok) throw new Error("Failed to fetch cash position");
  return res.json();
}

export async function getRunRate(months: number = 3) {
  if (USE_MOCK) {
    return {
      monthlyRevenue: 18500.00,
      monthlyExpenses: 12200.00,
      netBurnRate: 6300.00,
      runway: 7.2, // months
      periodAnalyzed: months,
    };
  }

  const res = await fetch(`${API_BASE_URL}/quickbooks/run-rate?months=${months}`);
  if (!res.ok) throw new Error("Failed to fetch run rate");
  return res.json();
}

export async function getHiringAnalysis(salary: number) {
  if (USE_MOCK) {
    return {
      affordable: salary <= 50000,
      impactOnRunway: salary <= 50000 ? "Reduces runway to ~5 months" : "Not affordable",
      recommendation: salary <= 50000 
        ? "Affordable with current runway" 
        : "Would exceed budget - consider lower salary or wait for revenue increase",
      newMonthlyExpenses: 12200 + (salary / 12),
      newRunway: salary <= 50000 ? 5.1 : 3.2,
    };
  }

  const res = await fetch(`${API_BASE_URL}/quickbooks/hiring-analysis?salary=${salary}`);
  if (!res.ok) throw new Error("Failed to fetch hiring analysis");
  return res.json();
}

export async function getPropertyRankings() {
  if (USE_MOCK) {
    return {
      properties: [
        {
          address: "123 Main St",
          profitMargin: 28.5,
          totalProfit: 12500,
          rank: 1,
        },
        {
          address: "456 Oak Ave",
          profitMargin: 22.3,
          totalProfit: 9800,
          rank: 2,
        },
        {
          address: "789 Pine Rd",
          profitMargin: 18.7,
          totalProfit: 7200,
          rank: 3,
        },
      ],
    };
  }

  const res = await fetch(`${API_BASE_URL}/quickbooks/property-rankings`);
  if (!res.ok) throw new Error("Failed to fetch property rankings");
  return res.json();
}

export async function getQuickBooksHealth() {
  if (USE_MOCK) {
    return {
      authenticated: true,
      tokenValid: true,
      lastSync: new Date().toISOString(),
      status: "healthy",
    };
  }

  const res = await fetch(`${API_BASE_URL}/quickbooks/health`);
  if (!res.ok) throw new Error("Failed to fetch QB health");
  return res.json();
}

// ==========================================
// RAG SEARCH API
// ==========================================

export async function searchDocumentation(query: string, limit: number = 5) {
  if (USE_MOCK) {
    return {
      results: [
        {
          content: "Sample search result for: " + query,
          score: 0.87,
          source: "company/vision.md",
          accessTier: "universal",
          headerPath: "Vision / Core Values",
        },
      ],
      sources: ["company/vision.md"],
      query,
      count: 1,
    };
  }

  const res = await fetch(`${API_BASE_URL}/rag/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to search documentation");
  return res.json();
}

// ==========================================
// NOTION API (Phase 18B - LIVE!)
// ==========================================

export async function getRocks(quarter: string = "2026-Q1") {
  if (USE_MOCK) {
    return [
      {
        id: "1",
        title: "New Marketing Flow Implementation",
        owner: "Ron",
        status: "on_track" as const,
        progress: 60,
        quarter,
      },
      {
        id: "2",
        title: "JC Integrator Transition",
        owner: "Ron",
        status: "on_track" as const,
        progress: 45,
        quarter,
      },
      {
        id: "3",
        title: "Social Media Consistency",
        owner: "Ron",
        status: "off_track" as const,
        progress: 20,
        quarter,
      },
    ];
  }

  const res = await fetch(`${API_BASE_URL}/notion/rocks?quarter=${quarter}`);
  if (!res.ok) throw new Error("Failed to fetch rocks");
  return res.json();
}

export async function updateRockProgress(id: string, progress: number, notes: string) {
  // Write endpoint not yet built - Phase 18C
  console.log("TODO: Update rock", id, "to", progress, "%", notes);
  return { success: false, message: "Write endpoints coming in Phase 18C" };
}

export async function getScorecardMetrics(week?: string) {
  if (USE_MOCK) {
    return {
      metrics: [
        {
          metric: "Contracts Signed",
          department: "acquisitions",
          owner: "Joey",
          target: 2,
          actual: null,
          trend: "→",
          notes: null,
        },
        {
          metric: "Offers Made",
          department: "acquisitions",
          owner: "Joey",
          target: 15,
          actual: null,
          trend: "→",
          notes: null,
        },
      ],
      thresholds: {
        green: ">= 90% of target",
        yellow: "70-89% of target",
        red: "< 70% of target",
      },
    };
  }

  const url = week 
    ? `${API_BASE_URL}/notion/scorecard?week=${week}`
    : `${API_BASE_URL}/notion/scorecard`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch scorecard");
  return res.json();
}

export async function updateScorecardActual(metric: string, week: string, actual: number) {
  // Write endpoint not yet built - Phase 18C
  console.log("TODO: Update scorecard", metric, "for", week, "to", actual);
  return { success: false, message: "Write endpoints coming in Phase 18C" };
}

export async function getIssues(status: "open" | "solved" = "open") {
  if (USE_MOCK) {
    return [
      {
        id: "1",
        title: "Marketing flow bottleneck",
        priority: "critical",
        category: "process",
        raisedBy: "Ron",
        date: "2026-02-10",
        context: "New flow taking too long to implement",
        impact: "Delays Q1 rock",
        nextStep: "Break into smaller chunks",
        status: "open",
      },
    ];
  }

  const res = await fetch(`${API_BASE_URL}/notion/issues?status=${status}`);
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function getGoals() {
  if (USE_MOCK) {
    return [
      {
        goal: "Reach $50K MRR",
        category: "financial",
        target: "50000",
        deadline: "2026-12-31",
        progress: 37,
      },
    ];
  }

  const res = await fetch(`${API_BASE_URL}/notion/goals`);
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
}
