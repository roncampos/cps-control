"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const statusColors: Record<string, string> = {
  inbox: "bg-gray-100 text-gray-700",
  pending: "bg-gray-100 text-gray-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  blocked: "bg-red-100 text-red-700",
  review: "bg-purple-100 text-purple-700",
  complete: "bg-green-100 text-green-700",
  done: "bg-green-100 text-green-700",
};

const typeIcons: Record<string, string> = {
  bug: "🐛",
  feature: "✨",
  analyze: "📊",
  monitor: "👁",
  report: "📋",
  doc_suggestion: "📝",
  review: "🔍",
};

const priorityDot: Record<string, string> = {
  critical: "bg-red-500",
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
};

interface WorkQueueProps {
  assignedTo?: string;
}

export default function WorkQueue({ assignedTo }: WorkQueueProps) {
  const tasks = useQuery(
    assignedTo ? api.queries.getAgentWorkQueue : api.queries.listTasks,
    assignedTo ? { assignedTo } : {}
  );

  if (!tasks) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {assignedTo ? `No active tasks for ${assignedTo}` : "No tasks yet"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!assignedTo && (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          All Tasks ({tasks.length})
        </h3>
      )}
      {tasks.slice(0, 20).map((task) => (
        <div
          key={task._id}
          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">
              {typeIcons[task.type ?? ""] ?? "📋"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    priorityDot[task.priority] ?? "bg-gray-400"
                  }`}
                />
                <p className="font-medium text-sm text-gray-900 truncate">
                  {task.title}
                </p>
              </div>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    statusColors[task.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-400">
                  {task.assignedTo}
                </span>
                {task.tags?.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
