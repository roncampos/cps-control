import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getBySessionKey = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_session_key", (q) => q.eq("sessionKey", args.sessionKey))
      .first();
  },
});

export const getUpdatedSince = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.filter((a) => a.lastHeartbeat >= args.since);
  },
});
