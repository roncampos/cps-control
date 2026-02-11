"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Dashboard() {
  const summary = useQuery(api.queries.getDashboardSummary);

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CPS Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">CPS Control</h1>
              <p className="text-xs text-gray-500">
                Campos Property Solutions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-3">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  href="/rocks"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Rocks
                </Link>
                <Link
                  href="/scorecard"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Scorecard
                </Link>
                <Link
                  href="/issues"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Issues
                </Link>
                <Link
                  href="/finance"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  Finance
                </Link>
              </nav>
              <div className="text-right border-l border-gray-200 pl-4">
                <p className="text-sm font-medium text-gray-900">Q1 2026</p>
                <p className="text-xs text-gray-500">Week 06</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Rocks"
            total={summary.rocks.total}
            stats={[
              { label: "On Track", value: summary.rocks.onTrack, color: "text-green-600" },
              { label: "Off Track", value: summary.rocks.offTrack, color: "text-red-600" },
              { label: "At Risk", value: summary.rocks.atRisk, color: "text-yellow-600" },
            ]}
          />
          <SummaryCard
            title="Scorecard"
            total={summary.scorecard.total}
            stats={[
              { label: "Green", value: summary.scorecard.green, color: "text-green-600" },
              { label: "Yellow", value: summary.scorecard.yellow, color: "text-yellow-600" },
              { label: "Red", value: summary.scorecard.red, color: "text-red-600" },
            ]}
          />
          <SummaryCard
            title="Issues"
            total={summary.issues.total}
            stats={[
              { label: "Critical", value: summary.issues.critical, color: "text-red-600" },
              { label: "High", value: summary.issues.high, color: "text-orange-600" },
              { label: "Medium", value: summary.issues.medium, color: "text-yellow-600" },
            ]}
          />
          <SummaryCard
            title="Team"
            total={summary.team.total}
            stats={[
              { label: "Roles", value: summary.team.total, color: "text-blue-600" },
            ]}
          />
        </div>

        {/* Rocks Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Q1 2026 Rocks
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.rocks.data.map((rock) => (
              <RockCard key={rock._id} rock={rock} />
            ))}
          </div>
        </section>

        {/* Scorecard Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Scorecard (Week 06)
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.scorecard.data.map((metric) => (
                  <tr key={metric._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {metric.metric}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                      {metric.department}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {metric.owner}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {metric.target}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {metric.actual ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={metric.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Issues Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Open Issues
          </h2>
          <div className="space-y-3">
            {summary.issues.data.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Accountability Chart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.team.data.map((role) => (
              <TeamCard key={role._id} role={role} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  total,
  stats,
}: {
  title: string;
  total: number;
  stats: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-4">{total}</p>
      <div className="space-y-1">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between text-sm">
            <span className="text-gray-600">{stat.label}</span>
            <span className={`font-medium ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RockCard({ rock }: { rock: any }) {
  const statusColors = {
    on_track: "bg-green-100 text-green-800 border-green-200",
    off_track: "bg-red-100 text-red-800 border-red-200",
    at_risk: "bg-yellow-100 text-yellow-800 border-yellow-200",
    complete: "bg-blue-100 text-blue-800 border-blue-200",
    dropped: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{rock.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${
            statusColors[rock.status as keyof typeof statusColors]
          }`}
        >
          {rock.status.replace("_", " ").toUpperCase()}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{rock.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${rock.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        <span className="font-medium">Owner:</span> {rock.owner}
      </div>

      <div className="space-y-1">
        {rock.successCriteria.map((criterion: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={criterion.complete}
              disabled
              className="mt-0.5"
            />
            <span className={criterion.complete ? "line-through text-gray-400" : "text-gray-700"}>
              {criterion.description}
            </span>
          </div>
        ))}
      </div>

      {rock.blockers && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-red-600">
            <span className="font-medium">Blocker:</span> {rock.blockers}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    pending: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors]
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function IssueCard({ issue }: { issue: any }) {
  const priorityColors = {
    critical: "border-l-red-600",
    high: "border-l-orange-500",
    medium: "border-l-yellow-500",
    low: "border-l-blue-500",
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 p-4 ${
        priorityColors[issue.priority as keyof typeof priorityColors]
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm mb-1">
            {issue.title}
          </h4>
          {issue.description && (
            <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              <span className="font-medium">Raised by:</span> {issue.raisedBy}
            </span>
            {issue.department && (
              <span className="capitalize">{issue.department}</span>
            )}
          </div>
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase">
          {issue.priority}
        </span>
      </div>
    </div>
  );
}

function TeamCard({ role }: { role: any }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{role.role}</h4>
      <p className="text-lg font-bold text-blue-600 mb-3">{role.person}</p>
      
      {role.department && (
        <p className="text-xs text-gray-500 capitalize mb-3">
          {role.department}
        </p>
      )}

      <div className="space-y-1">
        {role.responsibilities.slice(0, 3).map((resp: string, idx: number) => (
          <p key={idx} className="text-xs text-gray-600">
            • {resp}
          </p>
        ))}
        {role.responsibilities.length > 3 && (
          <p className="text-xs text-gray-400">
            +{role.responsibilities.length - 3} more
          </p>
        )}
      </div>

      {role.gwoScore && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
          <GWOBadge label="G" value={role.gwoScore.get} />
          <GWOBadge label="W" value={role.gwoScore.want} />
          <GWOBadge label="C" value={role.gwoScore.capacity} />
        </div>
      )}
    </div>
  );
}

function GWOBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded ${
        value
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {label}
    </span>
  );
}
