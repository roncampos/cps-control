"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCashPosition,
  getRunRate,
  getPropertyRankings,
  getQuickBooksHealth,
} from "@/lib/api-client";

export default function FinancePage() {
  const [cashPosition, setCashPosition] = useState<any>(null);
  const [runRate, setRunRate] = useState<any>(null);
  const [propertyRankings, setPropertyRankings] = useState<any>(null);
  const [qbHealth, setQbHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cash, rate, properties, health] = await Promise.all([
          getCashPosition(),
          getRunRate(),
          getPropertyRankings(),
          getQuickBooksHealth(),
        ]);

        setCashPosition(cash);
        setRunRate(rate);
        setPropertyRankings(properties);
        setQbHealth(health);
      } catch (error) {
        console.error("Failed to load financial data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="finance" qbHealth={qbHealth} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Cash Position */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cash</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${cashPosition?.total_cash?.toLocaleString() ?? "—"}
            </p>
            <div className="mt-4 space-y-2">
              {cashPosition?.accounts?.map((account: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.name}</span>
                  <span className="font-medium text-gray-900">
                    ${account.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              As of {cashPosition?.query_timestamp ? new Date(cashPosition.query_timestamp).toLocaleDateString() : "—"}
            </p>
          </div>

          {/* Run Rate */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Run Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              ${runRate?.monthly_revenue?.toLocaleString() ?? "—"}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium text-green-600">
                  ${runRate?.monthly_revenue?.toLocaleString() ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">
                  ${runRate?.monthly_expenses?.toLocaleString() ?? "—"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Net</span>
                <span className="font-bold text-gray-900">
                  ${runRate?.net_burn_rate?.toLocaleString() ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Runway */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Cash Runway</h3>
            <p className="text-3xl font-bold text-blue-600">
              {runRate?.runway_months ? Number(runRate.runway_months).toFixed(1) : "—"} <span className="text-lg">months</span>
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    (runRate?.runway_months ?? 0) > 6
                      ? "bg-green-500"
                      : (runRate?.runway_months ?? 0) > 3
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(((runRate?.runway_months ?? 0) / 12) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Based on {runRate?.analysis_period_months ?? 3}-month average
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {(runRate?.runway_months ?? 0) > 6
                  ? "✓ Healthy runway"
                  : (runRate?.runway_months ?? 0) > 3
                  ? "⚠ Monitor closely"
                  : "🚨 Critical - need revenue increase"}
              </p>
            </div>
          </div>
        </div>

        {/* Property Rankings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Deals
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propertyRankings?.properties?.map((property: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                        {property.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {property.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      ${property.totalProfit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {property.profitMargin.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Currently using mock data. When Phase 18A is complete,
            toggle <code className="px-1 py-0.5 bg-yellow-100 rounded">USE_MOCK = false</code> in{" "}
            <code className="px-1 py-0.5 bg-yellow-100 rounded">src/lib/api-client.ts</code> to
            use live QuickBooks data.
          </p>
        </div>
      </div>
    </div>
  );
}

function Header({ currentPage, qbHealth }: { currentPage: string; qbHealth?: any }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CPS Control</h1>
            <p className="text-xs text-gray-500">Campos Property Solutions</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-3">
              <NavLink href="/" label="Dashboard" active={currentPage === "dashboard"} />
              <NavLink href="/rocks" label="Rocks" active={currentPage === "rocks"} />
              <NavLink href="/scorecard" label="Scorecard" active={currentPage === "scorecard"} />
              <NavLink href="/issues" label="Issues" active={currentPage === "issues"} />
              <NavLink href="/finance" label="Finance" active={currentPage === "finance"} />
            </nav>
            {qbHealth && (
              <div className="border-l border-gray-200 pl-4">
                {qbHealth.status === "healthy" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ QB Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    ✗ QB Error
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        active
          ? "text-gray-900 bg-gray-100"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
