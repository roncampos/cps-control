"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const typeIcons: Record<string, string> = {
  task_created: "📝",
  task_assigned: "👤",
  task_status_changed: "🔄",
  message_sent: "💬",
  document_created: "📄",
  bug_filed: "🐛",
  fix_deployed: "🚀",
  agent_heartbeat: "💓",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ActivityFeed() {
  const activities = useQuery(api.queries.getRecentActivities, { limit: 30 });

  if (!activities) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No activity yet. Agents will log events here as they work.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">
        Activity Feed
      </h3>
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="flex items-start gap-2 py-2 px-2 rounded hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm mt-0.5">
            {typeIcons[activity.activityType ?? ""] ?? "📋"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-snug">
              <span className="font-medium">{activity.actor}</span>{" "}
              {activity.description}
            </p>
            <span className="text-xs text-gray-400">
              {timeAgo(activity.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
