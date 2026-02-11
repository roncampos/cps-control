"use client";

import { useEffect, useState } from "react";
import { getRocks } from "@/lib/api-client";
import Link from "next/link";

interface Rock {
  id: string;
  title: string;
  owner: string;
  status: "on_track" | "off_track" | "at_risk" | "complete" | "dropped";
  progress: number;
  quarter: string;
  successCriteria?: Array<{ description: string; complete: boolean }>;
  blockers?: string | null;
  weeklyUpdates?: Array<{ week: string; update: string }>;
}

export default function RocksPage() {
  const [rocks, setRocks] = useState<Rock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState("2026-Q1");

  useEffect(() => {
    async function loadRocks() {
      try {
        setLoading(true);
        const data = await getRocks(quarter);
        setRocks(Array.isArray(data) ? data : data.rocks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load rocks");
      } finally {
        setLoading(false);
      }
    }

    loadRocks();
  }, [quarter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="rocks" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rocks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="rocks" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading rocks</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const onTrack = rocks.filter((r) => r.status === "on_track").length;
  const offTrack = rocks.filter((r) => r.status === "off_track").length;
  const atRisk = rocks.filter((r) => r.status === "at_risk").length;
  const complete = rocks.filter((r) => r.status === "complete").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="rocks" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quarterly Rocks</h1>
              <p className="text-sm text-gray-500 mt-1">
                3-7 most important priorities for {quarter}
              </p>
            </div>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="2026-Q1">Q1 2026</option>
              <option value="2025-Q4">Q4 2025</option>
              <option value="2025-Q3">Q3 2025</option>
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Rocks" value={rocks.length} color="text-blue-600" />
            <StatCard label="On Track" value={onTrack} color="text-green-600" />
            <StatCard label="At Risk" value={atRisk} color="text-yellow-600" />
            <StatCard label="Off Track" value={offTrack} color="text-red-600" />
            <StatCard label="Complete" value={complete} color="text-gray-600" />
          </div>
        </div>

        {/* Rocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rocks.map((rock) => (
            <RockCard key={rock.id} rock={rock} />
          ))}
        </div>

        {rocks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No rocks found for {quarter}</p>
          </div>
        )}
      </div>
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function RockCard({ rock }: { rock: Rock }) {
  const statusConfig = {
    on_track: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      label: "ON TRACK",
    },
    off_track: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      label: "OFF TRACK",
    },
    at_risk: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      label: "AT RISK",
    },
    complete: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      label: "COMPLETE",
    },
    dropped: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      label: "DROPPED",
    },
  };

  const config = statusConfig[rock.status];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-base flex-1 mr-4">
          {rock.title}
        </h3>
        <span
          className={`px-3 py-1 text-xs font-medium rounded border ${config.bg} ${config.text} ${config.border} whitespace-nowrap`}
        >
          {config.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{rock.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              rock.progress >= 100
                ? "bg-blue-600"
                : rock.status === "on_track"
                ? "bg-green-600"
                : rock.status === "at_risk"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(rock.progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Owner */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-gray-500">Owner:</span>
        <span className="font-medium text-gray-900">{rock.owner}</span>
      </div>

      {/* Success Criteria */}
      {rock.successCriteria && rock.successCriteria.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Success Criteria
          </p>
          <div className="space-y-2">
            {rock.successCriteria.map((criterion, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={criterion.complete}
                  disabled
                  className="mt-0.5 flex-shrink-0"
                />
                <span
                  className={
                    criterion.complete
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                  }
                >
                  {criterion.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {rock.blockers && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-red-600 mb-1">⚠️ BLOCKER</p>
          <p className="text-sm text-gray-700">{rock.blockers}</p>
        </div>
      )}

      {/* Latest Update */}
      {rock.weeklyUpdates && rock.weeklyUpdates.length > 0 && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
            Latest Update ({rock.weeklyUpdates[0].week})
          </p>
          <p className="text-sm text-gray-700">{rock.weeklyUpdates[0].update}</p>
        </div>
      )}
    </div>
  );
}
