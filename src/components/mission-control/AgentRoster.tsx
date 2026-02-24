"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const statusColors: Record<string, string> = {
  idle: "bg-gray-100 text-gray-700",
  working: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
};

const statusDot: Record<string, string> = {
  idle: "bg-gray-400",
  working: "bg-green-500 animate-pulse",
  blocked: "bg-red-500",
};

function timeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AgentRoster() {
  const agents = useQuery(api.queries.listAgents);

  if (!agents) {
    return (
      <div className="space-y-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
        Agent Squad ({agents.filter((a) => a.status === "working").length} active)
      </h3>
      {agents.map((agent) => (
        <div
          key={agent._id}
          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{agent.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {agent.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${statusDot[agent.status]}`} />
              </div>
              <span className="text-xs text-gray-500">{agent.role}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[agent.status]}`}
            >
              {agent.status}
            </span>
            <span className="text-xs text-gray-400">
              {timeSince(agent.lastHeartbeat)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
