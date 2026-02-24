"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const columns = [
  { key: "inbox", label: "Inbox", color: "border-gray-300" },
  { key: "assigned", label: "Assigned", color: "border-blue-300" },
  { key: "in_progress", label: "In Progress", color: "border-yellow-300" },
  { key: "review", label: "Review", color: "border-purple-300" },
  { key: "done", label: "Done", color: "border-green-300" },
];

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export default function BugBoard() {
  const bugs = useQuery(api.queries.listBugs);

  if (!bugs) {
    return (
      <div className="grid grid-cols-5 gap-3">
        {columns.map((col) => (
          <div key={col.key} className="bg-gray-50 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const grouped = columns.map((col) => ({
    ...col,
    bugs: bugs.filter((b) => b.status === col.key),
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Bug Board ({bugs.length} total)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {grouped.map((col) => (
          <div
            key={col.key}
            className={`bg-gray-50 rounded-lg p-3 border-t-2 ${col.color} min-h-[120px]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                {col.label}
              </span>
              <span className="text-xs text-gray-400">{col.bugs.length}</span>
            </div>
            <div className="space-y-2">
              {col.bugs.map((bug) => (
                <div
                  key={bug._id}
                  className="bg-white rounded border border-gray-200 p-2 text-xs hover:shadow-sm transition-shadow"
                >
                  <p className="font-medium text-gray-800 leading-snug mb-1 line-clamp-2">
                    {bug.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        priorityColors[bug.priority] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bug.priority}
                    </span>
                    <span className="text-gray-400 truncate ml-1">
                      {bug.assignedTo}
                    </span>
                  </div>
                </div>
              ))}
              {col.bugs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
