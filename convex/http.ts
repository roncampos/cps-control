import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// POST /tasks - called by Railway MC to create tasks
http.route({
  path: "/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Auth check
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.CONVEX_HTTP_SECRET || "cps-mc-secret-2026";
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json() as any;

    // Map Railway task types/priorities to Convex schema
    const priorityMap: Record<string, string> = {
      critical: "urgent",
      high: "high",
      medium: "medium",
      low: "low",
    };

    const statusMap: Record<string, string> = {
      pending: "pending",
      queued: "pending",
      in_progress: "in_progress",
      blocked: "blocked",
      done: "complete",
      complete: "complete",
    };

    const taskId = await ctx.runMutation(api.mutations.createTask, {
      title: body.title || "Untitled Task",
      description: body.description,
      assignedTo: body.assignedTo || body.createdBy || "team",
      createdBy: body.createdBy || "api",
      status: (statusMap[body.status] || "pending") as any,
      priority: (priorityMap[body.priority] || "medium") as any,
      dueDate: body.dueDate,
      tags: body.tags || (body.type ? [body.type] : []),
    });

    return new Response(JSON.stringify({ success: true, id: taskId }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// GET /tasks - called by Railway to list tasks (optional, dashboard uses Convex directly)
http.route({
  path: "/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const tasks = await ctx.runQuery(api.queries.listTasks, {});
    return new Response(JSON.stringify({ tasks }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
