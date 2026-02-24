import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    state: v.any(),
    resumable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24h auto-expire
    return await ctx.db.insert("checkpoints", {
      ...args,
      createdAt: now,
      expiresAt,
    });
  },
});

export const getLatest = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const checkpoints = await ctx.db
      .query("checkpoints")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(1);
    const checkpoint = checkpoints[0] ?? null;
    // Skip expired checkpoints
    if (checkpoint && checkpoint.expiresAt < Date.now()) {
      return null;
    }
    return checkpoint;
  },
});

export const deleteByTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const checkpoints = await ctx.db
      .query("checkpoints")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const cp of checkpoints) {
      await ctx.db.delete(cp._id);
    }
    return { deleted: checkpoints.length };
  },
});
