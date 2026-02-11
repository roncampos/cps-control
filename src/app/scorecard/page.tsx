"use client";

import { useEffect, useState } from "react";
import { getScorecardMetrics } from "@/lib/api-client";
import Link from "next/link";

interface Metric {
  metric: string;
  department: string;
  owner: string;
  target: number;
  actual: number | null;
  trend: string;
  notes: string | null;
  w1?: number | null;
  w2?: number | null;
  w3?: number | null;
  w4?: number | null;
  w5?: number | null;
}

interface ScorecardData {
  metrics: Metric[];
  thresholds: {
    green: string;
    yellow: string;
    red: string;
  };
}

export default function ScorecardPage() {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScorecard() {
      try {
        setLoading(true);
        const result = await getScorecardMetrics();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scorecard");
      } finally {
        setLoading(false);
      }
    }

    loadScorecard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="scorecard" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scorecard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="scorecard" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading scorecard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group metrics by department
  const grouped = data.metrics.reduce((acc, metric) => {
    if (!acc[metric.department]) acc[metric.department] = [];
    acc[metric.department].push(metric);
    return acc;
  }, {} as Record<string, Metric[]>);

  const departments = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="scorecard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Weekly Scorecard
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            5-15 measurables that predict success | Updated weekly
          </p>

          {/* Thresholds Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-700 uppercase mb-2">
              Performance Thresholds
            </p>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">{data.thresholds.green}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">{data.thresholds.yellow}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700">{data.thresholds.red}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics by Department */}
        <div className="space-y-6">
          {departments.map((dept) => (
            <div key={dept} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Department Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 uppercase text-sm">
                  {dept}
                </h2>
              </div>

              {/* Metrics Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Metric
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Target
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        W1
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        W2
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        W3
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        W4
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        W5
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grouped[dept].map((metric, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {metric.metric}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {metric.owner}
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                          {metric.target}
                        </td>
                        <WeekCell value={metric.w1} target={metric.target} />
                        <WeekCell value={metric.w2} target={metric.target} />
                        <WeekCell value={metric.w3} target={metric.target} />
                        <WeekCell value={metric.w4} target={metric.target} />
                        <WeekCell value={metric.w5} target={metric.target} />
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg">{metric.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {data.metrics.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No scorecard metrics configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WeekCell({ value, target }: { value: number | null | undefined; target: number }) {
  if (value === null || value === undefined) {
    return (
      <td className="px-6 py-4 text-center">
        <span className="text-gray-400 text-sm">-</span>
      </td>
    );
  }

  const percentage = (value / target) * 100;
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";

  if (percentage >= 90) {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (percentage >= 70) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
  } else {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
  }

  return (
    <td className="px-6 py-4 text-center">
      <span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${bgColor} ${textColor}`}>
        {value}
      </span>
    </td>
  );
}

function Header({ currentPage }: { currentPage: string }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CPS Control</h1>
            <p className="text-xs text-gray-500">Campos Property Solutions</p>
          </div>
          <nav className="flex gap-3">
            <NavLink href="/" label="Dashboard" active={currentPage === "dashboard"} />
            <NavLink href="/rocks" label="Rocks" active={currentPage === "rocks"} />
            <NavLink href="/scorecard" label="Scorecard" active={currentPage === "scorecard"} />
            <NavLink href="/issues" label="Issues" active={currentPage === "issues"} />
            <NavLink href="/finance" label="Finance" active={currentPage === "finance"} />
          </nav>
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
