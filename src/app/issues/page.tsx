"use client";

import { useEffect, useState } from "react";
import { getIssues } from "@/lib/api-client";
import Link from "next/link";

interface Issue {
  id: string;
  title: string;
  status: string; // "Solved", "Open", etc.
  owners: string[];
  meeting: string | null;
  date_added: string | null;
  notion_url: string;
  last_edited: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSolved, setShowSolved] = useState(false);

  useEffect(() => {
    async function loadIssues() {
      try {
        setLoading(true);
        const data = await getIssues();
        setIssues(Array.isArray(data) ? data : data.issues || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load issues");
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="issues" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="issues" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading issues</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter by solved status
  const filteredIssues = issues.filter((i) => 
    showSolved ? i.status === "Solved" : i.status !== "Solved"
  );
  
  const openCount = issues.filter(i => i.status !== "Solved").length;
  const solvedCount = issues.filter(i => i.status === "Solved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="issues" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issues List (IDS)</h1>
              <p className="text-sm text-gray-500 mt-1">
                Identify, Discuss, Solve — Weekly L10 tracking
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSolved(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  !showSolved
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Open ({openCount})
              </button>
              <button
                onClick={() => setShowSolved(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showSolved
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Solved ({solvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {!showSolved 
                ? "No open issues — you're crushing it! 🎉" 
                : "No solved issues yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const isSolved = issue.status === "Solved";
  
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 p-6 hover:shadow-md transition-shadow ${
        isSolved ? "border-l-green-500" : "border-l-blue-500"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-base mb-2">
            {issue.title}
          </h4>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {issue.owners && issue.owners.length > 0 && (
              <span>
                <span className="font-medium">Owners:</span> {issue.owners.join(", ")}
              </span>
            )}
            {issue.date_added && (
              <span>
                <span className="font-medium">Added:</span>{" "}
                {new Date(issue.date_added).toLocaleDateString()}
              </span>
            )}
            {issue.meeting && (
              <span className="font-medium">Meeting: {issue.meeting}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded ${
              isSolved
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {issue.status}
          </span>
          <a
            href={issue.notion_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View in Notion →
          </a>
        </div>
      </div>
      
      {issue.last_edited && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last edited: {new Date(issue.last_edited).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function Header({ currentPage }: { currentPage: string }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CPS Control</h1>
            <p className="text-xs text-gray-500">Campos Property Solutions</p>
          </div>
          <nav className="flex gap-3">
            <NavLink href="/" label="Dashboard" active={currentPage === "dashboard"} />
            <NavLink href="/rocks" label="Rocks" active={currentPage === "rocks"} />
            <NavLink href="/scorecard" label="Scorecard" active={currentPage === "scorecard"} />
            <NavLink href="/issues" label="Issues" active={currentPage === "issues"} />
            <NavLink href="/finance" label="Finance" active={currentPage === "finance"} />
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        active
          ? "text-gray-900 bg-gray-100"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
