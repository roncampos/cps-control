import { query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// ROCKS QUERIES
// ==========================================

export const getRocksByQuarter = query({
  args: { quarter: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rocks")
      .withIndex("by_quarter", (q) => q.eq("quarter", args.quarter))
      .collect();
  },
});

export const getAllRocks = query({
  handler: async (ctx) => {
    return await ctx.db.query("rocks").collect();
  },
});

// ==========================================
// SCORECARD QUERIES
// ==========================================

export const getScorecardByWeek = query({
  args: { week: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scorecard")
      .withIndex("by_week", (q) => q.eq("week", args.week))
      .collect();
  },
});

export const getScorecardByDepartment = query({
  args: { department: v.string(), week: v.string() },
  handler: async (ctx, args) => {
    const allMetrics = await ctx.db
      .query("scorecard")
      .withIndex("by_week", (q) => q.eq("week", args.week))
      .collect();
    
    return allMetrics.filter((m) => m.department === args.department);
  },
});

// ==========================================
// ISSUES QUERIES
// ==========================================

export const getIssuesByStatus = query({
  args: { 
    status: v.union(
      v.literal("open"),
      v.literal("identified"),
      v.literal("discussed"),
      v.literal("solved"),
      v.literal("dropped")
    ) 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

export const getOpenIssues = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
  },
});

export const getIssuesByPriority = query({
  handler: async (ctx) => {
    const issues = await ctx.db.query("issues").collect();
    // Sort by priority: critical > high > medium > low
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return issues.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },
});

// ==========================================
// TASK QUERIES
// ==========================================

export const listTasks = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allTasks = await ctx.db
      .query("tasks")
      .order("desc")
      .collect();
    
    if (args.status) {
      return allTasks.filter((t) => t.status === args.status);
    }
    return allTasks;
  },
});

export const getTasksByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("complete")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .order("desc")
      .collect();
  },
});

export const getTasksByAssignee = query({
  args: { assignedTo: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo))
      .order("desc")
      .collect();
  },
});

// ==========================================
// ACCOUNTABILITY CHART QUERIES
// ==========================================

export const getAccountabilityChart = query({
  handler: async (ctx) => {
    return await ctx.db.query("accountabilityChart").collect();
  },
});

export const getAccountabilityByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accountabilityChart")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .collect();
  },
});

// ==========================================
// ACTIVITIES QUERIES
// ==========================================

export const getRecentActivities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return activities;
  },
});

// ==========================================
// V2 QUERIES — MISSION CONTROL AGENTS
// ==========================================

export const listAgents = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const listBugs = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").collect();
    return tasks.filter((t) => t.type === "bug");
  },
});

export const getAgentWorkQueue = query({
  args: { assignedTo: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo))
      .order("desc")
      .collect();
    return tasks.filter((t) =>
      t.status !== "complete" && t.status !== "done"
    );
  },
});

export const getTaskComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
  },
});

export const getTaskDeliverables = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliverables")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const getRecentComments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit * 2);
    // Only return messages that are task comments (have taskId)
    return msgs.filter((m) => m.taskId != null).slice(0, limit);
  },
});

export const getDirectMessages = query({
  args: {
    agent: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit * 3); // overfetch to compensate for filtering
    return msgs
      .filter(
        (m) =>
          (m.from === args.agent || m.to === args.agent) &&
          m.channel === "console"
      )
      .slice(0, limit)
      .reverse();
  },
});

// ==========================================
// DASHBOARD SUMMARY
// ==========================================

export const getDashboardSummary = query({
  handler: async (ctx) => {
    const currentQuarter = "2026-Q1";
    const currentWeek = "2026-W06";

    const [rocks, scorecard, openIssues, team] = await Promise.all([
      ctx.db
        .query("rocks")
        .withIndex("by_quarter", (q) => q.eq("quarter", currentQuarter))
        .collect(),
      ctx.db
        .query("scorecard")
        .withIndex("by_week", (q) => q.eq("week", currentWeek))
        .collect(),
      ctx.db
        .query("issues")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect(),
      ctx.db.query("accountabilityChart").collect(),
    ]);

    return {
      rocks: {
        total: rocks.length,
        onTrack: rocks.filter((r) => r.status === "on_track").length,
        offTrack: rocks.filter((r) => r.status === "off_track").length,
        atRisk: rocks.filter((r) => r.status === "at_risk").length,
        complete: rocks.filter((r) => r.status === "complete").length,
        data: rocks,
      },
      scorecard: {
        total: scorecard.length,
        green: scorecard.filter((s) => s.status === "green").length,
        yellow: scorecard.filter((s) => s.status === "yellow").length,
        red: scorecard.filter((s) => s.status === "red").length,
        pending: scorecard.filter((s) => s.status === "pending").length,
        data: scorecard,
      },
      issues: {
        total: openIssues.length,
        critical: openIssues.filter((i) => i.priority === "critical").length,
        high: openIssues.filter((i) => i.priority === "high").length,
        medium: openIssues.filter((i) => i.priority === "medium").length,
        low: openIssues.filter((i) => i.priority === "low").length,
        data: openIssues,
      },
      team: {
        total: team.length,
        data: team,
      },
    };
  },
});
