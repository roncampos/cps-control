import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRecentTyped = query({
  args: {
    activityType: v.optional(v.union(
      v.literal("task_created"),
      v.literal("task_assigned"),
      v.literal("task_status_changed"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("bug_filed"),
      v.literal("fix_deployed"),
      v.literal("agent_heartbeat"),
      v.literal("orchestrator_reasoning")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit * 2); // over-fetch then filter

    if (args.activityType) {
      return activities
        .filter((a) => a.activityType === args.activityType)
        .slice(0, limit);
    }
    return activities.slice(0, limit);
  },
});

export const getCreatedSince = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_createdAt")
      .order("desc")
      .collect()
      .then((acts) => acts.filter((a) => a.createdAt >= args.since));
  },
});

export const logTyped = mutation({
  args: {
    actor: v.string(),
    action: v.string(),
    description: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    activityType: v.optional(v.union(
      v.literal("task_created"),
      v.literal("task_assigned"),
      v.literal("task_status_changed"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("bug_filed"),
      v.literal("fix_deployed"),
      v.literal("agent_heartbeat"),
      v.literal("orchestrator_reasoning")
    )),
    agentId: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getOrchestratorReasoning = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit * 3);

    return activities
      .filter((a) => a.activityType === "orchestrator_reasoning")
      .slice(0, limit);
  },
});
