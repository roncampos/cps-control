import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createV2 = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.string(),
    createdBy: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("complete"),
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(
      v.literal("urgent"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("critical")
    ),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    type: v.optional(v.union(
      v.literal("monitor"),
      v.literal("analyze"),
      v.literal("report"),
      v.literal("bug"),
      v.literal("feature"),
      v.literal("doc_suggestion"),
      v.literal("review")
    )),
    assigneeIds: v.optional(v.array(v.string())),
    relatedRockId: v.optional(v.id("rocks")),
    relatedIssueId: v.optional(v.id("issues")),
    relatedPropertyId: v.optional(v.id("properties")),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      tags: args.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const assign = mutation({
  args: {
    id: v.id("tasks"),
    assignedTo: v.string(),
    assigneeIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assignedTo: args.assignedTo,
      assigneeIds: args.assigneeIds,
      status: "assigned",
      updatedAt: Date.now(),
    });
  },
});

export const updateStatusV2 = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("complete"),
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const patch: Record<string, any> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.status === "complete" || args.status === "done") {
      patch.completedAt = now;
    }
    await ctx.db.patch(args.id, patch);
  },
});

export const getUpdatedSince = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.filter((t) => (t.updatedAt ?? t.createdAt) >= args.since);
  },
});

export const addDependencies = mutation({
  args: {
    id: v.id("tasks"),
    dependsOn: v.optional(v.array(v.id("tasks"))),
    blocks: v.optional(v.array(v.id("tasks"))),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.dependsOn) patch.dependsOn = args.dependsOn;
    if (args.blocks) patch.blocks = args.blocks;
    await ctx.db.patch(args.id, patch);
  },
});
