import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUndelivered = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_delivered", (q) => q.eq("delivered", false))
      .collect();
  },
});

export const getUndeliveredForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("mentionedAgentId", args.agentId))
      .collect();
    return all.filter((n) => !n.delivered);
  },
});

export const markDelivered = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { delivered: true });
  },
});

export const markBatchDelivered = mutation({
  args: { ids: v.array(v.id("notifications")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { delivered: true });
    }
  },
});
