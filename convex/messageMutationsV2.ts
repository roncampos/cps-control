import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Extract @mentions from message content
function extractMentions(content: string): string[] {
  const regex = /@(\w[\w-]*)/g;
  const mentions: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

export const createComment = mutation({
  args: {
    from: v.string(),
    content: v.string(),
    taskId: v.id("tasks"),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const mentions = extractMentions(args.content);

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      from: args.from,
      to: "task-thread",
      content: args.content,
      channel: args.channel ?? "internal",
      threadId: args.taskId,
      read: false,
      createdAt: now,
      taskId: args.taskId,
      mentions: mentions.length > 0 ? mentions : undefined,
    });

    // Create notifications for @mentioned agents
    if (mentions.length > 0) {
      const agents = await ctx.db.query("agents").collect();
      for (const mention of mentions) {
        const agent = agents.find(
          (a) =>
            a.name.toLowerCase().replace(/\s+/g, "-") === mention.toLowerCase() ||
            a.sessionKey === `agent:${mention}`
        );
        if (agent) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: agent._id,
            content: args.content,
            taskId: args.taskId,
            messageId,
            delivered: false,
            createdAt: now,
          });
        }
      }
    }

    // Auto-subscribe commenter to thread
    const existingSub = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    // Find the agent record for the commenter
    const agents = await ctx.db.query("agents").collect();
    const commenterAgent = agents.find(
      (a) =>
        a.name.toLowerCase().replace(/\s+/g, "-") === args.from.toLowerCase() ||
        a.sessionKey === `agent:${args.from}`
    );

    if (commenterAgent) {
      const alreadySubscribed = existingSub.some(
        (s) => s.agentId === commenterAgent._id
      );
      if (!alreadySubscribed) {
        await ctx.db.insert("threadSubscriptions", {
          taskId: args.taskId,
          agentId: commenterAgent._id,
          subscribedAt: now,
        });
      }
    }

    return messageId;
  },
});

export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
  },
});

export const getCreatedSince = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .collect()
      .then((msgs) => msgs.filter((m) => m.createdAt >= args.since));
  },
});

export const sendDirectMessage = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      from: args.from,
      to: args.to,
      content: args.content,
      channel: "console",
      read: false,
      createdAt: Date.now(),
    });
  },
});
