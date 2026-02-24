"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

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
  const a = agent;

  // Real Convex messages
  const directMessages = useQuery(api.queries.getDirectMessages, { agent: a.name, limit: 50 }) ?? [];
  const sendDM = useMutation(api.messageMutationsV2.sendDirectMessage);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    try {
      await sendDM({ from: "Ron", to: a.name, content: msg.trim() });
      setMsg("");
    } catch (e) { console.error("Failed to send:", e); }
    finally { setSending(false); }
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
            {directMessages.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: "#3a3530", fontStyle: "italic", fontSize: 13 }}>
                No messages yet. Send a command to {a.name}.
              </div>
            )}
            {directMessages.map((m, i) => {
              const isUser = m.from === "Ron";
              return (
                <div key={i} style={{ display: "flex", gap: 10, flexDirection: isUser ? "row-reverse" : "row" }}>
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: isUser ? "rgba(245,158,11,0.2)" : `${a.color}20`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0,
                      border: `1px solid ${isUser ? "rgba(245,158,11,0.15)" : a.color + "20"}`
                    }}
                  >
                    {isUser ? "👤" : a.emoji}
                  </div>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px",
                    borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                    background: isUser ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isUser ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)"}`
                  }}>
                    <p style={{ fontSize: 13, color: "#c4b8a8", lineHeight: 1.6, margin: 0 }}>{m.content}</p>
                    <div style={{ fontSize: 10, color: "#3a3530", marginTop: 4, textAlign: isUser ? "right" : "left" }}>
                      {new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
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

// ─── NEW TASK MODAL ──────────────────────────────────────────

function NewTaskModal({ agents, onClose }: { agents: MCAgentType[]; onClose: () => void }) {
  const createTask = useMutation(api.taskMutationsV2.createV2);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"medium" | "critical" | "high" | "low">("medium");
  const [type, setType] = useState<"bug" | "feature" | "analyze" | "monitor" | "report">("feature");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createTask({
        title: title.trim(),
        description: desc.trim() || undefined,
        assignedTo: assignee || "unassigned",
        createdBy: "Ron",
        status: assignee ? "assigned" : "inbox",
        priority,
        type,
        tags: [],
        assigneeIds: assignee ? [assignee] : undefined,
      });
      onClose();
    } catch (e) {
      console.error("Failed to create task:", e);
    } finally {
      setSaving(false);
    }
  };

  const selStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)", color: "#e8ddd0", fontSize: 13, fontFamily: V.b,
    outline: "none", width: "100%", appearance: "none" as const, cursor: "pointer",
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(480px, 90vw)", background: "#1e1b16", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: 24, zIndex: 310, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        animation: "fadeSlideIn 0.2s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f0ebe3", fontFamily: V.d }}>New Task</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a5047", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>TITLE *</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?"
              style={{ ...selStyle, border: `1px solid ${title.trim() ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.3)"}` }}
              autoFocus onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>DESCRIPTION</div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details..."
              rows={3} style={{ ...selStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>ASSIGNEE</div>
              <select value={assignee} onChange={e => setAssignee(e.target.value)} style={selStyle}>
                <option value="">Unassigned (Inbox)</option>
                {agents.map(a => <option key={a.id} value={a.name}>{a.emoji} {a.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>PRIORITY</div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["critical", "high", "medium", "low"] as const).map(p => (
                  <button key={p} onClick={() => setPriority(p)} style={{
                    flex: 1, padding: "6px 4px", borderRadius: 6, fontSize: 9, fontFamily: V.m, fontWeight: 600,
                    cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase",
                    background: priority === p ? `${PRI[p].c}20` : "transparent",
                    color: priority === p ? PRI[p].c : "#4a4540",
                    border: `1px solid ${priority === p ? PRI[p].c + "40" : "rgba(255,255,255,0.06)"}`,
                  }}>{PRI[p].l}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>TYPE</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["bug", "feature", "analyze", "monitor", "report"] as const).map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 10, fontFamily: V.m, cursor: "pointer",
                  background: type === t ? "rgba(245,158,11,0.15)" : "transparent",
                  color: type === t ? "#F59E0B" : "#5a5047",
                  border: `1px solid ${type === t ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#5a5047", fontSize: 12, fontFamily: V.m, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={!title.trim() || saving} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", fontFamily: V.m, fontSize: 12, fontWeight: 600, cursor: title.trim() && !saving ? "pointer" : "default",
            background: title.trim() && !saving ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "rgba(255,255,255,0.04)",
            color: title.trim() && !saving ? "#16140f" : "#4a4540",
          }}>{saving ? "Creating..." : "Create Task"}</button>
        </div>
      </div>
    </>
  );
}

// ─── TASK DETAIL PANEL ───────────────────────────────────────

function TaskDetailPanel({ taskId, agents, onClose }: { taskId: Id<"tasks">; agents: MCAgentType[]; onClose: () => void }) {
  const allTasks = useQuery(api.queries.listTasks, {}) ?? [];
  const task = allTasks.find(t => t._id === taskId);
  const comments = useQuery(api.queries.getTaskComments, { taskId }) ?? [];
  const deliverables = useQuery(api.queries.getTaskDeliverables, { taskId }) ?? [];
  const updateStatus = useMutation(api.taskMutationsV2.updateStatusV2);
  const assignTask = useMutation(api.taskMutationsV2.assign);
  const addComment = useMutation(api.messageMutationsV2.createComment);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const commentsEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { commentsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [comments.length]);

  if (!task) return null;

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus({ id: taskId, status: newStatus as any });
  };

  const handleAssign = async (agentName: string) => {
    await assignTask({ id: taskId, assignedTo: agentName, assigneeIds: [agentName] });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await addComment({ from: "Ron", content: commentText.trim(), taskId });
      setCommentText("");
    } catch (e) { console.error("Failed to add comment:", e); }
    finally { setSending(false); }
  };

  const priColor = PRI[task.priority]?.c || "#6b6055";
  const statuses = ["inbox", "assigned", "in_progress", "review", "done", "blocked"];

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: "min(520px, 90vw)", zIndex: 200,
      background: "#1a1714", borderLeft: "2px solid rgba(245,158,11,0.15)", display: "flex", flexDirection: "column",
      boxShadow: "-16px 0 50px rgba(0,0,0,0.5)", animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)"
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f0ebe3", fontFamily: V.d, flex: 1, marginRight: 12, lineHeight: 1.3 }}>{task.title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.04)", border: "none", borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: "#7a7068", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={task.status} onChange={e => handleStatusChange(e.target.value)} style={{
            padding: "4px 8px", borderRadius: 6, fontSize: 10, fontFamily: V.m, fontWeight: 600, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", color: "#e8ddd0", border: "1px solid rgba(255,255,255,0.1)", outline: "none",
          }}>
            {statuses.map(s => <option key={s} value={s}>{MC_COLS.find(c => c.key === s)?.label || s}</option>)}
          </select>
          <select value={task.assignedTo} onChange={e => handleAssign(e.target.value)} style={{
            padding: "4px 8px", borderRadius: 6, fontSize: 10, fontFamily: V.m, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", color: "#e8ddd0", border: "1px solid rgba(255,255,255,0.1)", outline: "none",
          }}>
            <option value="unassigned">Unassigned</option>
            {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: `${priColor}15`, color: priColor, fontFamily: V.m, fontWeight: 600 }}>
            {PRI[task.priority]?.l || task.priority}
          </span>
          {task.type && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "#6b6055", fontFamily: V.m }}>{task.type}</span>}
          {task.tags?.map(tg => <span key={tg} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 12, background: "rgba(255,255,255,0.04)", color: "#5a5047", fontFamily: V.m }}>{tg}</span>)}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
        {/* Description */}
        {task.description && (
          <div style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m, letterSpacing: 1, marginBottom: 6 }}>DESCRIPTION</div>
            <p style={{ fontSize: 13, color: "#a89880", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{task.description}</p>
          </div>
        )}

        {/* Comments */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m, letterSpacing: 1, marginBottom: 10 }}>
            COMMENTS ({comments.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {comments.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: "#3a3530", fontStyle: "italic", fontSize: 12 }}>
                No comments yet. Start the conversation.
              </div>
            )}
            {comments.map((c, i) => {
              const cStyle = agentAvatarStyle[c.from];
              return (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <AgentAv id={c.from} size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cStyle?.color || "#F59E0B" }}>{c.from}</span>
                      <span style={{ fontSize: 9, color: "#3a3530", fontFamily: V.m }}>
                        {new Date(c.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#a89880", margin: 0, lineHeight: 1.5 }}>{c.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={commentsEnd} />
          </div>
        </div>

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>
              DELIVERABLES ({deliverables.length})
            </div>
            {deliverables.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>{d.type === "code" ? "💻" : d.type === "documentation" ? "📄" : d.type === "analysis" ? "📊" : "📦"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#c4b8a8" }}>{d.description}</div>
                  <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>{d.path}</div>
                </div>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: d.status === "deployed" ? "#10B98115" : "rgba(255,255,255,0.04)", color: d.status === "deployed" ? "#10B981" : "#5a5047", fontFamily: V.m }}>{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div style={{ padding: "10px 20px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", gap: 8 }}>
        <input value={commentText} onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleComment()}
          placeholder="Add a comment... (use @agent-name to mention)"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.15)", color: "#e8ddd0", fontSize: 13, outline: "none", fontFamily: V.b }} />
        <button onClick={handleComment} disabled={!commentText.trim() || sending} style={{
          padding: "10px 16px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 12, cursor: commentText.trim() && !sending ? "pointer" : "default", fontFamily: V.m,
          background: commentText.trim() && !sending ? "linear-gradient(135deg, #F59E0B, #F59E0Bcc)" : "rgba(255,255,255,0.04)",
          color: commentText.trim() && !sending ? "#16140f" : "#4a4540",
        }}>{sending ? "..." : "Send"}</button>
      </div>
    </div>
  );
}

// ─── CONTEXT MENU ────────────────────────────────────────────

function ContextMenu({ x, y, taskId, onClose }: { x: number; y: number; taskId: Id<"tasks">; onClose: () => void }) {
  const updateStatus = useMutation(api.taskMutationsV2.updateStatusV2);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleMove = async (status: string) => {
    await updateStatus({ id: taskId, status: status as any });
    onClose();
  };

  return (
    <div ref={ref} style={{
      position: "fixed", left: x, top: y, zIndex: 250, background: "#1e1b16",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 4, minWidth: 160,
      boxShadow: "0 8px 30px rgba(0,0,0,0.5)", animation: "fadeIn 0.15s ease"
    }}>
      <div style={{ padding: "6px 10px", fontSize: 9, color: "#4a4540", fontFamily: V.m, letterSpacing: 1 }}>MOVE TO</div>
      {MC_COLS.map(col => (
        <button key={col.key} onClick={() => handleMove(col.key)} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px",
          background: "transparent", border: "none", color: "#c4b8a8", fontSize: 12,
          cursor: "pointer", borderRadius: 6, textAlign: "left", fontFamily: V.b,
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontSize: 12, opacity: 0.5 }}>{col.icon}</span>
          {col.label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MISSION CONTROL — MAIN PAGE
// ═══════════════════════════════════════════════════════════════

function MCPage() {
  const [centerView, setCenterView] = useState<"board" | "list" | "approvals">("board");
  const [selAgent, setSelAgent] = useState<MCAgentType | null>(null);
  const [selTaskId, setSelTaskId] = useState<Id<"tasks"> | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; taskId: Id<"tasks"> } | null>(null);

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

  const actIcons: Record<string, string> = {
    task_created: "📝", task_assigned: "👤", task_status_changed: "🔄",
    message_sent: "💬", document_created: "📄", bug_filed: "🐛",
    fix_deployed: "🚀", agent_heartbeat: "💓",
    task_started: "▶️", task_completed: "✅", alert_sent: "⚠️", doc_suggested: "📝"
  };

  const timeAgo = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ display: "flex", gap: 0, height: "100%", animation: "fadeIn 0.4s ease" }}>

      {/* ═══ LEFT PANEL: AGENT SIDEBAR ═══ */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontFamily: V.m, color: "#5a5047", letterSpacing: 1 }}>AGENTS</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", animation: "breathe 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#10B981", fontFamily: V.m }}>
              {activeAgents.filter(a => a.status === "active").length}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {activeAgents.map((a) => {
            const t = displayTasks.find(x => x.id === a.task);
            const hbColor = a.hb < 5 ? "#10B981" : a.hb < 15 ? "#F59E0B" : "#EF4444";
            const levelBadge = a.level === "lead" ? "LEAD" : a.level === "specialist" ? "SPC" : "INT";
            return (
              <div
                key={a.id}
                onClick={() => setSelAgent(a)}
                style={{
                  padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                  marginBottom: 2, transition: "all 0.15s",
                  borderLeft: `2px solid ${a.color}25`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 9,
                    background: `linear-gradient(135deg, ${a.color}20, ${a.color}40)`,
                    border: `1px solid ${a.color}25`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 13, flexShrink: 0, position: "relative"
                  }}>
                    {a.emoji}
                    <div style={{
                      position: "absolute", bottom: -1, right: -1, width: 6, height: 6, borderRadius: "50%",
                      background: a.status === "active" ? "#10B981" : a.status === "blocked" ? "#EF4444" : "#4a4540",
                      border: "1.5px solid #16140f"
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e8ddd0", fontFamily: V.d }}>{a.name}</span>
                      <span style={{
                        fontSize: 7, padding: "1px 4px", borderRadius: 3,
                        background: `${a.color}15`, color: a.color, fontFamily: V.m, fontWeight: 600, letterSpacing: 0.5
                      }}>{levelBadge}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#4a4540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t ? t.title.slice(0, 35) : a.role}
                    </div>
                  </div>
                  <span style={{ fontSize: 9, color: hbColor, fontFamily: V.m, flexShrink: 0 }}>♡ {a.hb}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ CENTER PANEL: MISSION QUEUE ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Center header */}
        <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {(["board", "list", "approvals"] as const).map(v => (
              <Btn key={v} active={centerView === v} onClick={() => setCenterView(v)} style={{ fontSize: 11, padding: "4px 10px" }}>
                {v === "board" ? "⊞ Board" : v === "list" ? "☰ List" : `✓ Approvals${pendingApprovals.length > 0 ? ` (${pendingApprovals.length})` : ""}`}
              </Btn>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setShowNewTask(true)} style={{
              padding: "5px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "linear-gradient(135deg, #F59E0B, #EF4444)", color: "#16140f", fontFamily: V.m,
            }}>+ New Task</button>
          </div>
        </div>

        {/* Center content */}
        <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
          {/* BOARD VIEW */}
          {centerView === "board" && (
            <div style={{ display: "flex", gap: 8, minWidth: "min-content", height: "100%" }}>
              {MC_COLS.map(col => {
                const ct = displayTasks.filter(t => t.status === col.key);
                return (
                  <div key={col.key} style={{ flex: "1 1 0", minWidth: 160, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, opacity: 0.3 }}>{col.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: "#7a7068", fontFamily: V.m, letterSpacing: 1, textTransform: "uppercase" }}>{col.label}</span>
                      <span style={{ fontSize: 9, color: "#3a3530", fontFamily: V.m, marginLeft: "auto",
                        background: ct.length > 0 ? "rgba(255,255,255,0.05)" : "transparent",
                        padding: ct.length > 0 ? "1px 5px" : 0, borderRadius: 4
                      }}>{ct.length}</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, overflowY: "auto" }}>
                      {ct.map(t => (
                        <div
                          key={t.id}
                          onClick={() => setSelTaskId(t.id as Id<"tasks">)}
                          onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, taskId: t.id as Id<"tasks"> }); }}
                          style={{
                            padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                            transition: "all 0.15s", position: "relative",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.045)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 5 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#f0ebe3", lineHeight: 1.3, flex: 1 }}>{t.title}</span>
                            <span style={{
                              fontSize: 7, padding: "2px 5px", borderRadius: 4, flexShrink: 0,
                              background: `${PRI[t.priority]?.c || "#6b6055"}12`, color: PRI[t.priority]?.c || "#6b6055", fontFamily: V.m
                            }}>{PRI[t.priority]?.l || "---"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 3 }}>
                              {t.tags.slice(0, 2).map(tg => (
                                <span key={tg} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 10, background: "rgba(255,255,255,0.04)", color: "#5a5047", fontFamily: V.m }}>{tg}</span>
                              ))}
                            </div>
                            <div style={{ display: "flex" }}>
                              {t.assignees.map((a, i) => (
                                <div key={a} style={{ marginLeft: i ? -4 : 0 }}><AgentAv id={a} size={16} /></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      {ct.length === 0 && (
                        <div style={{ padding: 14, textAlign: "center", fontSize: 10, color: "#2a2520", fontStyle: "italic", border: "1px dashed rgba(255,255,255,0.04)", borderRadius: 10, margin: "0 4px" }}>
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {centerView === "list" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 70px", gap: 8, padding: "4px 8px", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: "#4a4540", fontFamily: V.m, letterSpacing: 1 }}>TASK</span>
                <span style={{ fontSize: 9, color: "#4a4540", fontFamily: V.m, letterSpacing: 1 }}>ASSIGNEE</span>
                <span style={{ fontSize: 9, color: "#4a4540", fontFamily: V.m, letterSpacing: 1 }}>STATUS</span>
                <span style={{ fontSize: 9, color: "#4a4540", fontFamily: V.m, letterSpacing: 1 }}>PRI</span>
              </div>
              {displayTasks.map((t, i) => (
                <div key={t.id} onClick={() => setSelTaskId(t.id as Id<"tasks">)}
                  onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, taskId: t.id as Id<"tasks"> }); }}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 100px 70px", gap: 8, padding: "8px 8px",
                    borderRadius: 8, cursor: "pointer", transition: "background 0.15s",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 12, color: "#e8ddd0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {t.assignees[0] && <AgentAv id={t.assignees[0]} size={16} />}
                    <span style={{ fontSize: 10, color: "#6b6055", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.assignees[0] || "—"}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#6b6055", fontFamily: V.m }}>{MC_COLS.find(c => c.key === t.status)?.label || t.status}</span>
                  <span style={{ fontSize: 9, color: PRI[t.priority]?.c || "#6b6055", fontFamily: V.m, fontWeight: 600 }}>{PRI[t.priority]?.l || "---"}</span>
                </div>
              ))}
              {displayTasks.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: "#3a3530", fontStyle: "italic", fontSize: 12 }}>
                  No tasks yet. Click "+ New Task" to create one.
                </div>
              )}
            </div>
          )}

          {/* APPROVALS VIEW */}
          {centerView === "approvals" && (
            <div>
              <Lbl>Document Suggestions — Agent Knowledge Refinement</Lbl>
              {pendingApprovals.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>No pending approvals</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendingApprovals.map((approval: any, i: number) => {
                  const sug = approval.suggestion || approval;
                  const filePath = sug.filePath || approval.title || "Unknown";
                  const fileName = filePath.split('/').pop();
                  return (
                    <Cd key={approval.taskId || i} style={{ borderLeft: "2px solid #F59E0B30", animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#f0ebe3", marginBottom: 3 }}>📝 {fileName}</div>
                          <div style={{ fontSize: 10, color: "#5a5047" }}>
                            <span style={{ color: "#F59E0B" }}>Finance Officer</span>
                            {sug.reason && <span> · {sug.reason}</span>}
                          </div>
                        </div>
                      </div>
                      {sug.content && (
                        <div style={{ background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 10, color: "#8a8078", fontFamily: "monospace", maxHeight: 160, overflow: "auto" }}>
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{sug.content}</pre>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleApproval(approval.taskId, "approve")} style={{ padding: "6px 14px", background: "#10B981", color: "white", border: "none", borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: V.m }}>✓ Approve</button>
                        <button onClick={() => handleApproval(approval.taskId, "reject")} style={{ padding: "6px 14px", background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: V.m }}>✗ Reject</button>
                      </div>
                    </Cd>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL: LIVE FEED ═══ */}
      <div style={{
        width: 280, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontFamily: V.m, color: "#5a5047", letterSpacing: 1 }}>LIVE FEED</span>
          <span style={{ fontSize: 9, color: "#3a3530", fontFamily: V.m }}>{displayActivity.length} events</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {displayActivity.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "#3a3530", fontStyle: "italic", fontSize: 11 }}>
              No activity yet. Events will appear as agents work.
            </div>
          )}
          {displayActivity.map((act, i) => {
            const aStyle = agentAvatarStyle[act.agentName];
            return (
              <div key={act.id} style={{
                padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.025)",
                animation: i < 5 ? `fadeSlideIn 0.3s ease ${i * 0.05}s both` : undefined
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{actIcons[act.type] || "📋"}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: aStyle?.color || "#F59E0B" }}>{act.agentName}</span>
                  <span style={{ fontSize: 9, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>{timeAgo(act.timestamp)}</span>
                </div>
                <p style={{ fontSize: 11, color: "#6b6055", margin: "0 0 0 18px", lineHeight: 1.4 }}>{act.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ OVERLAYS ═══ */}

      {/* New Task Modal */}
      {showNewTask && <NewTaskModal agents={activeAgents} onClose={() => setShowNewTask(false)} />}

      {/* Task Detail Panel */}
      {selTaskId && (
        <>
          <div onClick={() => setSelTaskId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 190, backdropFilter: "blur(2px)" }} />
          <TaskDetailPanel taskId={selTaskId} agents={activeAgents} onClose={() => setSelTaskId(null)} />
        </>
      )}

      {/* Agent Console Panel */}
      {selAgent && (
        <>
          <div onClick={() => setSelAgent(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 190, backdropFilter: "blur(2px)" }} />
          <AgentConsole agent={selAgent} onClose={() => setSelAgent(null)} />
        </>
      )}

      {/* Context Menu */}
      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} taskId={ctxMenu.taskId} onClose={() => setCtxMenu(null)} />}
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

        <div style={{ flex: 1, overflow: "hidden" }}>
          <MCPage />
        </div>
      </div>
    </div>
  );
}
