/**
 * Seed initial CPS data from cps-documentation repo
 * Run with: npx tsx scripts/seed-initial-data.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL not found in .env.local");
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedQ1Rocks() {
  console.log("\n📍 Seeding Q1 2026 Rocks...");
  
  const rocks = [
    {
      title: "New Marketing Flow Implementation",
      owner: "Ron",
      quarter: "2026-Q1",
      status: "on_track" as const,
      progress: 60,
      successCriteria: [
        { description: "Siftmap data pipeline live", complete: true },
        { description: "SMS workflow documented", complete: true },
        { description: "Calling scripts updated", complete: false },
        { description: "Team trained on new flow", complete: false },
      ],
      blockers: null,
      dueDate: Date.parse("2026-03-31"),
      lastUpdated: Date.now(),
      weeklyUpdates: [
        {
          week: "2026-W06",
          progress: 60,
          notes: "Siftmap + SMS live, working on calling scripts",
          updatedAt: Date.now(),
        },
      ],
    },
    {
      title: "JC Integrator Transition",
      owner: "Ron",
      quarter: "2026-Q1",
      status: "on_track" as const,
      progress: 45,
      successCriteria: [
        { description: "JC running weekly L10s solo", complete: false },
        { description: "All Integrator tasks delegated", complete: false },
        { description: "Ron only doing Visionary work", complete: false },
      ],
      blockers: "Need to define clearer handoff checklist",
      dueDate: Date.parse("2026-03-31"),
      lastUpdated: Date.now(),
      weeklyUpdates: [
        {
          week: "2026-W06",
          progress: 45,
          notes: "JC handling more ops tasks, still some on Ron's plate",
          updatedAt: Date.now(),
        },
      ],
    },
    {
      title: "Social Media Consistency (Spanish TikTok)",
      owner: "Ron",
      quarter: "2026-Q1",
      status: "off_track" as const,
      progress: 20,
      successCriteria: [
        { description: "3 TikTok posts per week", complete: false },
        { description: "Instagram/FB synced daily", complete: false },
        { description: "Content calendar template created", complete: false },
      ],
      blockers: "Time allocation - need to batch content creation",
      dueDate: Date.parse("2026-03-31"),
      lastUpdated: Date.now(),
      weeklyUpdates: [
        {
          week: "2026-W06",
          progress: 20,
          notes: "Behind on posting schedule",
          updatedAt: Date.now(),
        },
      ],
    },
    {
      title: "Disposition Process Documentation",
      owner: "JC",
      quarter: "2026-Q1",
      status: "on_track" as const,
      progress: 70,
      successCriteria: [
        { description: "Buyer vetting SOP updated", complete: true },
        { description: "Marketing cadence documented", complete: true },
        { description: "Closing checklist finalized", complete: false },
      ],
      blockers: null,
      dueDate: Date.parse("2026-03-31"),
      lastUpdated: Date.now(),
      weeklyUpdates: [
        {
          week: "2026-W06",
          progress: 70,
          notes: "Most SOPs current, just closing checklist left",
          updatedAt: Date.now(),
        },
      ],
    },
    {
      title: "CPS Second Brain (AI Integration)",
      owner: "Ron",
      quarter: "2026-Q1",
      status: "on_track" as const,
      progress: 75,
      successCriteria: [
        { description: "Documentation repo synced to Notion", complete: true },
        { description: "QuickBooks integration live", complete: false },
        { description: "Slack integration (transcripts)", complete: false },
        { description: "AI Chief of Staff operational", complete: false },
      ],
      blockers: null,
      dueDate: Date.parse("2026-03-31"),
      lastUpdated: Date.now(),
      weeklyUpdates: [
        {
          week: "2026-W06",
          progress: 75,
          notes: "Phase 2 complete (knowledge capture). Starting Phase 3 (AI integration)",
          updatedAt: Date.now(),
        },
      ],
    },
  ];

  for (const rock of rocks) {
    // Remove null fields (Convex optional fields mean "can be missing", not "can be null")
    const cleanRock = Object.fromEntries(
      Object.entries(rock).filter(([_, v]) => v !== null)
    );
    await client.mutation(api.mutations.createRock, cleanRock as any);
    console.log(`  ✓ ${rock.title} (${rock.progress}%)`);
  }
}

async function seedScorecard() {
  console.log("\n📊 Seeding Scorecard Metrics...");

  const metrics = [
    // Acquisitions
    { metric: "Contracts Signed", department: "acquisitions", owner: "Joey", target: 2 },
    { metric: "Offers Made", department: "acquisitions", owner: "Joey", target: 15 },
    { metric: "Calls Made", department: "acquisitions", owner: "Joey", target: 200 },
    
    // Marketing
    { metric: "Leads Generated", department: "marketing", owner: "Yulian", target: 50 },
    { metric: "Lists Uploaded", department: "marketing", owner: "Yulian", target: 2 },
    
    // Disposition
    { metric: "Deals Closed", department: "disposition", owner: "JC", target: 1 },
    { metric: "Buyer Outreach", department: "disposition", owner: "JC", target: 30 },
    
    // Operations
    { metric: "SOPs Updated", department: "operations", owner: "JC", target: 3 },
  ];

  const currentWeek = "2026-W06"; // Feb 10, 2026

  for (const m of metrics) {
    await client.mutation(api.mutations.createScorecardMetric, {
      ...m,
      week: currentWeek,
      status: "pending" as const,
      // Don't include actual/notes if null
    });
    console.log(`  ✓ ${m.metric} (${m.department})`);
  }
}

async function seedAccountabilityChart() {
  console.log("\n👥 Seeding Accountability Chart...");

  const roles = [
    {
      role: "Visionary",
      person: "Ron",
      department: "leadership",
      responsibilities: [
        "Set vision and strategy",
        "External relationships and deals",
        "Major decision-making",
        "Creative problem solving",
      ],
      reportsTo: null,
      gwoScore: { get: true, want: true, capacity: true },
    },
    {
      role: "Integrator",
      person: "JC",
      department: "leadership",
      responsibilities: [
        "Run weekly L10s",
        "Manage team accountability",
        "Execute on Rocks and priorities",
        "Filter issues and decisions",
      ],
      reportsTo: "Ron",
      gwoScore: { get: true, want: true, capacity: false }, // Transitioning
    },
    {
      role: "Acquisitions Lead",
      person: "Joey",
      department: "acquisitions",
      responsibilities: [
        "Run calling campaigns",
        "Make offers",
        "Negotiate contracts",
        "Track deal pipeline",
      ],
      reportsTo: "Ron",
      gwoScore: { get: true, want: true, capacity: true },
    },
    {
      role: "Marketing/Data Admin",
      person: "Yulian",
      department: "marketing",
      responsibilities: [
        "Source and upload lead lists",
        "Manage REISift data",
        "Run Siftmap campaigns",
        "SMS campaign management",
      ],
      reportsTo: "JC",
      gwoScore: { get: true, want: true, capacity: true },
    },
  ];

  for (const role of roles) {
    const cleanRole = Object.fromEntries(
      Object.entries(role).filter(([_, v]) => v !== null)
    );
    await client.mutation(api.mutations.createAccountabilityRole, cleanRole as any);
    console.log(`  ✓ ${role.role} - ${role.person}`);
  }
}

async function seedIssues() {
  console.log("\n🚩 Seeding Open Issues...");

  const issues = [
    {
      title: "Need standardized data/documentation processes",
      description: "Marketing flow changes aren't being documented consistently",
      raisedBy: "Ron",
      department: "operations",
      priority: "high" as const,
      status: "open" as const,
      resolution: null,
      createdAt: Date.parse("2025-06-15"),
      resolvedAt: null,
      relatedRockId: null,
      pattern: "process-adherence",
    },
    {
      title: "Disposition KPIs need definition",
      description: "What metrics should we track weekly for disposition?",
      raisedBy: "JC",
      department: "disposition",
      priority: "medium" as const,
      status: "open" as const,
      resolution: null,
      createdAt: Date.parse("2024-04-20"),
      resolvedAt: null,
      relatedRockId: null,
      pattern: null,
    },
    {
      title: "Social media posting schedule unclear",
      description: "Who posts what, when? Need clear ownership and cadence",
      raisedBy: "Ron",
      department: "marketing",
      priority: "medium" as const,
      status: "open" as const,
      resolution: null,
      createdAt: Date.now(),
      resolvedAt: null,
      relatedRockId: null,
      pattern: "accountability",
    },
  ];

  for (const issue of issues) {
    const cleanIssue = Object.fromEntries(
      Object.entries(issue).filter(([_, v]) => v !== null)
    );
    await client.mutation(api.mutations.createIssue, cleanIssue as any);
    console.log(`  ✓ ${issue.title}`);
  }
}

async function main() {
  console.log("🌱 Seeding CPS Control with initial data...\n");
  console.log(`Using Convex deployment: ${CONVEX_URL}\n`);

  try {
    await seedQ1Rocks();
    await seedScorecard();
    await seedAccountabilityChart();
    await seedIssues();

    console.log("\n✅ Seed complete! Check your dashboard:");
    console.log("   https://dashboard.convex.dev/d/valuable-alligator-465\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
