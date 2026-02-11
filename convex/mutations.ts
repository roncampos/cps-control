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
    blockers: v.optional(v.union(v.string(), v.null())),
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
    actual: v.optional(v.union(v.number(), v.null())),
    week: v.string(),
    status: v.union(
      v.literal("green"),
      v.literal("yellow"),
      v.literal("red"),
      v.literal("pending")
    ),
    notes: v.optional(v.union(v.string(), v.null())),
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
    description: v.optional(v.union(v.string(), v.null())),
    raisedBy: v.string(),
    department: v.optional(v.union(v.string(), v.null())),
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
    resolution: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
    resolvedAt: v.optional(v.union(v.number(), v.null())),
    relatedRockId: v.optional(v.union(v.id("rocks"), v.null())),
    pattern: v.optional(v.union(v.string(), v.null())),
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
    department: v.optional(v.union(v.string(), v.null())),
    responsibilities: v.array(v.string()),
    reportsTo: v.optional(v.union(v.string(), v.null())),
    gwoScore: v.optional(v.union(
      v.object({
        get: v.boolean(),
        want: v.boolean(),
        capacity: v.boolean(),
      }),
      v.null()
    )),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accountabilityChart", args);
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
    entityType: v.optional(v.union(v.string(), v.null())),
    entityId: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});
