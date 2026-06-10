export type AppStatus = "live" | "building" | "planned";

export type EcosystemApp = {
  name: string;
  category: string;
  description: string;
  status: AppStatus;
  href?: string;
};

export const categories = [
  "AI & Automation",
  "Business & Productivity",
  "Creative & Media",
  "Social & Communication",
  "Education",
  "Health & Lifestyle",
  "Commerce & Finance",
  "Smart Systems",
] as const;

export const apps: EcosystemApp[] = [
  // AI & Automation
  { name: "Magnolia Assistant", category: "AI & Automation", description: "Your personal AI across the Magnolia ecosystem.", status: "live", href: "/app/assistant" },
  { name: "Agents", category: "AI & Automation", description: "Autonomous workflows that act on your behalf.", status: "building" },
  { name: "Voice", category: "AI & Automation", description: "Hands-free conversations with Magnolia.", status: "planned" },

  // Business & Productivity
  { name: "Tasks", category: "Business & Productivity", description: "Lightweight tasks with AI prioritisation.", status: "planned" },
  { name: "Projects", category: "Business & Productivity", description: "Collaborative project workspaces.", status: "planned" },
  { name: "CRM", category: "Business & Productivity", description: "Relationships, deals, and follow-ups.", status: "planned" },
  { name: "Finance", category: "Business & Productivity", description: "Budgets, invoices and cash flow.", status: "planned" },
  { name: "Docs", category: "Business & Productivity", description: "Documents with built-in intelligence.", status: "planned" },

  // Creative & Media
  { name: "Studio", category: "Creative & Media", description: "Generate and edit images, video and music.", status: "planned" },
  { name: "Frames", category: "Creative & Media", description: "A modern photography library.", status: "planned" },
  { name: "Reels", category: "Creative & Media", description: "Short-form video creation with AI cuts.", status: "planned" },

  // Social & Communication
  { name: "Threads", category: "Social & Communication", description: "Private messaging and group spaces.", status: "planned" },
  { name: "Rooms", category: "Social & Communication", description: "Real-time audio and video communities.", status: "planned" },

  // Education
  { name: "Tutor", category: "Education", description: "Personal AI tutor for any subject.", status: "planned" },
  { name: "Courses", category: "Education", description: "Curated learning paths.", status: "planned" },

  // Health & Lifestyle
  { name: "Pulse", category: "Health & Lifestyle", description: "Fitness, sleep and recovery insights.", status: "planned" },
  { name: "Habits", category: "Health & Lifestyle", description: "Daily rituals that stick.", status: "planned" },

  // Commerce & Finance
  { name: "Market", category: "Commerce & Finance", description: "Curated marketplaces and storefronts.", status: "planned" },
  { name: "Invest", category: "Commerce & Finance", description: "Personal investing dashboard.", status: "planned" },

  // Smart Systems
  { name: "Home", category: "Smart Systems", description: "Unified control for connected devices.", status: "planned" },
  { name: "Guard", category: "Smart Systems", description: "Security, presence and alerts.", status: "planned" },
];
