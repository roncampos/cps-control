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
// NOTION API (Phase 18B - Not Yet Built)
// ==========================================

export async function getRocks(quarter: string = "2026-Q1") {
  // Mock only for now - Phase 18B will build this
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

export async function updateRockProgress(id: string, progress: number, notes: string) {
  // Mock only - Phase 18B will build this
  console.log("Mock: Updating rock", id, "to", progress, "%", notes);
  return { success: true };
}

export async function getScorecardMetrics(week: string = "2026-W06") {
  // Mock only - Phase 18B will build this
  return [
    {
      metric: "Contracts Signed",
      department: "acquisitions",
      owner: "Joey",
      target: 2,
      actual: null,
      status: "pending" as const,
      week,
    },
    {
      metric: "Offers Made",
      department: "acquisitions",
      owner: "Joey",
      target: 15,
      actual: null,
      status: "pending" as const,
      week,
    },
  ];
}

export async function updateScorecardActual(metric: string, week: string, actual: number) {
  // Mock only - Phase 18B will build this
  console.log("Mock: Updating scorecard", metric, "for", week, "to", actual);
  return { success: true };
}
