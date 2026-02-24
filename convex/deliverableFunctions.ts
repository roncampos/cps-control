import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    type: v.union(
      v.literal("code"),
      v.literal("documentation"),
      v.literal("analysis"),
      v.literal("data"),
      v.literal("design")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("deployed")
    ),
    path: v.string(),
    description: v.string(),
    createdBy: v.id("agents"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deliverables", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliverables")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("deliverables"),
    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("deployed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
