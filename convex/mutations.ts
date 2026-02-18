import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// ROCK MUTATIONS
// ==========================================

export const createRock = mutation({
  args: {
    title: v.string(),
    owner: v.string(),
    quarter: v.string(),
    status: v.union(
      v.literal("on_track"),
      v.literal("off_track"),
      v.literal("at_risk"),
      v.literal("complete"),
      v.literal("dropped")
    ),
    progress: v.number(),
    successCriteria: v.array(v.object({
      description: v.string(),
      complete: v.boolean(),
    })),
    blockers: v.optional(v.string()),
    dueDate: v.number(),
    lastUpdated: v.number(),
    weeklyUpdates: v.array(v.object({
      week: v.string(),
      progress: v.number(),
      notes: v.string(),
      updatedAt: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rocks", args);
  },
});

// ==========================================
// SCORECARD MUTATIONS
// ==========================================

export const createScorecardMetric = mutation({
  args: {
    metric: v.string(),
    department: v.string(),
    owner: v.string(),
    target: v.number(),
    actual: v.optional(v.number()),
    week: v.string(),
    status: v.union(
      v.literal("green"),
      v.literal("yellow"),
      v.literal("red"),
      v.literal("pending")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scorecard", args);
  },
});

// ==========================================
// ISSUE MUTATIONS
// ==========================================

export const createIssue = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    raisedBy: v.string(),
    department: v.optional(v.string()),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("identified"),
      v.literal("discussed"),
      v.literal("solved"),
      v.literal("dropped")
    ),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    relatedRockId: v.optional(v.id("rocks")),
    pattern: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("issues", args);
  },
});

// ==========================================
// ACCOUNTABILITY CHART MUTATIONS
// ==========================================

export const createAccountabilityRole = mutation({
  args: {
    role: v.string(),
    person: v.string(),
    department: v.optional(v.string()),
    responsibilities: v.array(v.string()),
    reportsTo: v.optional(v.string()),
    gwoScore: v.optional(v.object({
      get: v.boolean(),
      want: v.boolean(),
      capacity: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accountabilityChart", args);
  },
});

// ==========================================
// TASK MUTATIONS
// ==========================================

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.string(),
    createdBy: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("complete")
    ),
    priority: v.union(
      v.literal("urgent"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    dueDate: v.optional(v.number()),
    tags: v.array(v.string()),
    relatedRockId: v.optional(v.id("rocks")),
    relatedIssueId: v.optional(v.id("issues")),
    relatedPropertyId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("complete")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "complete" ? { completedAt: Date.now() } : {}),
    });
  },
});

// ==========================================
// ACTIVITY LOG
// ==========================================

export const logActivity = mutation({
  args: {
    actor: v.string(),
    action: v.string(),
    description: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});
