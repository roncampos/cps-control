"use client";

import { useEffect, useState } from "react";
import { getIssues } from "@/lib/api-client";
import Link from "next/link";

interface Issue {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  raisedBy: string;
  date: string;
  context: string;
  impact: string;
  nextStep: string;
  status: "open" | "solved";
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"open" | "solved">("open");

  useEffect(() => {
    async function loadIssues() {
      try {
        setLoading(true);
        const data = await getIssues(statusFilter);
        setIssues(Array.isArray(data) ? data : data.issues || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load issues");
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="issues" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="issues" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading issues</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group by priority
  const critical = issues.filter((i) => i.priority === "critical");
  const high = issues.filter((i) => i.priority === "high");
  const medium = issues.filter((i) => i.priority === "medium");
  const low = issues.filter((i) => i.priority === "low");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="issues" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issues List (IDS)</h1>
              <p className="text-sm text-gray-500 mt-1">
                Identify, Discuss, Solve — Weekly L10 tracking
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("open")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  statusFilter === "open"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Open ({issues.filter((i) => i.status === "open").length})
              </button>
              <button
                onClick={() => setStatusFilter("solved")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  statusFilter === "solved"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Solved
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          {statusFilter === "open" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Critical" value={critical.length} color="text-red-600" />
              <StatCard label="High" value={high.length} color="text-orange-600" />
              <StatCard label="Medium" value={medium.length} color="text-yellow-600" />
              <StatCard label="Low" value={low.length} color="text-blue-600" />
            </div>
          )}
        </div>

        {/* Issues List */}
        <div className="space-y-8">
          {statusFilter === "open" && (
            <>
              {critical.length > 0 && (
                <PrioritySection title="🚨 Critical" issues={critical} color="red" />
              )}
              {high.length > 0 && (
                <PrioritySection title="🔴 High Priority" issues={high} color="orange" />
              )}
              {medium.length > 0 && (
                <PrioritySection title="🟡 Medium Priority" issues={medium} color="yellow" />
              )}
              {low.length > 0 && (
                <PrioritySection title="🔵 Low Priority" issues={low} color="blue" />
              )}
            </>
          )}

          {statusFilter === "solved" && issues.length > 0 && (
            <PrioritySection title="✅ Solved Issues" issues={issues} color="green" />
          )}
        </div>

        {issues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {statusFilter === "open" 
                ? "No open issues — you're crushing it! 🎉" 
                : "No solved issues yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PrioritySection({
  title,
  issues,
  color,
}: {
  title: string;
  issues: Issue[];
  color: string;
}) {
  const borderColors = {
    red: "border-l-red-600",
    orange: "border-l-orange-500",
    yellow: "border-l-yellow-500",
    blue: "border-l-blue-500",
    green: "border-l-green-500",
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            borderColor={borderColors[color as keyof typeof borderColors]}
          />
        ))}
      </div>
    </div>
  );
}

function IssueCard({ issue, borderColor }: { issue: Issue; borderColor: string }) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 p-6 hover:shadow-md transition-shadow ${borderColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-2">
            {issue.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="capitalize">
              <span className="font-medium">Category:</span> {issue.category}
            </span>
            <span>
              <span className="font-medium">Raised by:</span> {issue.raisedBy}
            </span>
            <span>
              <span className="font-medium">Date:</span> {issue.date}
            </span>
          </div>
        </div>
        <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-3 py-1 rounded">
          {issue.priority}
        </span>
      </div>

      {/* Context */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Context</p>
        <p className="text-sm text-gray-700">{issue.context}</p>
      </div>

      {/* Impact */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Impact</p>
        <p className="text-sm text-gray-700">{issue.impact}</p>
      </div>

      {/* Next Step */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs font-medium text-blue-600 uppercase mb-1">Next Step</p>
        <p className="text-sm font-medium text-gray-900">{issue.nextStep}</p>
      </div>
    </div>
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
