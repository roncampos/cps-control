"use client";

import { useEffect, useState } from "react";
import { getScorecardMetrics } from "@/lib/api-client";
import Link from "next/link";

interface Metric {
  metric: string;
  owner: string | null;
  status: string; // "On Track", "Off Track"
}

interface Section {
  section: string;
  metrics: Metric[];
}

interface ScorecardData {
  source: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  meeting_url: string;
  sections: Section[];
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

  const totalMetrics = data.sections.reduce((sum, s) => sum + s.metrics.length, 0);
  const onTrackCount = data.sections.reduce(
    (sum, s) => sum + s.metrics.filter(m => m.status === "On Track").length,
    0
  );
  const offTrackCount = data.sections.reduce(
    (sum, s) => sum + s.metrics.filter(m => m.status === "Off Track").length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="scorecard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.meeting_title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(data.meeting_date).toLocaleDateString("en-US", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
            <a
              href={data.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View in Notion →
            </a>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Metrics" value={totalMetrics} color="text-blue-600" />
            <StatCard label="On Track" value={onTrackCount} color="text-green-600" />
            <StatCard label="Off Track" value={offTrackCount} color="text-red-600" />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {data.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-sm">
                  {section.section}
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
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {section.metrics.map((metric, midx) => (
                      <tr key={midx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {metric.metric}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {metric.owner || "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={metric.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isOnTrack = status === "On Track";
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
        isOnTrack
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
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
