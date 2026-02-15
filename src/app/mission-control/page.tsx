"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: "idle" | "working" | "waiting" | "error" | "offline";
  capabilities: string[];
  currentTask?: string;
  lastActiveAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  status: string;
  assignedTo?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface Metrics {
  tasksCompleted: number;
  tasksActive: number;
  tasksFailed: number;
  agentsActive: number;
  taskQueueLength: number;
  totalAgents: number;
  totalTasks: number;
}

interface DocSuggestion {
  agentId: string;
  filePath: string;
  changeType: "add" | "update" | "remove";
  content: string;
  reason: string;
  domain: string;
  timestamp: string;
}

interface Approval {
  taskId: string;
  suggestion: DocSuggestion;
  createdAt: string;
}

const MC_API = "http://localhost:3100";

export default function MissionControlPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [previewingTaskId, setPreviewingTaskId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<{
    oldContent: string | null;
    newContent: string;
    exists: boolean;
  } | null>(null);

  useEffect(() => {
    // Initial data fetch
    fetchStatus();

    // Set up WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:3100/ws`);

    ws.onopen = () => {
      console.log("[MC] WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[MC] Event:", data);

      if (data.type === "state") {
        setAgents(data.data.agents);
        setMetrics(data.data.metrics);
      } else if (data.type === "agent:status" || data.type === "agent:spawned") {
        fetchStatus();
      } else if (data.type === "task:created" || data.type === "task:updated") {
        fetchTasks();
      }
    };

    ws.onclose = () => {
      console.log("[MC] WebSocket disconnected");
      setConnected(false);
    };

    // Polling fallback
    const interval = setInterval(fetchStatus, 5000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${MC_API}/status`);
      const data = await res.json();
      setAgents(data.agents || []);
      setMetrics(data.metrics);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch status:", err);
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${MC_API}/tasks`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${MC_API}/approvals/pending`);
      const data = await res.json();
      setApprovals(data.suggestions || []);
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    }
  };

  const handleApprove = async (taskId: string) => {
    if (!confirm("Approve this doc suggestion? It will be committed to the knowledge base.")) {
      return;
    }

    try {
      const res = await fetch(`${MC_API}/approvals/${taskId}/approve`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Doc approved and committed!\n\n" + data.message);
        fetchApprovals(); // Refresh list
        setPreviewingTaskId(null);
        setPreviewContent(null);
      } else {
        alert("❌ Failed to approve:\n\n" + data.message);
      }
    } catch (err) {
      alert("❌ Error approving doc:\n\n" + err);
    }
  };

  const handleReject = async (taskId: string) => {
    const reason = prompt("Why are you rejecting this suggestion?");
    if (!reason) return;

    try {
      const res = await fetch(`${MC_API}/approvals/${taskId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Suggestion rejected");
        fetchApprovals(); // Refresh list
        setPreviewingTaskId(null);
        setPreviewContent(null);
      }
    } catch (err) {
      alert("❌ Error rejecting:\n\n" + err);
    }
  };

  const handlePreview = async (taskId: string) => {
    try {
      const res = await fetch(`${MC_API}/approvals/${taskId}/preview`);
      const data = await res.json();

      setPreviewingTaskId(taskId);
      setPreviewContent(data.preview);
    } catch (err) {
      alert("❌ Error loading preview:\n\n" + err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchApprovals();

    // Refresh approvals every 30 seconds
    const interval = setInterval(fetchApprovals, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Connecting to Mission Control...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}></div>
              <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {connected ? "OPERATIONAL" : "DISCONNECTED"}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Real-time monitoring via WebSocket
            </div>
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Agents Active"
              value={metrics.agentsActive}
              total={metrics.totalAgents}
              color="blue"
            />
            <MetricCard
              label="Tasks Active"
              value={metrics.tasksActive}
              color="yellow"
            />
            <MetricCard
              label="Tasks Completed"
              value={metrics.tasksCompleted}
              color="green"
            />
            <MetricCard
              label="Tasks Failed"
              value={metrics.tasksFailed}
              color="red"
            />
          </div>
        )}

        {/* Approval Queue */}
        {approvals.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📝 Pending Doc Suggestions
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {approvals.length}
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              {approvals.map((approval) => (
                <ApprovalCard
                  key={approval.taskId}
                  approval={approval}
                  isPreviewing={previewingTaskId === approval.taskId}
                  previewContent={previewContent}
                  onPreview={() => handlePreview(approval.taskId)}
                  onApprove={() => handleApprove(approval.taskId)}
                  onReject={() => handleReject(approval.taskId)}
                  onClosePreview={() => {
                    setPreviewingTaskId(null);
                    setPreviewContent(null);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Agents */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Agents</h2>
          {agents.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No agents running
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No tasks yet
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 10).map((task) => (
                <TaskCard key={task.id} task={task} agents={agents} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CPS Control</h1>
            <p className="text-xs text-gray-500">Campos Property Solutions</p>
          </div>
          <nav className="flex gap-3">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Dashboard
            </Link>
            <Link href="/rocks" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Rocks
            </Link>
            <Link href="/scorecard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Scorecard
            </Link>
            <Link href="/issues" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Issues
            </Link>
            <Link href="/finance" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Finance
            </Link>
            <Link href="/mission-control" className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
              Mission Control
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function MetricCard({ label, value, total, color }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color as keyof typeof colors]}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1">
        {value}
        {total !== undefined && <span className="text-lg opacity-60">/{total}</span>}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors = {
    idle: "bg-gray-100 text-gray-700",
    working: "bg-blue-100 text-blue-700",
    waiting: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    offline: "bg-gray-100 text-gray-400",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-xs text-gray-500 capitalize">{agent.type}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[agent.status]}`}>
          {agent.status.toUpperCase()}
        </span>
      </div>

      {agent.currentTask && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
          <span className="font-medium">Current:</span> {agent.currentTask}
        </div>
      )}

      <div className="text-xs text-gray-600">
        <span className="font-medium">Capabilities:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {(agent.capabilities || []).map((cap) => (
            <span key={cap} className="px-2 py-0.5 bg-gray-100 rounded">
              {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, agents }: { task: Task; agents: Agent[] }) {
  const agent = agents.find((a) => a.id === task.assignedTo);

  const statusColors = {
    queued: "bg-gray-100 text-gray-700",
    assigned: "bg-blue-100 text-blue-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  const priorityColors = {
    low: "text-gray-500",
    medium: "text-yellow-600",
    high: "text-orange-600",
    critical: "text-red-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded ${statusColors[task.status as keyof typeof statusColors]}`}>
          {task.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className={`font-medium ${priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
        <span className="capitalize">{task.type}</span>
        {agent && <span>→ {agent.name}</span>}
        <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

function ApprovalCard({
  approval,
  isPreviewing,
  previewContent,
  onPreview,
  onApprove,
  onReject,
  onClosePreview,
}: {
  approval: Approval;
  isPreviewing: boolean;
  previewContent: { oldContent: string | null; newContent: string; exists: boolean } | null;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClosePreview: () => void;
}) {
  const suggestion = approval.suggestion;
  const timeAgo = new Date(approval.createdAt).toLocaleString();

  return (
    <div className="bg-white rounded-lg border-2 border-blue-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                {suggestion.changeType === "add" ? "➕ New Doc" : "✏️ Update"}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-600">{suggestion.domain}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{suggestion.filePath}</h3>
            <p className="text-sm text-gray-600 mt-2">{suggestion.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span>Created {timeAgo}</span>
        </div>
      </div>

      {/* Preview Section */}
      {isPreviewing && previewContent && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Preview</h4>
            <button
              onClick={onClosePreview}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close Preview
            </button>
          </div>

          {!previewContent.exists && (
            <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ New file - doesn't exist yet
            </div>
          )}

          <div className="bg-white rounded border border-gray-300 p-3 max-h-96 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {previewContent.newContent}
            </pre>
          </div>

          {previewContent.exists && previewContent.oldContent && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Show old version
              </summary>
              <div className="mt-2 bg-white rounded border border-gray-300 p-3 max-h-96 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap text-gray-500">
                  {previewContent.oldContent}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 flex items-center gap-3">
        {!isPreviewing ? (
          <button
            onClick={onPreview}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            👁️ Preview Content
          </button>
        ) : null}
        <button
          onClick={onApprove}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          ✅ Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
        >
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
