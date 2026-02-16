"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// CPS CONTROL v3 — Unified Command Center
// Campos Property Solutions LLC
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ─────────────────────────────────────────────

const V = {
  d: "'Fraunces', serif",
  b: "'Instrument Sans', sans-serif",
  m: "'DM Mono', monospace"
};

const PRI: Record<string, { l: string; c: string }> = {
  critical: { l: "CRIT", c: "#DC2626" },
  high: { l: "HIGH", c: "#EF4444" },
  medium: { l: "MED", c: "#F59E0B" },
  low: { l: "LOW", c: "#6b6055" }
};

const SC = {
  on_track: "#10B981",
  off_track: "#EF4444",
  at_risk: "#F59E0B"
};

// ─── CPS REAL DATA ─────────────────────────────────────────────

const CORE_VALUES = [
  {
    id: "cv1",
    title: "Accountability",
    icon: "🎯",
    color: "#F59E0B",
    desc: "Individual responsibility drives our belief that every person holds the power to shape their own life outcomes. Despite life's challenges, our approach involves taking ownership of our reactions and striving to continuously improve, instead of relying on excuses.",
    behaviors: [
      "Own your outcomes — no excuses",
      "Take responsibility for mistakes and fix them",
      "Follow through on commitments every time",
      "Hold yourself to the same standard you expect from others"
    ]
  },
  {
    id: "cv2",
    title: "Growth",
    icon: "📈",
    color: "#10B981",
    desc: "Adopting a growth mindset, we believe that stagnation leads to decline. This principle applies to both business and life. Daily, we strive for growth across all aspects of our operations, guided by the principle of 'progressive improvement over perfection.'",
    behaviors: [
      "Seek feedback and act on it",
      "Learn something new every week",
      "Progressive improvement over perfection",
      "If you're not growing, you're dying"
    ]
  },
  {
    id: "cv3",
    title: "Transparency / Open-Mindedness",
    icon: "🔓",
    color: "#3B82F6",
    desc: "Valuing Transparency and Open-Mindedness, we believe that access to information empowers everyone to make valuable contributions to the business. Our approach includes implementing an Open Book policy and collaborating with each team to forecast and set business metrics using comprehensive data insights.",
    behaviors: [
      "Share information openly — Open Book policy",
      "Healthy debates are encouraged",
      "Be quick on your feet, pivot when needed",
      "Data-driven decisions over gut feelings"
    ]
  }
];

const VTO = {
  coreFocus: {
    purpose: "To serve as many people in the midlands with real estate problems as possible. We put people over profit and do the right thing.",
    niche: "Distressed residential real estate — wholesaling, fix & flip, and rentals in South Carolina"
  },
  tenYearTarget: "Build up capital and raise enough private money to get into multi-family and commercial real estate deals",
  marketingStrategy: {
    targetMarket: "Homeowners with pain points — pre-foreclosure, probate, tax delinquent, tired landlords, inherited property, distressed property",
    threeUniques: [
      "Genuine care — we point sellers in the right direction even when we're not the solution",
      "Creative deal structures — owner finance, subject-to, novations beyond just cash offers",
      "Sequential boutique marketing — call, text, and direct mail vs. expensive mass advertising"
    ],
    guarantee: "Hassle-free cash offer. No hidden fees. Close within 30 days."
  },
  threeYearPicture: {
    revenue: "$500K+ annual revenue",
    deals: "4+ deals closing per month",
    team: "8-person team with dedicated departments",
    portfolio: "10+ rental properties"
  },
  oneYearPlan: {
    revenue: "Close 2+ deals per month consistently",
    goals: [
      "Fully transition JC to Integrator role",
      "Systematize marketing flow end-to-end",
      "Build AI-powered operations (CPS Second Brain)",
      "Establish consistent social media presence"
    ]
  }
};

const TEAM = [
  {
    id: "ron",
    name: "Ron",
    full: "Ron Campos",
    role: "Visionary",
    dept: "Leadership",
    color: "#F59E0B",
    responsibilities: [
      "Set vision and strategy",
      "External relationships and deals",
      "Major decision-making",
      "Hiring and training"
    ],
    values: ["G", "W", "C"]
  },
  {
    id: "jc",
    name: "JC",
    full: "Joseph Castillo",
    role: "Integrator",
    dept: "Leadership",
    color: "#3B82F6",
    responsibilities: [
      "Run weekly L10s",
      "Manage team accountability",
      "Execute on Rocks and priorities",
      "Marketing & Dispositions Mgr"
    ],
    values: ["G", "W", "C"]
  },
  {
    id: "joey",
    name: "Joey",
    full: "Joey",
    role: "Acquisitions Lead",
    dept: "Acquisitions",
    color: "#10B981",
    responsibilities: [
      "Run calling campaigns",
      "Make offers",
      "Negotiate contracts",
      "Follow up with leads"
    ],
    values: ["G", "W", "C"]
  },
  {
    id: "yulian",
    name: "Yulian",
    full: "Yulian",
    role: "Marketing/Data Admin",
    dept: "Marketing",
    color: "#8B5CF6",
    responsibilities: [
      "Source and upload lead lists",
      "Manage REISift data",
      "Run Siftmap campaigns",
      "Cold calling"
    ],
    values: ["G", "W", "C"]
  }
];

const ROCKS = [
  {
    id: "r1",
    title: "New Marketing Flow Implementation",
    progress: 60,
    status: "on_track" as const,
    owner: "ron",
    milestones: [
      { t: "Siftmap data pipeline live", done: true },
      { t: "SMS workflow documented", done: true },
      { t: "Calling scripts updated", done: true },
      { t: "Team trained on new flow", done: false }
    ],
    blocker: null
  },
  {
    id: "r2",
    title: "JC Integrator Transition",
    progress: 45,
    status: "on_track" as const,
    owner: "ron",
    milestones: [
      { t: "JC running weekly L10s solo", done: false },
      { t: "All integrator tasks delegated", done: false },
      { t: "Ron only doing Visionary work", done: false }
    ],
    blocker: "Need to define clearer handoff checklist"
  },
  {
    id: "r3",
    title: "Social Media Consistency (Spanish TikTok)",
    progress: 20,
    status: "off_track" as const,
    owner: "ron",
    milestones: [
      { t: "3 TikTok posts per week", done: false },
      { t: "Instagram/FB synced daily", done: false },
      { t: "Content calendar template created", done: false }
    ],
    blocker: "Time allocation — need to batch content creation"
  },
  {
    id: "r4",
    title: "Disposition Process Documentation",
    progress: 70,
    status: "on_track" as const,
    owner: "jc",
    milestones: [
      { t: "Buyer vetting SOP updated", done: true },
      { t: "Marketing cadence documented", done: true },
      { t: "Closing checklist finalized", done: false }
    ],
    blocker: null
  },
  {
    id: "r5",
    title: "CPS Second Brain (AI Integration)",
    progress: 75,
    status: "on_track" as const,
    owner: "ron",
    milestones: [
      { t: "Documentation repo synced to Notion", done: true },
      { t: "QuickBooks integration live", done: true },
      { t: "Slack integration (transcripts)", done: true },
      { t: "AI Chief of Staff operational", done: false }
    ],
    blocker: null
  }
];

const SCORECARD_ALL = [
  { metric: "26 CC Hour Threshold Met or Surpassed", owner: "yulian", status: "on_track" as const, group: "team" },
  { metric: "20 hrs Bulk SMS Threshold Met or Surpassed", owner: "joey", status: "on_track" as const, group: "team" },
  { metric: "3 Leads a Week", owner: "yulian", status: "off_track" as const, group: "team" },
  { metric: "3 Leads a Week", owner: "joey", status: "off_track" as const, group: "team" },
  { metric: "4 Offers a Week", owner: "joey", status: "on_track" as const, group: "team" },
  { metric: "Reviewed P&L/KPI's & made 1 decision based on data", owner: "ron", status: "on_track" as const, group: "ron" },
  { metric: "Updated expenses/income by Wednesday", owner: "ron", status: "on_track" as const, group: "ron" },
  { metric: "All Strategic Tasks Accomplished", owner: "ron", status: "on_track" as const, group: "ron" },
  { metric: "Reviewed and Prepped KPI reports and proposed 1 optimization", owner: "jc", status: "on_track" as const, group: "jc" },
  { metric: "Communicated actionable steps this week to team", owner: "jc", status: "on_track" as const, group: "jc" },
  { metric: "Executed strategic moves", owner: "jc", status: "on_track" as const, group: "jc" },
  { metric: "Updated 2026 Q1 Rocks in Notion", owner: "jc", status: "off_track" as const, group: "jc" }
];

const SCORECARD_WEEKLY = [
  { metric: "Contracts Signed", dept: "Acquisitions", owner: "joey", target: 2, actual: null },
  { metric: "Offers Made", dept: "Acquisitions", owner: "joey", target: 15, actual: null },
  { metric: "Calls Made", dept: "Acquisitions", owner: "joey", target: 200, actual: null },
  { metric: "Leads Generated", dept: "Marketing", owner: "yulian", target: 50, actual: null },
  { metric: "Lists Uploaded", dept: "Marketing", owner: "yulian", target: 2, actual: null },
  { metric: "Deals Closed", dept: "Disposition", owner: "jc", target: 1, actual: null },
  { metric: "Buyer Outreach", dept: "Disposition", owner: "jc", target: 30, actual: null },
  { metric: "SOPs Updated", dept: "Operations", owner: "jc", target: 3, actual: null }
];

const ISSUES = [
  {
    id: "i1",
    title: "Need standardized data/documentation processes",
    desc: "Marketing flow changes aren't being documented consistently",
    priority: "high" as const,
    raisedBy: "ron",
    dept: "Operations",
    date: "2026-02-03",
    status: "open" as const
  },
  {
    id: "i2",
    title: "Disposition KPIs need definition",
    desc: "What metrics should we track weekly for disposition?",
    priority: "medium" as const,
    raisedBy: "jc",
    dept: "Disposition",
    date: "2026-02-05",
    status: "open" as const
  },
  {
    id: "i3",
    title: "Social media posting schedule unclear",
    desc: "Who posts what, when? Need clear ownership and cadence",
    priority: "medium" as const,
    raisedBy: "ron",
    dept: "Marketing",
    date: "2026-02-06",
    status: "open" as const
  },
  {
    id: "i4",
    title: "REISift data cleanup — duplicate records",
    desc: "~2K duplicate records across 3 lists",
    priority: "high" as const,
    raisedBy: "jc",
    dept: "Data",
    date: "2026-01-28",
    status: "solved" as const,
    solvedDate: "2026-02-02"
  },
  {
    id: "i5",
    title: "Joey needs structured offer training",
    desc: "Inconsistent offer approach — needs role-play practice",
    priority: "high" as const,
    raisedBy: "ron",
    dept: "Acquisitions",
    date: "2026-01-20",
    status: "solved" as const,
    solvedDate: "2026-01-27"
  }
];

const L10_HISTORY = [
  {
    id: "l1",
    date: "Feb 10, 2026",
    weekNum: 6,
    attendees: ["ron", "jc", "joey", "yulian"],
    rating: 8,
    issuesResolved: 2,
    todosCreated: 4,
    headlines: [
      "Joey hit 4 offers this week",
      "New marketing flow rollout 60% complete",
      "JC presented KPI report — leads off track"
    ]
  },
  {
    id: "l2",
    date: "Feb 3, 2026",
    weekNum: 5,
    attendees: ["ron", "jc", "joey", "yulian"],
    rating: 7,
    issuesResolved: 1,
    todosCreated: 3,
    headlines: [
      "Siftmap pipeline went live",
      "Discussed disposition KPI gaps",
      "Social media still lagging"
    ]
  },
  {
    id: "l3",
    date: "Jan 27, 2026",
    weekNum: 4,
    attendees: ["ron", "jc", "joey"],
    rating: 7,
    issuesResolved: 3,
    todosCreated: 5,
    headlines: [
      "REISift cleanup completed",
      "Joey offer training plan approved",
      "Started CPS Second Brain docs"
    ]
  }
];

const FINANCE = {
  totalCash: 71070.38,
  runway: 3.4
};

// ─── MISSION CONTROL RICH DATA ─────────────────────────────────

const AG = [
  {
    id: "a1",
    name: "Jarvis",
    role: "Squad Lead",
    emoji: "🎯",
    color: "#F59E0B",
    status: "active" as const,
    task: "t2",
    hb: 2,
    level: "Lead",
    stats: { tasksCompleted: 14, avgResponseMin: 3, contributions: 42, streak: 7 },
    memory: {
      currentTask: "Coordinating Q1 content calendar",
      status: "Waiting on Vision's keyword data and Loki's draft outline. Quill hasn't checked in yet.",
      nextSteps: [
        "Follow up with Quill on social content plan",
        "Review Vision's keyword clusters when posted",
        "Compile weekly progress for Ron's standup"
      ],
      lastUpdated: "12 min ago"
    },
    chatHistory: [
      { from: "user" as const, text: "Jarvis, what's the status on the content calendar?", time: "2:15 PM" },
      { from: "agent" as const, text: "Calendar is 60% planned. Vision delivered keyword clusters for 3 of 5 topics. Loki has drafts started on 2 pieces. Quill hasn't submitted social hooks yet — I'll ping him on next heartbeat.", time: "2:15 PM" },
      { from: "user" as const, text: "Push Quill on that. We need the social hooks by EOD.", time: "2:20 PM" },
      { from: "agent" as const, text: "Done. Sent @Quill a priority notification. I've also flagged it in the task thread so there's a paper trail. I'll report back on his next heartbeat check.", time: "2:20 PM" }
    ],
    heartbeats: [
      { time: "2:00 PM", action: "Checked 3 @mentions, delegated SEO task to Vision", type: "work" as const },
      { time: "1:45 PM", action: "Reviewed Loki's blog draft, posted feedback", type: "work" as const },
      { time: "1:30 PM", action: "HEARTBEAT_OK — no pending items", type: "ok" as const },
      { time: "1:15 PM", action: "Compiled activity summary for standup", type: "work" as const },
      { time: "1:00 PM", action: "Assigned G2 analysis to Fury", type: "work" as const },
      { time: "12:45 PM", action: "HEARTBEAT_OK", type: "ok" as const }
    ],
    dependsOn: [],
    blockedBy: ["a6"]
  },
  {
    id: "a2",
    name: "Shuri",
    role: "Product Analyst",
    emoji: "🔍",
    color: "#EC4899",
    status: "active" as const,
    task: "t3",
    hb: 5,
    level: "Specialist",
    stats: { tasksCompleted: 8, avgResponseMin: 7, contributions: 23, streak: 4 },
    memory: {
      currentTask: "Testing competitor free tier UX",
      status: "Signed up for CompetitorX free tier. Documenting onboarding flow — 3 of 6 screens captured.",
      nextSteps: [
        "Complete onboarding documentation",
        "Test credit system limitations",
        "Compare with our flow — find 5 friction points"
      ],
      lastUpdated: "5 min ago"
    },
    chatHistory: [
      { from: "user" as const, text: "Shuri, how does their onboarding compare to ours?", time: "1:30 PM" },
      { from: "agent" as const, text: "Their onboarding is 6 steps vs our 3. They ask for company size and use case upfront — smart for segmentation, but adds friction. I found 2 UX issues: tooltip text is cut off on mobile, and the 'skip' button is nearly invisible. Full report coming when I finish all 6 screens.", time: "1:31 PM" }
    ],
    heartbeats: [
      { time: "1:45 PM", action: "Posted UX finding on Shopify blog task — prerequisites gap", type: "work" as const },
      { time: "1:30 PM", action: "Continued competitor testing — screen 4/6", type: "work" as const },
      { time: "1:15 PM", action: "HEARTBEAT_OK", type: "ok" as const }
    ],
    dependsOn: [],
    blockedBy: []
  },
  {
    id: "a3",
    name: "Fury",
    role: "Researcher",
    emoji: "📋",
    color: "#8B5CF6",
    status: "idle" as const,
    task: null,
    hb: 8,
    level: "Specialist",
    stats: { tasksCompleted: 11, avgResponseMin: 12, contributions: 31, streak: 5 },
    memory: {
      currentTask: "No active task",
      status: "Last completed G2 Competitive Intel Report. Awaiting new research assignment.",
      nextSteps: [
        "Check for new research tasks on next heartbeat",
        "Update long-term memory with competitor pricing data"
      ],
      lastUpdated: "8 min ago"
    },
    chatHistory: [],
    heartbeats: [
      { time: "1:30 PM", action: "HEARTBEAT_OK — no assignments", type: "ok" as const },
      { time: "1:15 PM", action: "HEARTBEAT_OK", type: "ok" as const }
    ],
    dependsOn: [],
    blockedBy: []
  },
  {
    id: "a4",
    name: "Vision",
    role: "SEO Analyst",
    emoji: "📊",
    color: "#06B6D4",
    status: "active" as const,
    task: "t1",
    hb: 1,
    level: "Specialist",
    stats: { tasksCompleted: 9, avgResponseMin: 5, contributions: 28, streak: 6 },
    memory: {
      currentTask: "SEO audit for comparison pages",
      status: "Primary keyword identified (2.4K vol). Working on secondary clusters and content gap analysis.",
      nextSteps: [
        "Pull data on 'chatbot for support' variants per Jarvis",
        "Map competitor content gaps",
        "Post keyword clusters to task thread"
      ],
      lastUpdated: "1 min ago"
    },
    chatHistory: [
      { from: "agent" as const, text: "Found a content gap — no competitor has a dedicated vs. page for Zendesk. Could rank easily. Want me to prioritize that?", time: "1:50 PM" },
      { from: "user" as const, text: "Yes, add it to the board as a new task and assign yourself.", time: "1:52 PM" },
      { from: "agent" as const, text: "Created task 'Zendesk comparison page — SEO brief' and self-assigned. Starting keyword research now.", time: "1:52 PM" }
    ],
    heartbeats: [
      { time: "2:00 PM", action: "Posted keyword data to comparison task thread", type: "work" as const },
      { time: "1:45 PM", action: "Identified Zendesk content gap — created new task", type: "work" as const },
      { time: "1:30 PM", action: "Researching secondary keyword clusters", type: "work" as const }
    ],
    dependsOn: ["a1"],
    blockedBy: []
  },
  {
    id: "a5",
    name: "Loki",
    role: "Content Writer",
    emoji: "✍️",
    color: "#10B981",
    status: "active" as const,
    task: "t4",
    hb: 3,
    level: "Specialist",
    stats: { tasksCompleted: 12, avgResponseMin: 8, contributions: 36, streak: 8 },
    memory: {
      currentTask: "Draft Shopify integration blog post",
      status: "First draft complete (2,100 words). Incorporated Shuri's prerequisite feedback. Awaiting final review.",
      nextSteps: [
        "Work in Vision's SEO keyword",
        "Polish intro hook",
        "Prepare for publication"
      ],
      lastUpdated: "3 min ago"
    },
    chatHistory: [],
    heartbeats: [
      { time: "1:45 PM", action: "Updated draft with Shuri's prerequisite feedback", type: "work" as const },
      { time: "1:30 PM", action: "HEARTBEAT_OK — draft in review", type: "ok" as const }
    ],
    dependsOn: ["a4", "a2"],
    blockedBy: []
  },
  {
    id: "a6",
    name: "Quill",
    role: "Social Media",
    emoji: "📣",
    color: "#F97316",
    status: "idle" as const,
    task: null,
    hb: 12,
    level: "Specialist",
    stats: { tasksCompleted: 6, avgResponseMin: 15, contributions: 14, streak: 2 },
    memory: {
      currentTask: "No active task",
      status: "Content calendar social hooks overdue. Need to submit by EOD per Jarvis.",
      nextSteps: [
        "Draft 10 social hooks for Q1 content",
        "Post to content calendar task thread"
      ],
      lastUpdated: "12 min ago"
    },
    chatHistory: [],
    heartbeats: [
      { time: "1:30 PM", action: "HEARTBEAT_OK", type: "ok" as const },
      { time: "1:15 PM", action: "HEARTBEAT_OK", type: "ok" as const }
    ],
    dependsOn: ["a1"],
    blockedBy: []
  },
  {
    id: "a7",
    name: "Wanda",
    role: "Designer",
    emoji: "🎨",
    color: "#EF4444",
    status: "blocked" as const,
    task: "t6",
    hb: 4,
    level: "Specialist",
    stats: { tasksCompleted: 5, avgResponseMin: 10, contributions: 15, streak: 0 },
    memory: {
      currentTask: "Comparison infographic",
      status: "BLOCKED — waiting on updated brand color palette. Cannot finalize.",
      nextSteps: [
        "Wait for brand palette from team",
        "Once received, finalize design in ~2 heartbeats"
      ],
      lastUpdated: "4 min ago"
    },
    chatHistory: [],
    heartbeats: [
      { time: "1:45 PM", action: "Still blocked — no palette update received", type: "blocked" as const },
      { time: "1:30 PM", action: "Checked for brand palette — still missing", type: "blocked" as const }
    ],
    dependsOn: [],
    blockedBy: []
  },
  {
    id: "a8",
    name: "Pepper",
    role: "Email Mktg",
    emoji: "📧",
    color: "#D946EF",
    status: "active" as const,
    task: "t5",
    hb: 6,
    level: "Specialist",
    stats: { tasksCompleted: 7, avgResponseMin: 6, contributions: 20, streak: 3 },
    memory: {
      currentTask: "Trial onboarding email sequence",
      status: "3 of 5 emails drafted. Email 4 (re-engagement) in progress.",
      nextSteps: [
        "Complete email 4",
        "Draft email 5 (upgrade push)",
        "Post full sequence for review"
      ],
      lastUpdated: "6 min ago"
    },
    chatHistory: [],
    heartbeats: [
      { time: "1:30 PM", action: "Drafting email 4 — re-engagement angle", type: "work" as const },
      { time: "1:15 PM", action: "HEARTBEAT_OK", type: "ok" as const }
    ],
    dependsOn: ["a3"],
    blockedBy: []
  },
  {
    id: "a9",
    name: "Friday",
    role: "Developer",
    emoji: "💻",
    color: "#3B82F6",
    status: "idle" as const,
    task: null,
    hb: 10,
    level: "Specialist",
    stats: { tasksCompleted: 10, avgResponseMin: 4, contributions: 25, streak: 0 },
    memory: {
      currentTask: "No active task",
      status: "Last completed API docs restructure with Wong.",
      nextSteps: ["Available for new assignments"],
      lastUpdated: "10 min ago"
    },
    chatHistory: [],
    heartbeats: [{ time: "1:30 PM", action: "HEARTBEAT_OK", type: "ok" as const }],
    dependsOn: [],
    blockedBy: []
  },
  {
    id: "a10",
    name: "Wong",
    role: "Docs",
    emoji: "📚",
    color: "#84CC16",
    status: "idle" as const,
    task: null,
    hb: 14,
    level: "Specialist",
    stats: { tasksCompleted: 4, avgResponseMin: 9, contributions: 12, streak: 0 },
    memory: {
      currentTask: "No active task",
      status: "API docs restructure completed.",
      nextSteps: ["Awaiting documentation tasks"],
      lastUpdated: "14 min ago"
    },
    chatHistory: [],
    heartbeats: [{ time: "1:30 PM", action: "HEARTBEAT_OK", type: "ok" as const }],
    dependsOn: [],
    blockedBy: []
  }
];

const TASKS_INIT = [
  { id: "t1", title: "SEO audit for comparison pages", status: "in_progress" as const, assignees: ["a4"], priority: "high" as const, tags: ["seo"] },
  { id: "t2", title: "Coordinate Q1 content calendar", status: "in_progress" as const, assignees: ["a1", "a5", "a6"], priority: "high" as const, tags: ["planning"] },
  { id: "t3", title: "Test competitor free tier UX", status: "in_progress" as const, assignees: ["a2"], priority: "medium" as const, tags: ["product"] },
  { id: "t4", title: "Draft Shopify blog post", status: "review" as const, assignees: ["a5"], priority: "medium" as const, tags: ["content"] },
  { id: "t5", title: "Trial onboarding emails", status: "in_progress" as const, assignees: ["a8"], priority: "high" as const, tags: ["email"] },
  { id: "t6", title: "Comparison infographic", status: "blocked" as const, assignees: ["a7"], priority: "low" as const, tags: ["design"] },
  { id: "t7", title: "G2 sentiment analysis", status: "assigned" as const, assignees: ["a3"], priority: "medium" as const, tags: ["research"] },
  { id: "t8", title: "Build in public thread", status: "inbox" as const, assignees: [], priority: "low" as const, tags: ["social"] },
  { id: "t9", title: "API docs restructure", status: "done" as const, assignees: ["a10", "a9"], priority: "medium" as const, tags: ["docs"] }
];

const NOTIFICATIONS = [
  { id: "n1", type: "mention" as const, from: "a4", text: "Found Zendesk content gap — no competitor has a vs. page. Should we prioritize?", time: "30m ago", task: "t1", read: false },
  { id: "n2", type: "review" as const, from: "a5", text: "Shopify blog post first draft ready for your review (2,100 words)", time: "1h ago", task: "t4", read: false },
  { id: "n3", type: "alert" as const, from: "a7", text: "BLOCKED: Comparison infographic waiting on brand palette", time: "1d ago", task: "t6", read: true },
  { id: "n4", type: "mention" as const, from: "a8", text: "Can we use enterprise case study stats in email 3 once published?", time: "3h ago", task: "t5", read: false },
  { id: "n5", type: "milestone" as const, from: "a1", text: "Content calendar planning reached 60% — on schedule", time: "5h ago", task: "t2", read: true }
];

const MC_COLS = [
  { key: "inbox" as const, label: "Inbox", icon: "◇" },
  { key: "assigned" as const, label: "Assigned", icon: "○" },
  { key: "in_progress" as const, label: "In Progress", icon: "◐" },
  { key: "review" as const, label: "Review", icon: "◑" },
  { key: "done" as const, label: "Done", icon: "●" },
  { key: "blocked" as const, label: "Blocked", icon: "⊘" }
];

const tMap: Record<string, typeof TEAM[0]> = {};
TEAM.forEach(t => tMap[t.id] = t);

const aMap: Record<string, typeof AG[0]> = {};
AG.forEach(a => aMap[a.id] = a);

// ═══════════════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════════════

function TeamAv({ id, size = 28 }: { id: string; size?: number }) {
  const t = tMap[id];
  if (!t) return null;
  return (
    <div
      title={t.full}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        background: `linear-gradient(135deg, ${t.color}30, ${t.color}55)`,
        border: `1.5px solid ${t.color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: t.color,
        fontFamily: V.m,
        flexShrink: 0
      }}
    >
      {t.name[0]}
    </div>
  );
}

function AgentAv({ id, size = 24 }: { id: string; size?: number }) {
  const a = aMap[id];
  if (!a) return null;
  return (
    <div
      title={`${a.name} — ${a.role}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        background: `linear-gradient(135deg, ${a.color}25, ${a.color}50)`,
        border: `1.5px solid ${a.color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.46,
        flexShrink: 0,
        position: "relative"
      }}
    >
      {a.emoji}
      <div
        style={{
          position: "absolute",
          bottom: -1,
          right: -1,
          width: 7,
          height: 7,
          borderRadius: "50%",
          background:
            a.status === "active"
              ? "#10B981"
              : a.status === "blocked"
              ? "#EF4444"
              : "#4a4540",
          border: "1.5px solid #16140f"
        }}
      />
    </div>
  );
}

function Ring({ val, size = 40, color = "#F59E0B", sw = 3.5 }: { val: number; size?: number; color?: string; sw?: number }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={c - (val / 100) * c}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

function Bar({ val, color = "#F59E0B", h = 5 }: { val: number; color?: string; h?: number }) {
  return (
    <div style={{ width: "100%", height: h, background: "rgba(255,255,255,0.06)", borderRadius: h / 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(val, 100)}%`, height: "100%", background: color, borderRadius: h / 2, transition: "width 1s" }} />
    </div>
  );
}

function Badge({ status, small }: { status: "on_track" | "off_track"; small?: boolean }) {
  const m = {
    on_track: { l: "On Track", c: "#10B981" },
    off_track: { l: "Off Track", c: "#EF4444" }
  };
  const s = m[status] || m.on_track;
  return (
    <span
      style={{
        fontSize: small ? 9 : 10,
        padding: small ? "2px 7px" : "3px 10px",
        borderRadius: 6,
        background: `${s.c}12`,
        color: s.c,
        border: `1px solid ${s.c}20`,
        fontFamily: V.m,
        letterSpacing: 0.5,
        fontWeight: 600,
        whiteSpace: "nowrap"
      }}
    >
      {s.l.toUpperCase()}
    </span>
  );
}

function Cd({
  children,
  style,
  hover,
  onClick
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: h ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${h ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        padding: 20,
        transition: "all 0.2s",
        cursor: onClick ? "pointer" : "default",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Lbl({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 10,
        ...style,
        color: "#4a4540",
        fontFamily: V.m,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 12,
        fontWeight: 500
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
  onClick
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <Cd hover onClick={onClick} style={{ position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ position: "absolute", top: -6, right: -2, fontSize: 38, opacity: 0.06 }}>{icon}</div>
      <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#f0ebe3", fontFamily: V.d, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: accent, marginTop: 5, fontFamily: V.m }}>{sub}</div>
    </Cd>
  );
}

function Btn({
  children,
  active,
  color = "#F59E0B",
  onClick,
  style: s = {}
}: {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.06)"}`,
        background: active ? color + "10" : "transparent",
        color: active ? color : "#5a5047",
        fontSize: 12,
        fontFamily: V.m,
        cursor: "pointer",
        transition: "all 0.2s",
        fontWeight: active ? 600 : 400,
        ...s
      }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// EOS VIEWS (Compact)
// ═══════════════════════════════════════════════════════════════

function EOSDash({ goTo }: { goTo: (view: string) => void }) {
  const onT = ROCKS.filter(r => r.status === "on_track").length;
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 10, marginBottom: 28 }}>
        <StatCard label="Rocks" value={ROCKS.length} sub={`${onT} on track`} accent="#10B981" icon="🪨" onClick={() => goTo("rocks")} />
        <StatCard
          label="Scorecard"
          value={SCORECARD_ALL.length}
          sub={`${SCORECARD_ALL.filter(s => s.status === "on_track").length} on track`}
          accent="#3B82F6"
          icon="📏"
          onClick={() => goTo("scorecard")}
        />
        <StatCard
          label="Issues"
          value={ISSUES.filter(i => i.status === "open").length}
          sub={`${ISSUES.filter(i => i.priority === "high" && i.status === "open").length} high`}
          accent="#EF4444"
          icon="⚡"
          onClick={() => goTo("issues")}
        />
        <StatCard label="Cash" value={`$${(FINANCE.totalCash / 1000).toFixed(0)}K`} sub={`${FINANCE.runway} mo runway`} accent="#F59E0B" icon="💰" />
      </div>

      <Lbl>Q1 2026 Rocks</Lbl>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 28 }}>
        {ROCKS.map((r, i) => (
          <Cd key={r.id} style={{ animation: `fadeSlideIn 0.4s ease ${i * 0.05}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f0ebe3", flex: 1, lineHeight: 1.3 }}>{r.title}</span>
              <Badge status={r.status} small />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ring val={r.progress} color={SC[r.status]} size={36} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: SC[r.status], fontFamily: V.m }}>{r.progress}%</div>
                <div style={{ fontSize: 10, color: "#5a5047" }}>
                  {r.milestones.filter(m => m.done).length}/{r.milestones.length}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                <TeamAv id={r.owner} size={20} />
                <span style={{ fontSize: 11, color: "#6b6055" }}>{tMap[r.owner]?.name}</span>
              </div>
            </div>
            {r.blocker && (
              <div style={{ marginTop: 10, fontSize: 11, color: "#EF4444", padding: "6px 10px", borderRadius: 7, background: "rgba(239,68,68,0.06)" }}>
                ⚠ {r.blocker}
              </div>
            )}
          </Cd>
        ))}
      </div>

      <Lbl>Open Issues</Lbl>
      <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
        {ISSUES.filter(i => i.status === "open").map(iss => (
          <Cd key={iss.id} style={{ padding: "12px 16px", borderLeft: `3px solid ${PRI[iss.priority].c}`, borderRadius: "0 12px 12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#f0ebe3", marginBottom: 2 }}>{iss.title}</div>
                <div style={{ fontSize: 11, color: "#5a5047" }}>{iss.desc}</div>
              </div>
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 5,
                  background: `${PRI[iss.priority].c}12`,
                  color: PRI[iss.priority].c,
                  fontFamily: V.m,
                  flexShrink: 0
                }}
              >
                {PRI[iss.priority].l}
              </span>
            </div>
          </Cd>
        ))}
      </div>

      <Lbl>Accountability</Lbl>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {TEAM.map((t, i) => (
          <Cd key={t.id} style={{ animation: `fadeSlideIn 0.4s ease ${i * 0.06}s both` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <TeamAv id={t.id} size={32} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.color, fontFamily: V.d }}>{t.name}</div>
                <div style={{ fontSize: 10, color: "#5a5047" }}>{t.role}</div>
              </div>
            </div>
            {t.responsibilities.slice(0, 3).map((r, j) => (
              <div key={j} style={{ fontSize: 11, color: "#7a7068", lineHeight: 1.7, paddingLeft: 8, borderLeft: `2px solid ${t.color}18` }}>
                {r}
              </div>
            ))}
          </Cd>
        ))}
      </div>
    </div>
  );
}

function ValuesView() {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <p style={{ fontSize: 14, color: "#8a8078", lineHeight: 1.7, marginBottom: 24, maxWidth: 600 }}>
        We hire (and fire) based on these must-have traits and ideals.
      </p>
      {CORE_VALUES.map((cv, i) => (
        <Cd
          key={cv.id}
          style={{
            borderLeft: `3px solid ${cv.color}`,
            borderRadius: "0 16px 16px 0",
            padding: 24,
            animation: `fadeSlideIn 0.5s ease ${i * 0.1}s both`,
            marginBottom: 14
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${cv.color}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22
              }}
            >
              {cv.icon}
            </div>
            <h3 style={{ fontFamily: V.d, fontSize: 20, fontWeight: 700, color: "#f0ebe3" }}>{cv.title}</h3>
          </div>
          <p style={{ fontSize: 14, color: "#a89880", lineHeight: 1.8, marginBottom: 16 }}>{cv.desc}</p>
          <Lbl>How we live it</Lbl>
          {cv.behaviors.map((b, j) => (
            <div
              key={j}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 7,
                background: "rgba(255,255,255,0.015)",
                marginBottom: 4
              }}
            >
              <span style={{ color: cv.color, fontSize: 12 }}>→</span>
              <span style={{ fontSize: 13, color: "#c4b8a8" }}>{b}</span>
            </div>
          ))}
        </Cd>
      ))}
    </div>
  );
}

function VTOView() {
  return (
    <div style={{ animation: "fadeIn 0.4s ease", maxWidth: 800 }}>
      <Lbl>Core Focus</Lbl>
      <Cd style={{ marginBottom: 20, borderLeft: "3px solid #F59E0B", borderRadius: "0 14px 14px 0" }}>
        <div style={{ fontSize: 10, color: "#F59E0B", fontFamily: V.m, letterSpacing: 1, marginBottom: 6 }}>PURPOSE</div>
        <p style={{ fontSize: 15, color: "#f0ebe3", lineHeight: 1.7, fontFamily: V.d, fontWeight: 400, fontStyle: "italic" }}>
          {VTO.coreFocus.purpose}
        </p>
        <div style={{ fontSize: 10, color: "#3B82F6", fontFamily: V.m, letterSpacing: 1, marginTop: 16, marginBottom: 6 }}>NICHE</div>
        <p style={{ fontSize: 14, color: "#a89880", lineHeight: 1.6 }}>{VTO.coreFocus.niche}</p>
      </Cd>

      <Lbl>10-Year Target</Lbl>
      <Cd style={{ marginBottom: 20, background: "linear-gradient(135deg, rgba(245,158,11,0.04), rgba(16,185,129,0.03))" }}>
        <p style={{ fontSize: 16, color: "#f0ebe3", fontFamily: V.d, fontWeight: 600 }}>{VTO.tenYearTarget}</p>
      </Cd>

      <Lbl>Marketing Strategy</Lbl>
      <Cd style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>TARGET MARKET</div>
        <p style={{ fontSize: 13, color: "#a89880", lineHeight: 1.6, marginBottom: 16 }}>{VTO.marketingStrategy.targetMarket}</p>
        <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>THREE UNIQUES</div>
        {VTO.marketingStrategy.threeUniques.map((u, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.015)",
              marginBottom: 6
            }}
          >
            <span style={{ color: "#F59E0B", fontFamily: V.m, fontSize: 13 }}>{i + 1}.</span>
            <span style={{ fontSize: 13, color: "#c4b8a8" }}>{u}</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginTop: 16, marginBottom: 6 }}>GUARANTEE</div>
        <p style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>{VTO.marketingStrategy.guarantee}</p>
      </Cd>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Lbl>3-Year Picture</Lbl>
          <Cd>
            {Object.entries(VTO.threeYearPicture).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                  {k}
                </div>
                <div style={{ fontSize: 13, color: "#c4b8a8" }}>{v}</div>
              </div>
            ))}
          </Cd>
        </div>
        <div>
          <Lbl>1-Year Plan</Lbl>
          <Cd>
            <div style={{ fontSize: 14, color: "#f0ebe3", fontWeight: 600, marginBottom: 12 }}>{VTO.oneYearPlan.revenue}</div>
            {VTO.oneYearPlan.goals.map((g, i) => (
              <div key={i} style={{ fontSize: 12, color: "#8a8078", lineHeight: 1.8, paddingLeft: 8, borderLeft: "2px solid rgba(245,158,11,0.15)" }}>
                {g}
              </div>
            ))}
          </Cd>
        </div>
      </div>
    </div>
  );
}

function RocksView() {
  const [exp, setExp] = useState<string | null>(null);
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { l: `${ROCKS.filter(r => r.status === "on_track").length} On Track`, c: "#10B981" },
          { l: `${ROCKS.filter(r => r.status === "off_track").length} Off Track`, c: "#EF4444" }
        ].map((b, i) => (
          <span
            key={i}
            style={{
              fontSize: 11,
              padding: "5px 12px",
              borderRadius: 8,
              background: `${b.c}10`,
              color: b.c,
              border: `1px solid ${b.c}18`,
              fontFamily: V.m
            }}
          >
            {b.l}
          </span>
        ))}
      </div>
      {ROCKS.map((r, i) => {
        const isE = exp === r.id;
        return (
          <Cd
            key={r.id}
            hover
            onClick={() => setExp(isE ? null : r.id)}
            style={{
              borderLeft: `3px solid ${SC[r.status]}`,
              borderRadius: "0 14px 14px 0",
              marginBottom: 10,
              padding: isE ? 24 : "16px 20px",
              animation: `fadeSlideIn 0.4s ease ${i * 0.05}s both`
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Ring val={r.progress} color={SC[r.status]} size={44} sw={4} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#f0ebe3" }}>{r.title}</span>
                  <Badge status={r.status} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: SC[r.status], fontFamily: V.m }}>{r.progress}%</span>
                  <span style={{ color: "#3a3530" }}>·</span>
                  <TeamAv id={r.owner} size={18} />
                  <span style={{ fontSize: 11, color: "#6b6055" }}>{tMap[r.owner]?.name}</span>
                </div>
              </div>
              <span style={{ color: "#4a4540", fontSize: 14, transition: "transform 0.3s", transform: isE ? "rotate(180deg)" : "" }}>↓</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Bar val={r.progress} color={SC[r.status]} />
            </div>
            {isE && (
              <div style={{ marginTop: 18, animation: "fadeIn 0.3s ease" }}>
                <Lbl>Milestones</Lbl>
                {r.milestones.map((m, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 10px",
                      borderRadius: 7,
                      background: m.done ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.01)",
                      marginBottom: 4
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        background: m.done ? "#10B981" : "transparent",
                        border: m.done ? "none" : "2px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                        flexShrink: 0
                      }}
                    >
                      {m.done && "✓"}
                    </div>
                    <span style={{ fontSize: 13, color: m.done ? "#5a5047" : "#c4b8a8", textDecoration: m.done ? "line-through" : "none" }}>
                      {m.t}
                    </span>
                  </div>
                ))}
                {r.blocker && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "10px 14px",
                      borderRadius: 9,
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.1)"
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#EF4444", fontFamily: V.m, letterSpacing: 1, marginBottom: 3 }}>⚠ BLOCKER</div>
                    <div style={{ fontSize: 13, color: "#e8b4b4" }}>{r.blocker}</div>
                  </div>
                )}
              </div>
            )}
          </Cd>
        );
      })}
    </div>
  );
}

function ScorecardView() {
  const [tab, setTab] = useState("weekly");
  const tabs = [
    { k: "weekly", l: "Weekly KPIs" },
    { k: "team", l: "Team" },
    { k: "ron", l: "Ron" },
    { k: "jc", l: "JC" }
  ];
  const data = tab === "weekly" ? [] : SCORECARD_ALL.filter(s => (tab === "team" ? s.group === "team" : s.group === tab));

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <Btn key={t.k} active={tab === t.k} onClick={() => setTab(t.k)}>
            {t.l}
          </Btn>
        ))}
      </div>
      <Cd style={{ padding: 0, overflow: "hidden" }}>
        {tab === "weekly" ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 70px 70px",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 10,
                fontFamily: V.m,
                color: "#4a4540",
                letterSpacing: 1
              }}
            >
              <span>METRIC</span>
              <span>DEPT</span>
              <span>OWNER</span>
              <span style={{ textAlign: "center" }}>TARGET</span>
              <span style={{ textAlign: "center" }}>ACTUAL</span>
            </div>
            {SCORECARD_WEEKLY.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 70px 70px",
                  padding: "11px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: 13, color: "#c4b8a8" }}>{s.metric}</span>
                <span style={{ fontSize: 12, color: "#6b6055" }}>{s.dept}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <TeamAv id={s.owner} size={18} />
                  <span style={{ fontSize: 12, color: "#8a8078" }}>{tMap[s.owner]?.name}</span>
                </div>
                <span style={{ textAlign: "center", fontSize: 12, color: "#8a8078", fontFamily: V.m }}>{s.target}</span>
                <span style={{ textAlign: "center", fontSize: 12, color: "#4a4540", fontFamily: V.m }}>—</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 90px",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 10,
                fontFamily: V.m,
                color: "#4a4540",
                letterSpacing: 1
              }}
            >
              <span>METRIC</span>
              <span>OWNER</span>
              <span style={{ textAlign: "center" }}>STATUS</span>
            </div>
            {data.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr 90px",
                  padding: "11px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: 13, color: "#c4b8a8" }}>{s.metric}</span>
                <span style={{ fontSize: 12, color: "#6b6055" }}>{tMap[s.owner]?.name}</span>
                <div style={{ textAlign: "center" }}>
                  <Badge status={s.status} small />
                </div>
              </div>
            ))}
          </>
        )}
      </Cd>
    </div>
  );
}

function IssuesView() {
  const [f, setF] = useState<"open" | "solved">("open");
  const [d, setD] = useState("all");
  const depts = [...new Set(ISSUES.map(i => i.dept))];
  const list = ISSUES.filter(i => i.status === f && (d === "all" || i.dept === d));

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <Btn active={f === "open"} color="#3B82F6" onClick={() => setF("open")}>
          Open ({ISSUES.filter(i => i.status === "open").length})
        </Btn>
        <Btn active={f === "solved"} color="#10B981" onClick={() => setF("solved")}>
          Solved ({ISSUES.filter(i => i.status === "solved").length})
        </Btn>
        <div style={{ height: 16, width: 1, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />
        {["all", ...depts].map(dep => (
          <button
            key={dep}
            onClick={() => setD(dep)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "none",
              background: d === dep ? "rgba(255,255,255,0.06)" : "transparent",
              color: d === dep ? "#c4b8a8" : "#4a4540",
              fontSize: 11,
              fontFamily: V.m,
              cursor: "pointer"
            }}
          >
            {dep === "all" ? "All" : dep}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {list.length === 0 && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 14, color: "#6b6055" }}>No {f} issues here!</div>
          </div>
        )}
        {list.map((iss, i) => (
          <Cd
            key={iss.id}
            style={{
              padding: "13px 16px",
              borderLeft: `3px solid ${f === "solved" ? "#10B981" : PRI[iss.priority].c}`,
              borderRadius: "0 12px 12px 0",
              animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: f === "solved" ? "#6b6055" : "#f0ebe3",
                    textDecoration: f === "solved" ? "line-through" : "none",
                    marginBottom: 2
                  }}
                >
                  {iss.title}
                </div>
                <div style={{ fontSize: 11, color: "#5a5047" }}>{iss.desc}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "#6b6055", fontFamily: V.m }}>
                    {iss.dept}
                  </span>
                  <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m }}>{iss.date}</span>
                </div>
              </div>
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 5,
                  background: `${PRI[iss.priority].c}10`,
                  color: PRI[iss.priority].c,
                  fontFamily: V.m,
                  flexShrink: 0
                }}
              >
                {PRI[iss.priority].l}
              </span>
            </div>
          </Cd>
        ))}
      </div>
    </div>
  );
}

function L10View() {
  const [exp, setExp] = useState<string | null>(L10_HISTORY[0]?.id);
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {L10_HISTORY.map((l, i) => {
        const isE = exp === l.id;
        return (
          <Cd
            key={l.id}
            hover
            onClick={() => setExp(isE ? null : l.id)}
            style={{ marginBottom: 10, padding: isE ? 22 : "14px 20px", animation: `fadeSlideIn 0.3s ease ${i * 0.06}s both` }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(245,158,11,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: V.m,
                    fontSize: 13,
                    color: "#F59E0B",
                    fontWeight: 700,
                    border: "1px solid rgba(245,158,11,0.12)"
                  }}
                >
                  W{l.weekNum}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ebe3" }}>{l.date}</div>
                  <div style={{ fontSize: 11, color: "#5a5047" }}>Rating: {l.rating}/10</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: "rgba(16,185,129,0.08)", color: "#10B981", fontFamily: V.m }}>
                  {l.issuesResolved} resolved
                </span>
                <span style={{ color: "#4a4540", fontSize: 14, transition: "transform 0.3s", transform: isE ? "rotate(180deg)" : "" }}>↓</span>
              </div>
            </div>
            {isE && (
              <div style={{ marginTop: 14, animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {l.attendees.map(a => (
                    <TeamAv key={a} id={a} size={22} />
                  ))}
                </div>
                {l.headlines.map((h, j) => (
                  <div key={j} style={{ fontSize: 13, color: "#c4b8a8", lineHeight: 1.8, paddingLeft: 10, borderLeft: "2px solid rgba(245,158,11,0.12)" }}>
                    {h}
                  </div>
                ))}
              </div>
            )}
          </Cd>
        );
      })}
    </div>
  );
}

function RecapView() {
  const l = L10_HISTORY[0];
  return (
    <div style={{ animation: "fadeIn 0.4s ease", maxWidth: 700 }}>
      <div style={{ fontSize: 12, color: "#F59E0B", fontFamily: V.m, marginBottom: 18 }}>📊 WEEKLY RECAP — Wk {l.weekNum}</div>
      <Cd style={{ marginBottom: 12, borderLeft: "3px solid #10B981", borderRadius: "0 14px 14px 0" }}>
        <div style={{ fontSize: 10, color: "#10B981", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>✅ ROCKS</div>
        {ROCKS.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 50 }}>
              <Bar val={r.progress} color={SC[r.status]} h={4} />
            </div>
            <span style={{ fontSize: 12, color: SC[r.status], fontFamily: V.m, width: 35 }}>{r.progress}%</span>
            <span style={{ fontSize: 12, color: "#c4b8a8", flex: 1 }}>{r.title}</span>
            <Badge status={r.status} small />
          </div>
        ))}
      </Cd>
      <Cd style={{ marginBottom: 12, borderLeft: "3px solid #EF4444", borderRadius: "0 14px 14px 0" }}>
        <div style={{ fontSize: 10, color: "#EF4444", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>🚫 BLOCKERS</div>
        {ROCKS.filter(r => r.blocker).map(r => (
          <div key={r.id} style={{ fontSize: 12, color: "#e8b4b4", marginBottom: 4 }}>
            • <strong style={{ color: "#c4b8a8" }}>{r.title}:</strong> {r.blocker}
          </div>
        ))}
      </Cd>
      <Cd style={{ borderLeft: "3px solid #F59E0B", borderRadius: "0 14px 14px 0" }}>
        <div style={{ fontSize: 10, color: "#F59E0B", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>📰 L10</div>
        {l.headlines.map((h, i) => (
          <div key={i} style={{ fontSize: 12, color: "#c4b8a8", lineHeight: 1.8 }}>
            • {h}
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 11, color: "#5a5047" }}>
          Rating: <strong style={{ color: "#F59E0B" }}>{l.rating}/10</strong> · {l.issuesResolved} resolved · {l.todosCreated} to-dos
        </div>
      </Cd>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MISSION CONTROL — UPGRADED
// ═══════════════════════════════════════════════════════════════

function AgentConsole({ agent, onClose }: { agent: typeof AG[0] | {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: "active" | "idle" | "blocked";
  task: string | null;
  hb: number;
  level: string;
  stats: { tasksCompleted: number; avgResponseMin: number; contributions: number; streak: number };
  memory: { currentTask: string; status: string; nextSteps: string[]; lastUpdated: string };
  chatHistory: Array<{ from: "user" | "agent"; text: string; time: string }>;
  heartbeats: Array<{ time: string; action: string; type: "work" | "ok" }>;
  dependsOn: string[];
  blockedBy: string[];
}; onClose: () => void }) {
  const [tab, setTab] = useState("chat");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState(agent.chatHistory);
  const a = agent;

  const send = () => {
    if (!msg.trim()) return;
    setChat(p => [...p, { from: "user" as const, text: msg, time: "Now" }]);
    const m = msg;
    setMsg("");
    setTimeout(
      () =>
        setChat(p => [
          ...p,
          {
            from: "agent" as const,
            text: `Acknowledged. Processing: "${m.slice(0, 40)}..." — I'll update the task thread with results.`,
            time: "Now"
          }
        ]),
      800
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(540px, 90vw)",
        zIndex: 200,
        background: "#1a1714",
        borderLeft: `2px solid ${a.color}25`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-16px 0 50px rgba(0,0,0,0.5)",
        animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)"
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AgentAv id={a.id} size={36} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: a.color, fontFamily: V.d }}>{a.name}</div>
              <div style={{ fontSize: 11, color: "#6b6055" }}>
                {a.role} · {a.level}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "none",
              borderRadius: 7,
              width: 30,
              height: 30,
              cursor: "pointer",
              color: "#7a7068",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[
            { k: "chat", l: "💬 Console" },
            { k: "memory", l: "🧠 Memory" },
            { k: "heartbeat", l: "♡ Heartbeat" },
            { k: "stats", l: "📊 Stats" }
          ].map(t => (
            <Btn key={t.k} active={tab === t.k} color={a.color} onClick={() => setTab(t.k)} style={{ fontSize: 11, padding: "5px 10px" }}>
              {t.l}
            </Btn>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {chat.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: "#3a3530", fontStyle: "italic", fontSize: 13 }}>
                No messages yet. Send a command to {a.name}.
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: m.from === "user" ? "rgba(245,158,11,0.2)" : `${a.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    flexShrink: 0,
                    border: `1px solid ${m.from === "user" ? "rgba(245,158,11,0.15)" : a.color + "20"}`
                  }}
                >
                  {m.from === "user" ? "👤" : a.emoji}
                </div>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: m.from === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                    background: m.from === "user" ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${m.from === "user" ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)"}`
                  }}
                >
                  <p style={{ fontSize: 13, color: "#c4b8a8", lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                  <div style={{ fontSize: 10, color: "#3a3530", marginTop: 4, textAlign: m.from === "user" ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "memory" && (
          <div>
            <div style={{ padding: 16, borderRadius: 12, background: `${a.color}06`, border: `1px solid ${a.color}15`, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: a.color, fontFamily: V.m, letterSpacing: 1, marginBottom: 6 }}>📌 CURRENT TASK</div>
              <div style={{ fontSize: 14, color: "#f0ebe3", fontWeight: 600, marginBottom: 8 }}>{a.memory.currentTask}</div>
              <div style={{ fontSize: 10, color: "#5a5047", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>STATUS</div>
              <div style={{ fontSize: 13, color: "#a89880", lineHeight: 1.6 }}>{a.memory.status}</div>
            </div>
            <Lbl>Next Steps</Lbl>
            {a.memory.nextSteps.map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.015)", marginBottom: 4 }}
              >
                <span style={{ color: a.color, fontFamily: V.m, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#c4b8a8" }}>{s}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 10, color: "#3a3530", fontFamily: V.m }}>Last updated: {a.memory.lastUpdated}</div>
          </div>
        )}

        {tab === "heartbeat" && (
          <div>
            {a.heartbeats.map((hb, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ width: 50, flexShrink: 0, textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "#5a5047", fontFamily: V.m }}>{hb.time}</span>
                </div>
                <div style={{ width: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: hb.type === "work" ? a.color : hb.type === "blocked" ? "#EF4444" : "#3a3530",
                      boxShadow: hb.type === "work" ? `0 0 8px ${a.color}40` : "none",
                      flexShrink: 0
                    }}
                  />
                  {i < a.heartbeats.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: hb.type === "ok" ? "#5a5047" : hb.type === "blocked" ? "#EF4444" : "#c4b8a8" }}>{hb.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "stats" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { l: "Tasks Completed", v: a.stats.tasksCompleted, c: "#10B981" },
                { l: "Avg Response", v: `${a.stats.avgResponseMin}m`, c: "#3B82F6" },
                { l: "Contributions", v: a.stats.contributions, c: a.color },
                { l: "Active Streak", v: `${a.stats.streak}d`, c: "#F59E0B" }
              ].map((s, i) => (
                <Cd key={i} style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m, letterSpacing: 1, marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: V.d }}>{s.v}</div>
                </Cd>
              ))}
            </div>
            <Lbl>Activity (7 days)</Lbl>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60, marginBottom: 8 }}>
              {[3, 5, 2, 7, 4, 6, a.stats.streak > 0 ? 5 : 0].map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${(v / 7) * 100}%`,
                    background: `${a.color}${i === 6 ? "60" : "25"}`,
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s",
                    minHeight: 4
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#3a3530", fontFamily: V.m }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat input (always visible on chat tab) */}
      {tab === "chat" && (
        <div style={{ padding: "10px 20px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", gap: 8 }}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`Command ${a.name}...`}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${a.color}20`,
              color: "#e8ddd0",
              fontSize: 13,
              outline: "none",
              fontFamily: V.b
            }}
            onFocus={e => (e.currentTarget.style.borderColor = a.color + "50")}
            onBlur={e => (e.currentTarget.style.borderColor = a.color + "20")}
          />
          <button
            onClick={send}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: msg.trim() ? `linear-gradient(135deg, ${a.color}, ${a.color}cc)` : "rgba(255,255,255,0.04)",
              color: msg.trim() ? "#16140f" : "#4a4540",
              fontWeight: 600,
              fontSize: 12,
              cursor: msg.trim() ? "pointer" : "default",
              fontFamily: V.m
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

function MCPage() {
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [sub, setSub] = useState("board");
  // Allow flexible agent type for both mock and real agents
  type AgentType = typeof AG[0] | {
    id: string;
    name: string;
    role: string;
    emoji: string;
    color: string;
    status: "active" | "idle" | "blocked";
    task: string | null;
    hb: number;
    level: string;
    stats: { tasksCompleted: number; avgResponseMin: number; contributions: number; streak: number };
    memory: { currentTask: string; status: string; nextSteps: string[]; lastUpdated: string };
    chatHistory: Array<{ from: "user" | "agent"; text: string; time: string }>;
    heartbeats: Array<{ time: string; action: string; type: "work" | "ok" }>;
    dependsOn: string[];
    blockedBy: string[];
  };
  const [selAgent, setSelAgent] = useState<AgentType | null>(null);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const unread = notifs.filter(n => !n.read).length;
  
  // Fetch real agents from Mission Control
  const [realAgents, setRealAgents] = useState<any[]>([]);
  const [mcConnected, setMcConnected] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [realTasks, setRealTasks] = useState<any[]>([]);
  const [realActivity, setRealActivity] = useState<any[]>([]);
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  
  const MC_API_URL = process.env.NEXT_PUBLIC_MC_API_URL || "http://localhost:3100";
  
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${MC_API_URL}/status`);
        const data = await res.json();
        setMcConnected(true);
        setRealAgents(data.agents || []);
      } catch (err) {
        console.error("Failed to fetch MC agents:", err);
        setMcConnected(false);
      }
    };
    
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await fetch(`${MC_API_URL}/approvals/pending`);
        const data = await res.json();
        setPendingApprovals(data.suggestions || data.pending || []);
      } catch (err) {
        console.error("Failed to fetch approvals:", err);
      }
    };
    
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);
  
  const handleApproval = async (taskId: string, action: "approve" | "reject") => {
    try {
      await fetch(`${MC_API_URL}/approvals/${taskId}/${action}`, { method: "POST" });
      // Refresh approvals list
      const res = await fetch(`${MC_API_URL}/approvals/pending`);
      const data = await res.json();
      setPendingApprovals(data.suggestions || data.pending || []);
    } catch (err) {
      console.error(`Failed to ${action} approval:`, err);
    }
  };

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${MC_API_URL}/tasks`);
        const data = await res.json();
        setRealTasks(data.tasks || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };
    
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch activity log
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`${MC_API_URL}/activity?limit=100`);
        const data = await res.json();
        setRealActivity(data.activity || []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      }
    };
    
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${MC_API_URL}/alerts`);
        const data = await res.json();
        setRealAlerts(data.alerts || []);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Map real agents to UI format
  const getAgentEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      finance: "💰",
      deals: "🏠",
      operations: "⚙️",
      sales: "📞",
    };
    return emojiMap[type] || "🤖";
  };

  const getAgentColor = (type: string) => {
    const colorMap: Record<string, string> = {
      finance: "#10B981", // green
      deals: "#3B82F6",   // blue
      operations: "#8B5CF6", // purple
      sales: "#F59E0B",   // orange
    };
    return colorMap[type] || "#6B7280";
  };

  const displayAgents = realAgents.map((agent, idx) => ({
    id: agent.id,
    name: agent.name,
    role: agent.type.charAt(0).toUpperCase() + agent.type.slice(1),
    emoji: getAgentEmoji(agent.type),
    color: getAgentColor(agent.type),
    status: agent.status === "idle" ? "idle" as const : "active" as const,
    task: null,
    hb: 0,
    level: "Intern",
    stats: { tasksCompleted: 0, avgResponseMin: 0, contributions: 0, streak: 0 },
    memory: {
      currentTask: agent.currentTask || "No active task",
      status: `Status: ${agent.status}`,
      nextSteps: [],
      lastUpdated: new Date(agent.lastActiveAt).toLocaleString()
    },
    chatHistory: [],
    heartbeats: [],
    dependsOn: [],
    blockedBy: []
  }));
  
  // Use real agents if connected, otherwise fallback to mock
  const activeAgents = mcConnected && displayAgents.length > 0 ? displayAgents : AG;

  // Map Mission Control tasks to board format
  const mapTaskStatus = (mcStatus: string) => {
    const statusMap: Record<string, string> = {
      "queued": "inbox",
      "assigned": "assigned",
      "in_progress": "in_progress",
      "waiting_dependency": "blocked",
      "completed": "done",
      "failed": "blocked",
      "cancelled": "done",
    };
    return statusMap[mcStatus] || "inbox";
  };

  const boardTasks = realTasks.map(t => ({
    id: t.id,
    title: t.title,
    status: mapTaskStatus(t.status),
    assignees: t.assignedTo ? [t.assignedTo] : [],
    priority: t.priority || "medium",
    tags: [t.type],
  }));

  // Use real tasks if available, otherwise mock
  const displayTasks = realTasks.length > 0 ? boardTasks : tasks;

  // Map real alerts to notifications format
  const displayNotifs = realAlerts.length > 0 ? realAlerts.map(a => ({
    id: a.id,
    agent: a.agentName,
    from: a.agentId || "",
    time: new Date(a.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    text: a.message,
    type: a.level === "critical" ? "critical" : a.level === "warning" ? "alert" : "info",
    read: a.read,
    task: "",
  })) : notifs;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { k: "board", l: "⊞ Board" },
          { k: "agents", l: "◎ Agents" },
          { k: "approvals", l: `✓ Approvals ${pendingApprovals.length > 0 ? `(${pendingApprovals.length})` : ""}` },
          { k: "heartbeat", l: "♡ Heartbeat" },
          { k: "deps", l: "🔗 Dependencies" },
          { k: "notifications", l: `🔔 ${displayNotifs.filter(n => !n.read).length > 0 ? `(${displayNotifs.filter(n => !n.read).length})` : ""}` },
          { k: "standup", l: "📊 Standup" }
        ].map(t => (
          <Btn key={t.k} active={sub === t.k} onClick={() => setSub(t.k)}>
            {t.l}
          </Btn>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "breathe 2s infinite" }} />
          <span style={{ fontSize: 11, color: "#10B981", fontFamily: V.m }}>
            {activeAgents.filter(a => a.status === "active").length} active
          </span>
        </div>
      </div>

      <div style={{ overflow: "auto" }}>
        {/* BOARD */}
        {sub === "board" && (
          <div style={{ display: "flex", gap: 8, minWidth: "min-content" }}>
            {MC_COLS.map(col => {
              const ct = displayTasks.filter(t => t.status === col.key);
              return (
                <div
                  key={col.key}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    setTasks(p => p.map(t => (t.id === e.dataTransfer.getData("tid") ? { ...t, status: col.key as any } : t)));
                  }}
                  style={{ flex: "1 1 0", minWidth: 180, maxWidth: 280 }}
                >
                  <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, opacity: 0.3 }}>{col.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#7a7068", fontFamily: V.m, letterSpacing: 1, textTransform: "uppercase" }}>
                      {col.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>{ct.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ct.map(t => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={e => e.dataTransfer.setData("tid", t.id)}
                        style={{
                          padding: "11px 13px",
                          borderRadius: 11,
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          cursor: "grab",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                          e.currentTarget.style.transform = "";
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#f0ebe3", lineHeight: 1.3, flex: 1 }}>{t.title}</span>
                          <span
                            style={{
                              fontSize: 8,
                              padding: "2px 5px",
                              borderRadius: 4,
                              background: `${PRI[t.priority].c}12`,
                              color: PRI[t.priority].c,
                              fontFamily: V.m
                            }}
                          >
                            {PRI[t.priority].l}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: 3 }}>
                            {t.tags.map(tg => (
                              <span
                                key={tg}
                                style={{
                                  fontSize: 9,
                                  padding: "1px 6px",
                                  borderRadius: 12,
                                  background: "rgba(255,255,255,0.04)",
                                  color: "#5a5047",
                                  fontFamily: V.m
                                }}
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex" }}>
                            {t.assignees.map((a, i) => (
                              <div key={a} style={{ marginLeft: i ? -4 : 0 }}>
                                <AgentAv id={a} size={18} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {ct.length === 0 && <div style={{ padding: 14, textAlign: "center", fontSize: 11, color: "#2a2520", fontStyle: "italic" }}>Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AGENTS */}
        {sub === "agents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {activeAgents.map((a, i) => {
              const t = tasks.find(x => x.id === a.task);
              return (
                <Cd
                  key={a.id}
                  hover
                  onClick={() => setSelAgent(a)}
                  style={{
                    animation: `fadeSlideIn 0.3s ease ${i * 0.04}s both`,
                    cursor: "pointer",
                    borderLeft: `2px solid ${a.color}30`,
                    borderRadius: "0 14px 14px 0"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <AgentAv id={a.id} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ebe3", fontFamily: V.d }}>{a.name}</div>
                      <div style={{ fontSize: 10, color: "#5a5047" }}>{a.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 9,
                          color: a.status === "active" ? "#10B981" : a.status === "blocked" ? "#EF4444" : "#4a4540",
                          fontFamily: V.m,
                          textTransform: "uppercase"
                        }}
                      >
                        {a.status}
                      </div>
                      <div style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m }}>♡ {a.hb}m</div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: t ? "#8a8078" : "#3a3530",
                      fontStyle: t ? "normal" : "italic",
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {t ? `📌 ${t.title}` : "No active task"}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>✓{a.stats.tasksCompleted}</span>
                    <span style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>↗{a.stats.contributions}</span>
                    <span style={{ fontSize: 10, color: "#4a4540", fontFamily: V.m }}>⏱{a.stats.avgResponseMin}m</span>
                  </div>
                </Cd>
              );
            })}
          </div>
        )}

        {/* APPROVALS QUEUE */}
        {sub === "approvals" && (
          <div>
            <Lbl>Document Suggestions — Agent Knowledge Refinement</Lbl>
            {pendingApprovals.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>
                No pending approvals
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingApprovals.map((approval: any, i: number) => {
                const sug = approval.suggestion || approval;
                const filePath = sug.filePath || approval.title || "Unknown";
                const fileName = filePath.split('/').pop();
                return (
                <Cd
                  key={approval.taskId || i}
                  style={{
                    animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
                    borderLeft: "2px solid #F59E0B30"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ebe3", marginBottom: 4 }}>
                        📝 {fileName}
                      </div>
                      <div style={{ fontSize: 11, color: "#5a5047", marginBottom: 8 }}>
                        <span style={{ color: "#F59E0B" }}>Finance Officer</span>
                        {sug.reason && (
                          <span style={{ marginLeft: 10 }}>• {sug.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {sug.content && (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 12,
                        fontSize: 11,
                        color: "#8a8078",
                        fontFamily: "monospace",
                        maxHeight: 200,
                        overflow: "auto"
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {sug.content}
                      </pre>
                    </div>
                  )}
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleApproval(approval.taskId, "approve")}
                      style={{
                        padding: "8px 16px",
                        background: "#10B981",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: V.m,
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}
                    >
                      ✓ Approve & Commit
                    </button>
                    <button
                      onClick={() => handleApproval(approval.taskId, "reject")}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#EF4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: V.m,
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </Cd>
              );
              })}
            </div>
          </div>
        )}

        {/* HEARTBEAT MONITOR */}
        {sub === "heartbeat" && (
          <div>
            <Lbl>Agent Activity Log — Real-time monitoring</Lbl>
            {realActivity.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#5a5047", fontStyle: "italic" }}>
                No activity yet. Activity will appear when agents complete tasks.
              </div>
            )}
            {realActivity.map((act, i) => (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  marginBottom: 6,
                  animation: `fadeSlideIn 0.3s ease ${i * 0.03}s both`
                }}
              >
                <div style={{ fontSize: 16, width: 24, textAlign: "center" }}>
                  {act.type === "task_started" ? "▶️" : act.type === "task_completed" ? "✅" : act.type === "alert_sent" ? "⚠️" : act.type === "doc_suggested" ? "📝" : "💓"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>{act.agentName}</span>
                    <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>
                      {new Date(act.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#8a8078", margin: 0, lineHeight: 1.5 }}>{act.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DEPENDENCIES */}
        {sub === "deps" && (
          <div>
            <Lbl>Agent Dependencies — Who's waiting on whom</Lbl>
            {activeAgents.filter(a => a.dependsOn.length > 0 || a.blockedBy.length > 0).map((a, i) => (
              <Cd
                key={a.id}
                style={{
                  marginBottom: 10,
                  padding: "14px 18px",
                  borderLeft: `2px solid ${a.color}30`,
                  borderRadius: "0 14px 14px 0",
                  animation: `fadeSlideIn 0.3s ease ${i * 0.06}s both`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <AgentAv id={a.id} size={26} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: a.color, fontFamily: V.d }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}>({a.role})</span>
                </div>
                {a.dependsOn.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#5a5047", width: 80 }}>Depends on:</span>
                    {a.dependsOn.map(d => {
                      const dep = aMap[d];
                      return (
                        <span
                          key={d}
                          style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: `${dep?.color}10`, color: dep?.color, fontFamily: V.m }}
                        >
                          {dep?.emoji} {dep?.name}
                        </span>
                      );
                    })}
                  </div>
                )}
                {a.blockedBy.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#EF4444", width: 80 }}>Blocked by:</span>
                    {a.blockedBy.map(d => {
                      const dep = aMap[d];
                      return (
                        <span
                          key={d}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "rgba(239,68,68,0.08)",
                            color: "#EF4444",
                            fontFamily: V.m
                          }}
                        >
                          {dep?.emoji} {dep?.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </Cd>
            ))}
            {activeAgents.filter(a => a.dependsOn.length === 0 && a.blockedBy.length === 0 && a.status !== "idle").length > 0 && (
              <>
                <Lbl style={{ marginTop: 20 }}>Independent (no dependencies)</Lbl>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {activeAgents.filter(a => a.dependsOn.length === 0 && a.blockedBy.length === 0).map(a => (
                    <span
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        fontSize: 12,
                        color: "#8a8078"
                      }}
                    >
                      <AgentAv id={a.id} size={18} />
                      {a.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {sub === "notifications" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#8a8078" }}>{displayNotifs.filter(n => !n.read).length} unread</span>
              <button
                onClick={async () => {
                  if (realAlerts.length > 0) {
                    for (const alert of displayNotifs.filter(n => !n.read)) {
                      await fetch(`${MC_API_URL}/alerts/${alert.id}/read`, { method: "POST" });
                    }
                  } else {
                    setNotifs(p => p.map(n => ({ ...n, read: true })));
                  }
                }}
                style={{ fontSize: 11, color: "#F59E0B", background: "none", border: "none", cursor: "pointer", fontFamily: V.m }}
              >
                Mark all read
              </button>
            </div>
            {displayNotifs.map((n, i) => {
              const icons: Record<string, string> = { mention: "💬", review: "👁", alert: "⚠️", critical: "🚨", info: "💡", milestone: "✓" };
              return (
                <div
                  key={n.id}
                  onClick={async () => {
                    if (realAlerts.length > 0) {
                      await fetch(`${MC_API_URL}/alerts/${n.id}/read`, { method: "POST" });
                    } else {
                      setNotifs(p => p.map(x => (x.id === n.id ? { ...x, read: true } : x)));
                    }
                  }}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: n.read ? "transparent" : "rgba(245,158,11,0.03)",
                    borderLeft: n.read ? "3px solid transparent" : `3px solid #F59E0B`,
                    marginBottom: 4,
                    cursor: "pointer",
                    animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icons[n.type] || "💡"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>{"agent" in n ? n.agent : aMap[n.from]?.name || "Agent"}</span>
                      <span style={{ fontSize: 10, color: "#3a3530", fontFamily: V.m, marginLeft: "auto" }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: n.read ? "#6b6055" : "#c4b8a8", margin: 0, lineHeight: 1.5 }}>{n.text}</p>
                  </div>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, marginTop: 6 }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* STANDUP */}
        {sub === "standup" && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: 12, color: "#F59E0B", fontFamily: V.m, marginBottom: 18 }}>
              📊 DAILY STANDUP —{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}
            </div>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #10B981", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#10B981", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>✅ COMPLETED TODAY</div>
              {[
                { a: "a5", t: "Shopify blog post — 2,100 words, moved to Review" },
                { a: "a4", t: "Keyword clusters posted for comparison pages" },
                { a: "a3", t: "G2 Competitive Intel Report created" }
              ].map((item, i) => {
                const ag = aMap[item.a];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <AgentAv id={item.a} size={18} />
                    <span style={{ fontSize: 12, color: ag?.color, fontWeight: 600, width: 50 }}>{ag?.name}</span>
                    <span style={{ fontSize: 12, color: "#c4b8a8" }}>{item.t}</span>
                  </div>
                );
              })}
            </Cd>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #3B82F6", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#3B82F6", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>🔄 IN PROGRESS</div>
              {[
                { a: "a4", t: "SEO audit — secondary clusters" },
                { a: "a8", t: "Trial emails — 3/5 drafted" },
                { a: "a2", t: "Competitor UX testing — 4/6 screens" },
                { a: "a1", t: "Q1 content calendar — 60% planned" }
              ].map((item, i) => {
                const ag = aMap[item.a];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <AgentAv id={item.a} size={18} />
                    <span style={{ fontSize: 12, color: ag?.color, fontWeight: 600, width: 50 }}>{ag?.name}</span>
                    <span style={{ fontSize: 12, color: "#c4b8a8" }}>{item.t}</span>
                  </div>
                );
              })}
            </Cd>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #EF4444", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#EF4444", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>🚫 BLOCKED</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AgentAv id="a7" size={18} />
                <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, width: 50 }}>Wanda</span>
                <span style={{ fontSize: 12, color: "#e8b4b4" }}>Infographic — waiting on brand palette</span>
              </div>
            </Cd>
            <Cd style={{ marginBottom: 12, borderLeft: "3px solid #D946EF", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#D946EF", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>👀 NEEDS YOUR REVIEW</div>
              {[
                { a: "a5", t: "Shopify blog post — first draft" },
                { a: "a4", t: "Zendesk content gap — should we prioritize?" }
              ].map((item, i) => {
                const ag = aMap[item.a];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <AgentAv id={item.a} size={18} />
                    <span style={{ fontSize: 12, color: ag?.color, fontWeight: 600, width: 50 }}>{ag?.name}</span>
                    <span style={{ fontSize: 12, color: "#c4b8a8" }}>{item.t}</span>
                  </div>
                );
              })}
            </Cd>
            <Cd style={{ borderLeft: "3px solid #F59E0B", borderRadius: "0 14px 14px 0" }}>
              <div style={{ fontSize: 10, color: "#F59E0B", fontFamily: V.m, letterSpacing: 1, marginBottom: 8 }}>📈 SQUAD STATS</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#10B981", fontFamily: V.d }}>
                    {activeAgents.filter(a => a.status === "active").length}
                  </span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}> active</span>
                </div>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#3B82F6", fontFamily: V.d }}>
                    {AG.reduce((s, a) => s + a.stats.tasksCompleted, 0)}
                  </span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}> total tasks</span>
                </div>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#EF4444", fontFamily: V.d }}>1</span>
                  <span style={{ fontSize: 11, color: "#5a5047" }}> blocked</span>
                </div>
              </div>
            </Cd>
          </div>
        )}
      </div>

      {/* Agent Console Panel */}
      {selAgent && (
        <>
          <div
            onClick={() => setSelAgent(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 190, backdropFilter: "blur(2px)" }}
          />
          <AgentConsole agent={selAgent} onClose={() => setSelAgent(null)} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

const EOS_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "⊞" },
  { key: "values", label: "Core Values", icon: "💎" },
  { key: "vto", label: "V/TO", icon: "🧭" },
  { key: "rocks", label: "Rocks", icon: "🪨" },
  { key: "scorecard", label: "Scorecard", icon: "📏" },
  { key: "issues", label: "Issues", icon: "⚡" },
  { key: "l10", label: "L10 History", icon: "📅" },
  { key: "recap", label: "Weekly Recap", icon: "📊" }
];

const titles: Record<string, string> = {
  dashboard: "Dashboard",
  values: "Core Values",
  vto: "Vision / Traction Organizer",
  rocks: "Q1 2026 Rocks",
  scorecard: "Scorecard",
  issues: "Issues List (IDS)",
  l10: "Level 10 History",
  recap: "Weekly Recap"
};

export default function App() {
  const [main, setMain] = useState("eos");
  const [eos, setEos] = useState("dashboard");
  const [col, setCol] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const goTo = (v: string) => {
    setMain("eos");
    setEos(v);
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#16140f", color: "#e8ddd0", display: "flex", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Instrument Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.12); border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes breathe { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        input::placeholder { color: #4a4540; }
      `}</style>

      {/* SIDEBAR */}
      <div
        style={{
          width: col ? 54 : 210,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
          background: "rgba(255,255,255,0.008)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: col ? "13px 9px" : "13px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div
            onClick={() => setCol(!col)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, #F59E0B18, #EF444418)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              border: "1px solid rgba(245,158,11,0.12)",
              fontSize: 13
            }}
          >
            ⚡
          </div>
          {!col && (
            <div>
              <div style={{ fontFamily: V.d, fontSize: 13, fontWeight: 700, color: "#f0ebe3", lineHeight: 1 }}>CPS Control</div>
              <div style={{ fontSize: 8, color: "#4a4540", fontFamily: V.m }}>Campos Property Solutions</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: col ? "8px 5px" : "8px 7px" }}>
          {[
            { k: "eos", l: "EOS Dashboard", ic: "📋" },
            { k: "mc", l: "Mission Control", ic: "🎛" }
          ].map(p => (
            <div
              key={p.k}
              onClick={() => setMain(p.k)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: col ? "9px 6px" : "9px 11px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 2,
                background: main === p.k ? "rgba(245,158,11,0.08)" : "transparent",
                color: main === p.k ? "#F59E0B" : "#6b6055",
                transition: "all 0.15s",
                justifyContent: col ? "center" : "flex-start",
                fontWeight: main === p.k ? 600 : 400
              }}
              onMouseEnter={e => {
                if (main !== p.k) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
              onMouseLeave={e => {
                if (main !== p.k) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{p.ic}</span>
              {!col && <span style={{ fontSize: 13 }}>{p.l}</span>}
              {!col && p.k === "mc" && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "breathe 2s infinite" }} />}
            </div>
          ))}

          {main === "eos" && !col && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 8, color: "#3a3530", fontFamily: V.m, letterSpacing: 1.5, padding: "4px 11px", textTransform: "uppercase" }}>EOS Tools</div>
              {EOS_NAV.map(n => (
                <div
                  key={n.key}
                  onClick={() => setEos(n.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 11px 7px 18px",
                    borderRadius: 7,
                    cursor: "pointer",
                    marginBottom: 1,
                    background: eos === n.key ? "rgba(255,255,255,0.04)" : "transparent",
                    color: eos === n.key ? "#c4b8a8" : "#4a4540",
                    transition: "all 0.15s",
                    fontSize: 12
                  }}
                  onMouseEnter={e => {
                    if (eos !== n.key) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={e => {
                    if (eos !== n.key) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 12, width: 18, textAlign: "center" }}>{n.icon}</span>
                  <span style={{ fontWeight: eos === n.key ? 500 : 400 }}>{n.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!col && <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, fontSize: 10, color: "#3a3530", fontFamily: V.m }}>Q1 2026 · Wk 06</div>}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ padding: "11px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "rgba(255,255,255,0.005)" }}>
          <h1 style={{ fontFamily: V.d, fontSize: 19, fontWeight: 600, color: "#f0ebe3" }}>{main === "eos" ? titles[eos] || "Dashboard" : "Mission Control"}</h1>
          <div style={{ fontSize: 11, color: "#3a3530", fontFamily: V.m }}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 22 }}>
          {main === "eos" && eos === "dashboard" && <EOSDash goTo={goTo} />}
          {main === "eos" && eos === "values" && <ValuesView />}
          {main === "eos" && eos === "vto" && <VTOView />}
          {main === "eos" && eos === "rocks" && <RocksView />}
          {main === "eos" && eos === "scorecard" && <ScorecardView />}
          {main === "eos" && eos === "issues" && <IssuesView />}
          {main === "eos" && eos === "l10" && <L10View />}
          {main === "eos" && eos === "recap" && <RecapView />}
          {main === "mc" && <MCPage />}
        </div>
      </div>
    </div>
  );
}