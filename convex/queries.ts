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
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_status", (q) => q.eq("status", args.status))
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
