import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ==========================================
  // EOS STRATEGIC LAYER
  // ==========================================

  // Vision/Traction Organizer - the foundational EOS document
  vto: defineTable({
    section: v.string(), // "core_values", "core_focus", "10_year_target", "marketing_strategy", "3_year_picture", "1_year_plan", "quarterly_rocks", "issues_list"
    content: v.string(), // markdown content
    lastUpdated: v.number(), // timestamp
    updatedBy: v.string(), // who updated it
    quarter: v.optional(v.string()), // e.g. "2026-Q1"
  }).index("by_section", ["section"]),

  // Quarterly Rocks - 90-day priorities
  rocks: defineTable({
    title: v.string(),
    owner: v.string(),
    quarter: v.string(), // "2026-Q1"
    status: v.union(
      v.literal("on_track"),
      v.literal("off_track"),
      v.literal("at_risk"),
      v.literal("complete"),
      v.literal("dropped")
    ),
    progress: v.number(), // 0-100
    successCriteria: v.array(v.object({
      description: v.string(),
      complete: v.boolean(),
    })),
    blockers: v.optional(v.string()),
    dueDate: v.number(), // timestamp
    lastUpdated: v.number(),
    weeklyUpdates: v.array(v.object({
      week: v.string(),
      progress: v.number(),
      notes: v.string(),
      updatedAt: v.number(),
    })),
  })
    .index("by_quarter", ["quarter"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"]),

  // Weekly Scorecard - KPIs tracked weekly
  scorecard: defineTable({
    metric: v.string(), // e.g. "Contracts Signed"
    department: v.string(), // "acquisitions", "marketing", "disposition", "operations"
    owner: v.string(),
    target: v.number(), // weekly target
    actual: v.optional(v.number()), // actual value
    week: v.string(), // "2026-W06"
    status: v.union(
      v.literal("green"),
      v.literal("yellow"),
      v.literal("red"),
      v.literal("pending")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_week", ["week"])
    .index("by_department", ["department"])
    .index("by_metric_week", ["metric", "week"]),

  // Issues List - problems to solve via IDS
  issues: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    raisedBy: v.string(),
    department: v.optional(v.string()),
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
    resolution: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    relatedRockId: v.optional(v.id("rocks")),
    pattern: v.optional(v.string()), // recurring pattern recognition
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_department", ["department"]),

  // L10 Meetings - weekly leadership meetings
  l10s: defineTable({
    date: v.number(), // timestamp
    attendees: v.array(v.string()),
    scorecardReview: v.optional(v.string()), // summary
    rockUpdates: v.optional(v.string()), // summary
    headlines: v.array(v.string()),
    todos: v.array(v.object({
      task: v.string(),
      owner: v.string(),
      dueDate: v.number(),
      complete: v.boolean(),
    })),
    issuesDiscussed: v.array(v.id("issues")),
    duration: v.optional(v.number()), // minutes
  }).index("by_date", ["date"]),

  // Accountability Chart - who owns what
  accountabilityChart: defineTable({
    role: v.string(), // "Visionary", "Integrator", "Marketing Lead", etc.
    person: v.string(),
    department: v.optional(v.string()),
    responsibilities: v.array(v.string()),
    reportsTo: v.optional(v.string()),
    gwoScore: v.optional(v.object({ // Get it, Want it, Capacity
      get: v.boolean(),
      want: v.boolean(),
      capacity: v.boolean(),
    })),
  })
    .index("by_department", ["department"])
    .index("by_person", ["person"]),

  // Processes - documented SOPs and their adherence
  processes: defineTable({
    name: v.string(),
    department: v.string(),
    description: v.string(),
    steps: v.array(v.object({
      order: v.number(),
      description: v.string(),
    })),
    owner: v.string(),
    lastReviewed: v.number(),
    adherenceScore: v.optional(v.number()), // 0-100
    status: v.union(
      v.literal("documented"),
      v.literal("needs_review"),
      v.literal("outdated"),
      v.literal("draft")
    ),
    notionUrl: v.optional(v.string()),
  })
    .index("by_department", ["department"])
    .index("by_status", ["status"]),

  // ==========================================
  // TACTICAL LAYER (DEALS)
  // ==========================================

  // Leads - inbound from marketing
  leads: defineTable({
    source: v.string(), // "driving", "reisift", "referral", "cold_call", "mailer"
    propertyAddress: v.string(),
    sellerName: v.optional(v.string()),
    sellerPhone: v.optional(v.string()),
    sellerEmail: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualifying"),
      v.literal("offer_sent"),
      v.literal("under_contract"),
      v.literal("dead"),
      v.literal("nurture")
    ),
    assignedTo: v.optional(v.string()),
    receivedAt: v.number(),
    firstResponseAt: v.optional(v.number()),
    responseTimeMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    motivation: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_receivedAt", ["receivedAt"]),

  // Properties - under evaluation or contract
  properties: defineTable({
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    county: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    sqft: v.optional(v.number()),
    lotSize: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    arv: v.optional(v.number()), // After Repair Value
    repairEstimate: v.optional(v.number()),
    mao: v.optional(v.number()), // Maximum Allowable Offer
    offerPrice: v.optional(v.number()),
    contractPrice: v.optional(v.number()),
    assignmentFee: v.optional(v.number()),
    status: v.union(
      v.literal("evaluating"),
      v.literal("offer_sent"),
      v.literal("under_contract"),
      v.literal("in_dd"),
      v.literal("marketing_to_buyers"),
      v.literal("assigned"),
      v.literal("closed"),
      v.literal("dead")
    ),
    leadId: v.optional(v.id("leads")),
    ddChecklist: v.optional(v.array(v.object({
      item: v.string(),
      complete: v.boolean(),
      notes: v.optional(v.string()),
    }))),
    closingDate: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_city", ["city"]),

  // Buyers - buyer database
  buyers: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    buyerType: v.union(
      v.literal("investor"),
      v.literal("flipper"),
      v.literal("landlord"),
      v.literal("end_buyer"),
      v.literal("wholesaler")
    ),
    preferredAreas: v.array(v.string()),
    priceRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
    propertyTypes: v.array(v.string()),
    verified: v.boolean(),
    lastActive: v.optional(v.number()),
    dealsCompleted: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_buyerType", ["buyerType"])
    .index("by_verified", ["verified"]),

  // Transactions - closed deals
  transactions: defineTable({
    propertyId: v.id("properties"),
    buyerId: v.optional(v.id("buyers")),
    contractPrice: v.number(),
    assignmentFee: v.number(),
    closingDate: v.number(),
    closingCosts: v.optional(v.number()),
    netProfit: v.optional(v.number()),
    daysToClose: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_closingDate", ["closingDate"]),

  // ==========================================
  // AGENT COORDINATION LAYER
  // ==========================================

  // Tasks - shared task queue with @mentions (v2 fields added as optional)
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.string(), // agent name or person (v1 compat)
    createdBy: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("complete"),
      // v2 statuses
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("review"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("urgent"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      // v2 priority
      v.literal("critical"),
    ),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    relatedRockId: v.optional(v.id("rocks")),
    relatedIssueId: v.optional(v.id("issues")),
    relatedPropertyId: v.optional(v.id("properties")),
    tags: v.array(v.string()),
    // v2 fields
    type: v.optional(v.union(
      v.literal("monitor"),
      v.literal("analyze"),
      v.literal("report"),
      v.literal("bug"),
      v.literal("feature"),
      v.literal("doc_suggestion"),
      v.literal("review"),
    )),
    assigneeIds: v.optional(v.array(v.string())), // v2 multi-assignee (agent names)
    updatedAt: v.optional(v.number()),
    dependsOn: v.optional(v.array(v.id("tasks"))),
    blocks: v.optional(v.array(v.id("tasks"))),
    context: v.optional(v.any()), // free-form JSON for task-specific data
  })
    .index("by_assignedTo", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_createdAt", ["createdAt"]),

  // Messages - agent-to-agent and agent-to-human comms (v2 fields added as optional)
  messages: defineTable({
    from: v.string(),
    to: v.string(),
    content: v.string(),
    channel: v.optional(v.string()), // "slack", "telegram", "internal"
    threadId: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
    // v2 fields
    taskId: v.optional(v.id("tasks")), // link to task (for comments)
    mentions: v.optional(v.array(v.string())), // @mentioned agent names
  })
    .index("by_to", ["to"])
    .index("by_channel", ["channel"])
    .index("by_createdAt", ["createdAt"])
    .index("by_taskId", ["taskId"]),

  // Activities - activity feed (v2 fields added as optional)
  activities: defineTable({
    actor: v.string(), // agent or person name
    action: v.string(), // "updated_rock", "flagged_issue", "closed_deal", etc.
    description: v.string(),
    entityType: v.optional(v.string()), // "rock", "scorecard", "lead", "property"
    entityId: v.optional(v.string()),
    createdAt: v.number(),
    // v2 fields
    activityType: v.optional(v.union(
      v.literal("task_created"),
      v.literal("task_assigned"),
      v.literal("task_status_changed"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("bug_filed"),
      v.literal("fix_deployed"),
      v.literal("agent_heartbeat"),
    )),
    agentId: v.optional(v.string()), // agent name or ID
    taskId: v.optional(v.id("tasks")),
    metadata: v.optional(v.any()),
  })
    .index("by_actor", ["actor"])
    .index("by_createdAt", ["createdAt"]),

  // Decisions - key decisions made (audit trail)
  decisions: defineTable({
    title: v.string(),
    context: v.string(),
    decision: v.string(),
    madeBy: v.string(),
    madeAt: v.number(),
    relatedIssueId: v.optional(v.id("issues")),
    impact: v.optional(v.string()),
  }).index("by_madeAt", ["madeAt"]),

  // ==========================================
  // MISSION CONTROL V2 — NEW TABLES
  // ==========================================

  // Agent roster — tracks all autonomous agents
  agents: defineTable({
    name: v.string(),                    // "Deal Analyst"
    role: v.string(),                    // "Intelligence Officer"
    sessionKey: v.string(),              // "agent:deal-analyst:main"
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("blocked"),
    ),
    currentTaskId: v.optional(v.id("tasks")),
    lastHeartbeat: v.number(),           // Unix timestamp
    specialty: v.string(),               // "Pattern detection, bottleneck analysis"
    avatar: v.optional(v.string()),      // Emoji
    level: v.union(
      v.literal("intern"),
      v.literal("specialist"),
      v.literal("lead"),
    ),
  }).index("by_session_key", ["sessionKey"]),

  // Notifications — @mention delivery queue
  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
    messageId: v.optional(v.id("messages")),
    delivered: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_agent", ["mentionedAgentId"])
    .index("by_delivered", ["delivered"]),

  // Thread subscriptions — who's following which task threads
  threadSubscriptions: defineTable({
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    subscribedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["agentId"]),

  // Deliverables — what agents produce per task
  deliverables: defineTable({
    taskId: v.id("tasks"),
    type: v.union(
      v.literal("code"),
      v.literal("documentation"),
      v.literal("analysis"),
      v.literal("data"),
      v.literal("design"),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("deployed"),
    ),
    path: v.string(),                     // File path or URL
    description: v.string(),
    createdBy: v.id("agents"),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_task", ["taskId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Checkpoints — crash-recovery state snapshots
  checkpoints: defineTable({
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    state: v.any(),                       // JSON, sanitized of secrets
    resumable: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.number(),                // Auto-expire after 24h
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["agentId"]),
});
