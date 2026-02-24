"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// ═══════════════════════════════════════════════════════════════
// CPS CONTROL v3 — Unified Command Center
// Campos Property Solutions LLC
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ─────────────────────────────────────────────

const V = {
  d: "'Fraunces', serif",
  b: "'Instrument Sans', sans-serif",
  m: "'DM Mono', monospace"
};

const PRI: Record<string, { l: string; c: string }> = {
  critical: { l: "CRIT", c: "#DC2626" },
  high: { l: "HIGH", c: "#EF4444" },
  medium: { l: "MED", c: "#F59E0B" },
  low: { l: "LOW", c: "#6b6055" }
};

const SC = {
  on_track: "#10B981",
  off_track: "#EF4444",
  at_risk: "#F59E0B"
};

// ─── BOARD COLUMNS ────────────────────────────────────────────

const MC_COLS = [
  { key: "inbox" as const, label: "Inbox", icon: "◇" },
  { key: "assigned" as const, label: "Assigned", icon: "○" },
  { key: "in_progress" as const, label: "In Progress", icon: "◐" },
  { key: "review" as const, label: "Review", icon: "◑" },
  { key: "done" as const, label: "Done", icon: "●" },
  { key: "blocked" as const, label: "Blocked", icon: "⊘" }
];

// ═══════════════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════════════

// Agent name → style lookup for avatar rendering
const agentAvatarStyle: Record<string, { emoji: string; color: string }> = {
  "Nuq": { emoji: "🎯", color: "#F59E0B" },
  "nuq": { emoji: "🎯", color: "#F59E0B" },
  "Deal Analyst": { emoji: "🏠", color: "#3B82F6" },
  "deal-analyst": { emoji: "🏠", color: "#3B82F6" },
  "Follow-up Coach": { emoji: "📞", color: "#EC4899" },
  "followup-coach": { emoji: "📞", color: "#EC4899" },
  "EOS Coach": { emoji: "📋", color: "#8B5CF6" },
  "eos-coach": { emoji: "📋", color: "#8B5CF6" },
  "Finance Officer": { emoji: "💰", color: "#10B981" },
  "finance-officer": { emoji: "💰", color: "#10B981" },
  "Claude Code": { emoji: "💻", color: "#06B6D4" },
  "claude-code": { emoji: "💻", color: "#06B6D4" },
  "Docs Agent": { emoji: "📝", color: "#D946EF" },
  "docs-agent": { emoji: "📝", color: "#D946EF" },
};

function AgentAv({ id, size = 24 }: { id: string; size?: number }) {
  const nameStyle = agentAvatarStyle[id];
  const emoji = nameStyle?.emoji || "🤖";
  const color = nameStyle?.color || "#6B7280";
  const name = id;

  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        background: `linear-gradient(135deg, ${color}25, ${color}50)`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.46,
        flexShrink: 0,
        position: "relative"
      }}
    >
      {emoji}
    </div>
  );
}

function Ring({ val, size = 40, color = "#F59E0B", sw = 3.5 }: { val: number; size?: number; color?: string; sw?: number }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={c - (val / 100) * c}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

function Bar({ val, color = "#F59E0B", h = 5 }: { val: number; color?: string; h?: number }) {
  return (
    <div style={{ width: "100%", height: h, background: "rgba(255,255,255,0.06)", borderRadius: h / 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(val, 100)}%`, height: "100%", background: color, borderRadius: h / 2, transition: "width 1s" }} />
    </div>
  );
}

function Badge({ status, small }: { status: "on_track" | "off_track"; small?: boolean }) {
  const m = {
    on_track: { l: "On Track", c: "#10B981" },
    off_track: { l: "Off Track", c: "#EF4444" }
  };
  const s = m[status] || m.on_track;
  return (
    <span
      style={{
        fontSize: small ? 9 : 10,
        padding: small ? "2px 7px" : "3px 10px",
        borderRadius: 6,
        background: `${s.c}12`,
        color: s.c,
        border: `1px solid ${s.c}20`,
        fontFamily: V.m,
        letterSpacing: 0.5,
        fontWeight: 600,
        whiteSpace: "nowrap"
      }}
    >
      {s.l.toUpperCase()}
    </span>
  );
}

function Cd({
  children,
  style,
  hover,
  onClick
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: h ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${h ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        padding: 20,
        transition: "all 0.2s",
        cursor: onClick ? "pointer" : "default",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Lbl({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 10,
        ...style,
        color: "#4a4540",
        fontFamily: V.m,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 12,
        fontWeight: 500
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
  onClick
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <Cd hover onClick={onClick} style={{ position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ position: "absolute", top: -6, right: -2, fontSize: 38, opacity: 0.06 }}>{icon}</div>
      <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#f0ebe3", fontFamily: V.d, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: accent, marginTop: 5, fontFamily: V.m }}>{sub}</div>
    </Cd>
  );
}

function Btn({
  children,
  active,
  color = "#F59E0B",
  onClick,
  style: s = {}
}: {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.06)"}`,
        background: active ? color + "10" : "transparent",
        color: active ? color : "#5a5047",
        fontSize: 12,
        fontFamily: V.m,
        cursor: "pointer",
        transition: "all 0.2s",
        fontWeight: active ? 600 : 400,
        ...s
      }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MISSION CONTROL
// ═══════════════════════════════════════════════════════════════

type MCAgentType = {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: "active" | "idle" | "blocked";
  task: string | null;
  hb: number;
  level: string;
  stats: { tasksCompleted: number; avgResponseMin: number; contributions: number; streak: number };
  memory: { currentTask: string; status: string; nextSteps: string[]; lastUpdated: string };
  chatHistory: Array<{ from: "user" | "agent"; text: string; time: string }>;
  heartbeats: Array<{ time: string; action: string; type: "work" | "ok" }>;
  dependsOn: string[];
  blockedBy: string[];
};

function AgentConsole({ agent, onClose }: { agent: MCAgentType; onClose: () => void }) {
  const [tab, setTab] = useState("chat");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState(agent.chatHistory);
  const a = agent;

  const send = () => {
    if (!msg.trim()) return;
    setChat(p => [...p, { from: "user" as const, text: msg, time: "Now" }]);
    const m = msg;
    setMsg("");
    setTimeout(
      () =>
        setChat(p => [
          ...p,
          {
            from: "agent" as const,
            text: `Acknowledged. Processing: "${m.slice(0, 40)}..." — I'll update the task thread with results.`,
            time: "Now"
          }
        ]),
      800
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(540px, 90vw)",
        zIndex: 200,
        background: "#1a1714",
        borderLeft: `2px solid ${a.color}25`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-16px 0 50px rgba(0,0,0,0.5)",
        animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)"
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AgentAv id={a.id} size={36} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: a.color, fontFamily: V.d }}>{a.name}</div>
              <div style={{ fontSize: 11, color: "#6b6055" }}>
                {a.role} · {a.level}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "none",
              borderRadius: 7,
              width: 30,
              height: 30,
              cursor: "pointer",
              color: "#7a7068",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[
            { k: "chat", l: "💬 Console" },
            { k: "memory", l: "🧠 Memory" },
            { k: "heartbeat", l: "♡ Heartbeat" },
            { k: "stats", l: "📊 Stats" }
          ].map(t => (
            <Btn key={t.k} active={tab === t.k} color={a.color} onClick={() => setTab(t.k)} style={{ fontSize: 11, padding: "5px 10px" }}>
              {t.l}
            </Btn>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {chat.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: "#3a3530", fontStyle: "italic", fontSize: 13 }}>
                No messages yet. Send a command to {a.name}.
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: m.from === "user" ? "rgba(245,158,11,0.2)" : `${a.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    flexShrink: 0,
                    border: `1px solid ${m.from === "user" ? "rgba(245,158,11,0.15)" : a.color + "20"}`
                  }}
                >
                  {m.from === "user" ? "👤" : a.emoji}
                </div>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: m.from === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                    background: m.from === "user" ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${m.from === "user" ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)"}`
                  }}
                >
                  <p style={{ fontSize: 13, color: "#c4b8a8", lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                  <div style={{ fontSize: 10, color: "#3a3530", marginTop: 4, textAlign: m.from === "user" ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "memory" && (
          <div>
            <div style={{ padding: 16, borderRadius: 12, background: `${a.color}06`, border: `1px solid ${a.color}15`, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: a.color, fontFamily: V.m, letterSpacing: 1, marginBottom: 6 }}>📌 CURRENT TASK</div>
              <div style={{ fontSize: 14, color: "#f0ebe3", fontWeight: 600, marginBottom: 8 }}>{a.memory.currentTask}</div>
              <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
              <div style={{ fontSize: 13, color: "#a89880", lineHeight: 1.6 }}>{a.memory.status}</div>
            </div>
            <Lbl>Next Steps</Lbl>
            {a.memory.nextSteps.map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.015)", marginBottom: 4 }}
              >
                <span style={{ color: a.color, fontFamily: V.m, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#c4b8a8" }}>{s}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 10, color: "#3a3530", fontFamily: V.m }}>Last updated: {a.memory.lastUpdated}</div>
          </div>
        )}

        {tab === "heartbeat" && (
          <div>
            {a.heartbeats.map((hb, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ width: 50, flexShrink: 0, textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "#5a5047", fontFamily: V.m }}>{hb.time}</span>
                </div>
                <div style={{ width: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: hb.type === "work" ? a.color : "#3a3530",
                      boxShadow: hb.type === "work" ? `0 0 8px ${a.color}40` : "none",
                      flexShrink: 0
                    }}
                  />
                  {i < a.heartbeats.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: hb.type === "ok" ? "#5a5047" : "#c4b8a8" }}>{hb.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "stats" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { l: "Tasks Completed", v: a.stats.tasksCompleted, c: "#10B981" },
                { l: "Avg Response", v: `${a.stats.avgResponseMin}m`, c: "#3B82F6" },
                { l: "Contributions", v: a.stats.contributions, c: a.color },
                { l: "Active Streak", v: `${a.stats.streak}d`, c: "#F59E0B" }
              ].map((s, i) => (
                <Cd key={i} style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: V.d }}>{s.v}</div>
                </Cd>
              ))}
            </div>
            <Lbl>Activity (7 days)</Lbl>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60, marginBottom: 8 }}>
              {[3, 5, 2, 7, 4, 6, a.stats.streak > 0 ? 5 : 0].map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${(v / 7) * 100}%`,
                    background: `${a.color}${i === 6 ? "60" : "25"}`,
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s",
                    minHeight: 4
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#3a3530", fontFamily: V.m }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat input (always visible on chat tab) */}
      {tab === "chat" && (
        <div style={{ padding: "10px 20px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", gap: 8 }}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`Command ${a.name}...`}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${a.color}20`,
              color: "#e8ddd0",
              fontSize: 13,
              outline: "none",
              fontFamily: V.b
            }}
            onFocus={e => (e.currentTarget.style.borderColor = a.color + "50")}
            onBlur={e => (e.currentTarget.style.borderColor = a.color + "20")}
          />
          <button
            onClick={send}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: msg.trim() ? `linear-gradient(135deg, ${a.color}, ${a.color}cc)` : "rgba(255,255,255,0.04)",
              color: msg.trim() ? "#16140f" : "#4a4540",
              fontWeight: 600,
              fontSize: 12,
              cursor: msg.trim() ? "pointer" : "default",
              fontFamily: V.m
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

function MCPage() {
  const [sub, setSub] = useState("board");
  const [selAgent, setSelAgent] = useState<MCAgentType | null>(null);

  // Convex real-time queries — agents, tasks, activities
  const convexAgents = useQuery(api.queries.listAgents) ?? [];
  const convexTasks = useQuery(api.queries.listTasks, {}) ?? [];
  const convexActivities = useQuery(api.queries.getRecentActivities, { limit: 50 }) ?? [];

  // Railway MC API — only for approvals (still served from Fastify)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const MC_API_URL = process.env.NEXT_PUBLIC_MC_API_URL || "http://localhost:3100";

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await fetch(`${MC_API_URL}/approvals/pending`);
        const data = await res.json();
        setPendingApprovals(data.suggestions || data.pending || []);
      } catch (err) {
        // Silently fail — approvals are optional
      }
    };

    fetchApprovals();
    const interval = setInterval(fetchApprovals, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApproval = async (taskId: string, action: "approve" | "reject") => {
    try {
      await fetch(`${MC_API_URL}/approvals/${taskId}/${action}`, { method: "POST" });
      const res = await fetch(`${MC_API_URL}/approvals/pending`);
      const data = await res.json();
      setPendingApprovals(data.suggestions || data.pending || []);
    } catch (err) {
      console.error(`Failed to ${action} approval:`, err);
    }
  };

  // Map Convex agents to UI format
  const agentStyle: Record<string, { emoji: string; color: string }> = {
    "Nuq": { emoji: "🎯", color: "#F59E0B" },
    "Deal Analyst": { emoji: "🏠", color: "#3B82F6" },
    "Follow-up Coach": { emoji: "📞", color: "#EC4899" },
    "EOS Coach": { emoji: "📋", color: "#8B5CF6" },
    "Finance Officer": { emoji: "💰", color: "#10B981" },
    "Claude Code": { emoji: "💻", color: "#06B6D4" },
    "Docs Agent": { emoji: "📝", color: "#D946EF" },
  };

  const minutesSince = (ts: number) => Math.max(0, Math.floor((Date.now() - ts) / 60000));

  const displayAgents: MCAgentType[] = convexAgents.map(agent => {
    const style = agentStyle[agent.name] || { emoji: "🤖", color: "#6B7280" };
    return {
      id: agent._id,
      name: agent.name,
      role: agent.role || agent.specialty || "Agent",
      emoji: style.emoji,
      color: style.color,
      status: agent.status === "working" ? "active" as const : agent.status === "blocked" ? "blocked" as const : "idle" as const,
      task: agent.currentTaskId || null,
      hb: minutesSince(agent.lastHeartbeat),
      level: agent.level || "Agent",
      stats: { tasksCompleted: 0, avgResponseMin: 0, contributions: 0, streak: 0 },
      memory: {
        currentTask: agent.currentTaskId ? "Active task" : "No active task",
        status: `Status: ${agent.status}`,
        nextSteps: [],
        lastUpdated: `${minutesSince(agent.lastHeartbeat)}m ago`
      },
      chatHistory: [],
      heartbeats: [],
      dependsOn: [],
      blockedBy: []
    };
  });

  const activeAgents = displayAgents;

  // Map Convex tasks to board format (supports both v1 and v2 statuses)
  const mapConvexTaskStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "inbox",
      inbox: "inbox",
      assigned: "assigned",
      in_progress: "in_progress",
      blocked: "blocked",
      review: "review",
      complete: "done",
      done: "done",
    };
    return statusMap[status] || "inbox";
  };

  const boardTasks = convexTasks.map(t => ({
    id: t._id,
    title: t.title,
    status: mapConvexTaskStatus(t.status),
    assignees: t.assignedTo ? [t.assignedTo] : [],
    priority: t.priority === "urgent" ? "critical" : t.priority,
    tags: t.tags || [],
  }));

  const displayTasks = boardTasks;

  // Map Convex activities to display format
  const displayActivity = convexActivities.map(a => ({
    id: a._id,
    agentName: a.actor,
    type: a.activityType || a.action,
    message: a.description || a.action,
    timestamp: a.createdAt,
  }));

  // Notifications — empty for now (Convex notification daemon delivers to agents)
  const displayNotifs: Array<{ id: string; from: string; time: string; text: string; type: string; read: boolean; task: string }> = [];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { k: "board", l: "⊞ Board" },
          { k: "agents", l: "◎ Agents" },
          { k: "approvals", l: `✓ Approvals ${pendingApprovals.length > 0 ? `(${pendingApprovals.length})` : ""}` },
          { k: "heartbeat", l: "♡ Heartbeat" },
          { k: "deps", l: "🔗 Dependencies" },
          { k: "notifications", l: `🔔 ${displayNotifs.filter(n => !n.read).length > 0 ? `(${displayNotifs.filter(n => !n.read).length})` : ""}` },
          { k: "standup", l: "📊 Standup" }
        ].map(t => (
          <Btn key={t.k} active={sub === t.k} onClick={() => setSub(t.k)}>
            {t.l}
          </Btn>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "breathe 2s infinite" }} />
          <span style={{ fontSize: 11, color: "#10B981", fontFamily: V.m }}>
            {activeAgents.filter(a => a.status === "active").length} active
          </span>
        </div>
      </div>

      <div style={{ overflow: "auto" }}>
        {/* BOARD */}
        {sub === "board" && (
          <div style={{ display: "flex", gap: 8, minWidth: "min-content" }}>
            {MC_COLS.map(col => {
              const ct = displayTasks.filter(t => t.status === col.key);
              return (
                <div
                  key={col.key}
                  style={{ flex: "1 1 0", minWidth: 180, maxWidth: 280 }}
                >
                  <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, opacity: 0.3 }}>{col.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#7a7068", fontFamily: V.m, letterSpacing: 1, textTransform: "uppercase" }}>
                      {col.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>{ct.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ct.map(t => (
                      <div
                        key={t.id}
                        style={{
                          padding: "11px 13px",
                          borderRadius: 11,
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                          e.currentTarget.style.transform = "";
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#f0ebe3", lineHeight: 1.3, flex: 1 }}>{t.title}</span>
                          <span
                            style={{
                              fontSize: 8,
                              padding: "2px 5px",
                              borderRadius: 4,
                              background: `${PRI[t.priority]?.c || "#6b6055"}12`,
                              color: PRI[t.priority]?.c || "#6b6055",
                              fontFamily: V.m
                            }}
                          >
                            {PRI[t.priority]?.l || "---"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: 3 }}>
                            {t.tags.map(tg => (
                              <span
                                key={tg}
                                style={{
                                  fontSize: 9,
                                  padding: "1px 6px",
                                  borderRadius: 12,
                                  background: "rgba(255,255,255,0.04)",
                                  color: "#5a5047",
                                  fontFamily: V.m
                                }}
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex" }}>
                            {t.assignees.map((a, i) => (
                              <div key={a} style={{ marginLeft: i ? -4 : 0 }}>
                                <AgentAv id={a} size={18} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {ct.length === 0 && <div style={{ padding: 14, textAlign: "center", fontSize: 11, color: "#2a2520", fontStyle: "italic" }}>Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AGENTS */}
        {sub === "agents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {activeAgents.map((a, i) => {
              const t = displayTasks.find(x => x.id === a.task);
              return (
                <Cd
                  key={a.id}
                  hover
                  onClick={() => setSelAgent(a)}
                  style={{
                    animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both`,
                    cursor: "pointer",
                    borderLeft: `2px solid ${a.color}30`,
                    borderRadius: "0 14px 14px 0"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 11,
                        background: `linear-gradient(135deg, ${a.color}25, ${a.color}50)`,
                        border: `1.5px solid ${a.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        flexShrink: 0,
                        position: "relative"
                      }}
                    >
                      {a.emoji}
                      <div style={{
                        position: "absolute", bottom: -1, right: -1,
                        width: 7, height: 7, borderRadius: "50%",
                        background: a.status === "active" ? "#10B981" : a.status === "blocked" ? "#EF4444" : "#4a4540",
                        border: "1.5px solid #16140f"
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ebe3", fontFamily: V.d }}>{a.name}</div>
                      <div style={{ fontSize: 10, color: "#5a5047" }}>{a.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 9,
                          color: a.status === "active" ? "#10B981" : a.status === "blocked" ? "#EF4444" : "#4a4540",
                          fontFamily: V.m,
                          textTransform: "uppercase"
                        }}
                      >
                        {a.status}
                      </div>
                      <div style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m }}>♡ {a.hb}m</div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: t ? "#8a8078" : "#3a3530",
                      fontStyle: t ? "normal" : "italic",
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {t ? `📌 ${t.title}` : "No active task"}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>✓{a.stats.tasksCompleted}</span>
                    <span style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>↗{a.stats.contributions}</span>
                    <span style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>⏱{a.stats.avgResponseMin}m</span>
                  </div>
                </Cd>
              );
            })}
          </div>
        )}

        {/* APPROVALS QUEUE */}
        {sub === "approvals" && (
          <div>
            <Lbl>Document Suggestions — Agent Knowledge Refinement</Lbl>
            {pendingApprovals.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>
                No pending approvals
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingApprovals.map((approval: any, i: number) => {
                const sug = approval.suggestion || approval;
                const filePath = sug.filePath || approval.title || "Unknown";
                const fileName = filePath.split('/').pop();
                return (
                <Cd
                  key={approval.taskId || i}
                  style={{
                    animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
                    borderLeft: "2px solid #F59E0B30"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ebe3", marginBottom: 4 }}>
                        📝 {fileName}
                      </div>
                      <div style={{ fontSize: 11, color: "#5a5047", marginBottom: 8 }}>
                        <span style={{ color: "#F59E0B" }}>Finance Officer</span>
                        {sug.reason && (
                          <span style={{ marginLeft: 10 }}>• {sug.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {sug.content && (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 12,
                        fontSize: 11,
                        color: "#8a8078",
                        fontFamily: "monospace",
                        maxHeight: 200,
                        overflow: "auto"
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {sug.content}
                      </pre>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleApproval(approval.taskId, "approve")}
                      style={{
                        padding: "8px 16px",
                        background: "#10B981",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: V.m,
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}
                    >
                      ✓ Approve & Commit
                    </button>
                    <button
                      onClick={() => handleApproval(approval.taskId, "reject")}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#EF4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: V.m,
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </Cd>
              );
              })}
            </div>
          </div>
        )}

        {/* HEARTBEAT MONITOR */}
        {sub === "heartbeat" && (
          <div>
            <Lbl>Agent Activity Log — Real-time from Convex</Lbl>
            {displayActivity.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>
                No activity yet. Activity will appear when agents start heartbeating.
              </div>
            )}
            {displayActivity.map((act, i) => {
              const actIcons: Record<string, string> = {
                task_created: "📝", task_assigned: "👤", task_status_changed: "🔄",
                message_sent: "💬", document_created: "📄", bug_filed: "🐛",
                fix_deployed: "🚀", agent_heartbeat: "💓",
                task_started: "▶️", task_completed: "✅", alert_sent: "⚠️", doc_suggested: "📝"
              };
              return (
                <div
                  key={act.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    marginBottom: 6,
                    animation: `fadeSlideIn 0.3s ease ${i * 0.03}s both`
                  }}
                >
                  <div style={{ fontSize: 16, width: 24, textAlign: "center" }}>
                    {actIcons[act.type] || "📋"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>{act.agentName}</span>
                      <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>
                        {new Date(act.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#8a8078", margin: 0, lineHeight: 1.5 }}>{act.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DEPENDENCIES */}
        {sub === "deps" && (
          <div>
            <Lbl>Agent Dependencies — Task blocking relationships</Lbl>
            {activeAgents.filter(a => a.status === "blocked").length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>
                No blocked agents. All agents are operating independently.
              </div>
            )}
            {activeAgents.filter(a => a.status === "blocked").map((a, i) => (
              <Cd
                key={a.id}
                style={{
                  marginBottom: 10,
                  padding: "14px 18px",
                  borderLeft: "2px solid #EF444430",
                  borderRadius: "0 14px 14px 0",
                  animation: `fadeSlideIn 0.3s ease ${i * 0.06}s both`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>{a.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: a.color, fontFamily: V.d }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: "#EF4444", fontFamily: V.m, marginLeft: "auto" }}>BLOCKED</span>
                </div>
              </Cd>
            ))}
            <Lbl style={{ marginTop: 20 }}>Active Agents</Lbl>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {activeAgents.filter(a => a.status !== "blocked").map(a => (
                <span
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: 12,
                    color: "#8a8078"
                  }}
                >
                  <span>{a.emoji}</span>
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {sub === "notifications" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#8a8078" }}>{displayNotifs.filter(n => !n.read).length} unread</span>
            </div>
            {displayNotifs.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>
                No notifications yet. @mentions and alerts will appear here.
              </div>
            )}
            {displayNotifs.map((n, i) => {
              const icons: Record<string, string> = { mention: "💬", review: "👁", alert: "⚠️", critical: "🚨", info: "💡", milestone: "✓" };
              return (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: n.read ? "transparent" : "rgba(245,158,11,0.03)",
                    borderLeft: n.read ? "3px solid transparent" : `3px solid #F59E0B`,
                    marginBottom: 4,
                    animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icons[n.type] || "💡"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>{n.from || "Agent"}</span>
                      <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: n.read ? "#6b6055" : "#c4b8a8", margin: 0, lineHeight: 1.5 }}>{n.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STANDUP */}
        {sub === "standup" && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: 12, color: "#F59E0B", fontFamily: V.m, marginBottom: 18 }}>
              📊 DAILY STANDUP —{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}
            </div>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #10B981", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#10B981", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>✅ COMPLETED</div>
              {displayTasks.filter(t => t.status === "done").length === 0 && (
                <div style={{ fontSize: 12, color: "#5a5047", fontStyle: "italic" }}>No completed tasks yet</div>
              )}
              {displayTasks.filter(t => t.status === "done").map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>✓</span>
                  <span style={{ fontSize: 12, color: "#c4b8a8" }}>{t.title}</span>
                  <span style={{ fontSize: 10, color: "#5a5047", marginLeft: "auto" }}>{t.assignees.join(", ")}</span>
                </div>
              ))}
            </Cd>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #3B82F6", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#3B82F6", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>🔄 IN PROGRESS</div>
              {displayTasks.filter(t => t.status === "in_progress" || t.status === "assigned").length === 0 && (
                <div style={{ fontSize: 12, color: "#5a5047", fontStyle: "italic" }}>No tasks in progress</div>
              )}
              {displayTasks.filter(t => t.status === "in_progress" || t.status === "assigned").map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600 }}>◐</span>
                  <span style={{ fontSize: 12, color: "#c4b8a8" }}>{t.title}</span>
                  <span style={{ fontSize: 10, color: "#5a5047", marginLeft: "auto" }}>{t.assignees.join(", ")}</span>
                </div>
              ))}
            </Cd>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #EF4444", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#EF4444", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>🚫 BLOCKED</div>
              {displayTasks.filter(t => t.status === "blocked").length === 0 && (
                <div style={{ fontSize: 12, color: "#5a5047", fontStyle: "italic" }}>No blocked tasks</div>
              )}
              {displayTasks.filter(t => t.status === "blocked").map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>⊘</span>
                  <span style={{ fontSize: 12, color: "#e8b4b4" }}>{t.title}</span>
                  <span style={{ fontSize: 10, color: "#5a5047", marginLeft: "auto" }}>{t.assignees.join(", ")}</span>
                </div>
              ))}
            </Cd>
            <Cd style={{ borderLeft: "3px solid #F59E0B", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#F59E0B", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>📈 SQUAD STATS</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#10B981", fontFamily: V.d }}>
                    {activeAgents.filter(a => a.status === "active").length}
                  </span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}> active</span>
                </div>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#3B82F6", fontFamily: V.d }}>
                    {displayTasks.length}
                  </span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}> total tasks</span>
                </div>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#EF4444", fontFamily: V.d }}>
                    {activeAgents.filter(a => a.status === "blocked").length}
                  </span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}> blocked</span>
                </div>
              </div>
            </Cd>
          </div>
        )}
      </div>

      {/* Agent Console Panel */}
      {selAgent && (
        <>
          <div
            onClick={() => setSelAgent(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 190, backdropFilter: "blur(2px)" }}
          />
          <AgentConsole agent={selAgent} onClose={() => setSelAgent(null)} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [col, setCol] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#16140f", color: "#e8ddd0", display: "flex", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Instrument Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.12); border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes breathe { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        input::placeholder { color: #4a4540; }
      `}</style>

      {/* SIDEBAR */}
      <div
        style={{
          width: col ? 54 : 210,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
          background: "rgba(255,255,255,0.008)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: col ? "13px 9px" : "13px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div
            onClick={() => setCol(!col)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, #F59E0B18, #EF444418)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              border: "1px solid rgba(245,158,11,0.12)",
              fontSize: 13
            }}
          >
            ⚡
          </div>
          {!col && (
            <div>
              <div style={{ fontFamily: V.d, fontSize: 13, fontWeight: 700, color: "#f0ebe3", lineHeight: 1 }}>CPS Control</div>
              <div style={{ fontSize: 8, color: "#4a4540", fontFamily: V.m }}>Campos Property Solutions</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: col ? "8px 5px" : "8px 7px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: col ? "9px 6px" : "9px 11px",
              borderRadius: 8,
              background: "rgba(245,158,11,0.08)",
              color: "#F59E0B",
              fontWeight: 600,
              justifyContent: col ? "center" : "flex-start",
              marginBottom: 2
            }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>🎛</span>
            {!col && <span style={{ fontSize: 13 }}>Mission Control</span>}
            {!col && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "breathe 2s infinite" }} />}
          </div>
        </div>

        {!col && <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, fontSize: 10, color: "#3a3530", fontFamily: V.m }}>Q1 2026 · Wk 06</div>}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ padding: "11px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(255,255,255,0.005)" }}>
          <h1 style={{ fontFamily: V.d, fontSize: 19, fontWeight: 600, color: "#f0ebe3" }}>Mission Control</h1>
          <div style={{ fontSize: 11, color: "#3a3530", fontFamily: V.m }}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 22 }}>
          <MCPage />
        </div>
      </div>
    </div>
  );
}
