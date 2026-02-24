import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    sessionKey: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("blocked")
    ),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_session_key", (q) => q.eq("sessionKey", args.sessionKey))
      .first();
    if (!agent) {
      throw new Error(`Agent not found: ${args.sessionKey}`);
    }
    await ctx.db.patch(agent._id, {
      status: args.status,
      currentTaskId: args.currentTaskId,
      lastHeartbeat: Date.now(),
    });
    return agent._id;
  },
});

export const seed = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) {
      return { seeded: false, message: "Agents already exist", count: existing.length };
    }

    const agents = [
      {
        name: "Nuq",
        role: "Chief of Staff",
        sessionKey: "agent:main",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "Orchestration, delegation, strategic oversight",
        avatar: "🧠",
        level: "lead" as const,
      },
      {
        name: "Deal Analyst",
        role: "Intelligence Officer",
        sessionKey: "agent:deal-analyst",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "Pattern detection, bottleneck analysis, deal evaluation",
        avatar: "📊",
        level: "specialist" as const,
      },
      {
        name: "Follow-up Coach",
        role: "Accountability Partner",
        sessionKey: "agent:followup-coach",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "Lead follow-up, response time tracking, seller communication",
        avatar: "📞",
        level: "specialist" as const,
      },
      {
        name: "EOS Coach",
        role: "Process Guardian",
        sessionKey: "agent:eos-coach",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "Rock tracking, scorecard review, L10 preparation, process adherence",
        avatar: "🎯",
        level: "specialist" as const,
      },
      {
        name: "Finance Officer",
        role: "Numbers Watchdog",
        sessionKey: "agent:finance-officer",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "P&L monitoring, assignment fee analysis, cash flow forecasting",
        avatar: "💰",
        level: "specialist" as const,
      },
      {
        name: "Claude Code",
        role: "Engineering Agent",
        sessionKey: "agent:claude-code",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "Code review, bug fixes, feature implementation, CI/CD",
        avatar: "💻",
        level: "specialist" as const,
      },
      {
        name: "Docs Agent",
        role: "Knowledge Keeper",
        sessionKey: "agent:docs-agent",
        status: "idle" as const,
        lastHeartbeat: Date.now(),
        specialty: "Documentation, RAG indexing, SOP updates, knowledge base",
        avatar: "📚",
        level: "intern" as const,
      },
    ];

    const ids = [];
    for (const agent of agents) {
      const id = await ctx.db.insert("agents", agent);
      ids.push(id);
    }

    return { seeded: true, count: ids.length, ids };
  },
});
