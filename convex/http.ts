import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ==========================================
// AUTH HELPER
// ==========================================

function checkAuth(request: Request): Response | null {
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = process.env.CONVEX_HTTP_SECRET || "cps-mc-secret-2026";
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

// ==========================================
// V1 ENDPOINTS (existing, preserved)
// ==========================================

// POST /tasks - called by Railway MC to create tasks
http.route({
  path: "/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

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
      headers: JSON_HEADERS,
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
      headers: JSON_HEADERS,
    });
  }),
});

// ==========================================
// V2 ENDPOINTS — AGENT ORCHESTRATION
// ==========================================

// POST /agents/status — agent heartbeat + status update
http.route({
  path: "/agents/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const agentId = await ctx.runMutation(api.agentMutations.updateStatus, {
      sessionKey: body.sessionKey,
      status: body.status,
      currentTaskId: body.currentTaskId,
    });

    return new Response(JSON.stringify({ success: true, agentId }), {
      headers: JSON_HEADERS,
    });
  }),
});

// GET /agents — list all agents
http.route({
  path: "/agents",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const agents = await ctx.runQuery(api.agentQueries.list, {});
    return new Response(JSON.stringify({ agents }), {
      headers: JSON_HEADERS,
    });
  }),
});

// GET /changes — efficient delta polling (Veritas pattern)
http.route({
  path: "/changes",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const since = Number(url.searchParams.get("since") || "0");

    const [agents, tasks, messages, activities] = await Promise.all([
      ctx.runQuery(api.agentQueries.getUpdatedSince, { since }),
      ctx.runQuery(api.taskMutationsV2.getUpdatedSince, { since }),
      ctx.runQuery(api.messageMutationsV2.getCreatedSince, { since }),
      ctx.runQuery(api.activityFunctions.getCreatedSince, { since }),
    ]);

    return new Response(
      JSON.stringify({ agents, tasks, messages, activities, since, now: Date.now() }),
      { headers: JSON_HEADERS }
    );
  }),
});

// POST /tasks/v2 — create v2 task with full schema
http.route({
  path: "/tasks/v2",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const taskId = await ctx.runMutation(api.taskMutationsV2.createV2, {
      title: body.title || "Untitled Task",
      description: body.description,
      assignedTo: body.assignedTo || body.createdBy || "team",
      createdBy: body.createdBy || "api",
      status: body.status || "inbox",
      priority: body.priority || "medium",
      dueDate: body.dueDate,
      tags: body.tags,
      type: body.type,
      assigneeIds: body.assigneeIds,
      relatedRockId: body.relatedRockId,
      relatedIssueId: body.relatedIssueId,
      relatedPropertyId: body.relatedPropertyId,
      context: body.context,
    });

    // Log activity
    await ctx.runMutation(api.activityFunctions.logTyped, {
      actor: body.createdBy || "api",
      action: "created_task",
      description: `Created task: ${body.title}`,
      entityType: "task",
      entityId: taskId,
      activityType: "task_created",
      agentId: body.createdBy,
      taskId: taskId,
    });

    return new Response(JSON.stringify({ success: true, id: taskId }), {
      headers: JSON_HEADERS,
    });
  }),
});

// PATCH /tasks/update — update task status (path params not supported in Convex HTTP, use body)
http.route({
  path: "/tasks/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    await ctx.runMutation(api.taskMutationsV2.updateStatusV2, {
      id: body.id,
      status: body.status,
    });

    // Log activity
    await ctx.runMutation(api.activityFunctions.logTyped, {
      actor: body.actor || "api",
      action: "updated_task_status",
      description: `Task status → ${body.status}`,
      entityType: "task",
      entityId: body.id,
      activityType: "task_status_changed",
      taskId: body.id,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: JSON_HEADERS,
    });
  }),
});

// POST /tasks/comments — add comment with @mention extraction
http.route({
  path: "/tasks/comments",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const messageId = await ctx.runMutation(api.messageMutationsV2.createComment, {
      from: body.from,
      content: body.content,
      taskId: body.taskId,
      channel: body.channel,
    });

    return new Response(JSON.stringify({ success: true, id: messageId }), {
      headers: JSON_HEADERS,
    });
  }),
});

// POST /tasks/checkpoint — save checkpoint
http.route({
  path: "/tasks/checkpoint",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const checkpointId = await ctx.runMutation(api.checkpointFunctions.create, {
      taskId: body.taskId,
      agentId: body.agentId,
      state: body.state,
      resumable: body.resumable ?? true,
    });

    return new Response(JSON.stringify({ success: true, id: checkpointId }), {
      headers: JSON_HEADERS,
    });
  }),
});

// GET /tasks/checkpoint — load latest checkpoint for a task
http.route({
  path: "/tasks/checkpoint",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");
    if (!taskId) {
      return new Response(JSON.stringify({ error: "taskId required" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const checkpoint = await ctx.runQuery(api.checkpointFunctions.getLatest, {
      taskId: taskId as any,
    });

    return new Response(JSON.stringify({ checkpoint }), {
      headers: JSON_HEADERS,
    });
  }),
});

// POST /tasks/deliverables — log a deliverable
http.route({
  path: "/tasks/deliverables",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const deliverableId = await ctx.runMutation(api.deliverableFunctions.create, {
      taskId: body.taskId,
      type: body.type,
      status: body.status || "draft",
      path: body.path,
      description: body.description,
      createdBy: body.createdBy,
      metadata: body.metadata,
    });

    return new Response(JSON.stringify({ success: true, id: deliverableId }), {
      headers: JSON_HEADERS,
    });
  }),
});

// GET /notifications/undelivered — get pending notifications
http.route({
  path: "/notifications/undelivered",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const notifications = await ctx.runQuery(api.notificationFunctions.getUndelivered, {});
    return new Response(JSON.stringify({ notifications }), {
      headers: JSON_HEADERS,
    });
  }),
});

// POST /notifications/deliver — mark notifications as delivered
http.route({
  path: "/notifications/deliver",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    await ctx.runMutation(api.notificationFunctions.markBatchDelivered, {
      ids: body.ids,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: JSON_HEADERS,
    });
  }),
});

// POST /agents/seed — one-time agent seeding
http.route({
  path: "/agents/seed",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const result = await ctx.runMutation(api.agentMutations.seed, {});
    return new Response(JSON.stringify(result), {
      headers: JSON_HEADERS,
    });
  }),
});

export default http;
