import {
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  LayoutTemplate,
  ImageIcon,
  Newspaper,
  Brain,
  ClipboardList,
  Mail,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "learning" | "media" | "system";
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface AdminNavCategory {
  id: "learning" | "media" | "system";
  label: string;
  description: string;
}

export const ADMIN_NAV_CATEGORIES: AdminNavCategory[] = [
  {
    id: "learning",
    label: "Learning & Content",
    description: "Curriculum, vocabulary, grammar rules & assessments",
  },
  {
    id: "media",
    label: "Media & Publishing",
    description: "Articles, visual templates & uploaded media assets",
  },
  {
    id: "system",
    label: "System & Administration",
    description: "Learner directory, automated emails & platform notices",
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  // Learning & Content
  {
    href: "/admin/vocabulary",
    label: "Vocabulary",
    description: "Word definitions, meanings, synonyms & CEFR levels",
    icon: BookOpen,
    category: "learning",
    badgeColor: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
  },
  {
    href: "/admin/grammar",
    label: "Grammar",
    description: "Rules, categories & syllabus sections",
    icon: GraduationCap,
    category: "learning",
    badgeColor: {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-500/20",
    },
  },
  {
    href: "/admin/written",
    label: "Written Topics",
    description: "Written practice topics, prompts & student submissions",
    icon: FileText,
    category: "learning",
    badgeColor: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    },
  },
  {
    href: "/admin/quizzes",
    label: "Quizzes",
    description: "Interactive questions, question banks & quiz types",
    icon: Brain,
    category: "learning",
    badgeColor: {
      bg: "bg-violet-500/10 dark:bg-violet-500/20",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/20",
    },
  },
  {
    href: "/admin/exams",
    label: "Exams",
    description: "Timed model tests, evaluations & official results",
    icon: ClipboardList,
    category: "learning",
    badgeColor: {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/20",
    },
  },

  // Media & Publishing
  {
    href: "/admin/blog",
    label: "Blog & News",
    description: "Articles, learning guides & community updates",
    icon: Newspaper,
    category: "media",
    badgeColor: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
    },
  },
  {
    href: "/admin/templates",
    label: "Visual Templates",
    description: "Certificate & ID card visual canvas template engine",
    icon: LayoutTemplate,
    category: "media",
    badgeColor: {
      bg: "bg-pink-500/10 dark:bg-pink-500/20",
      text: "text-pink-600 dark:text-pink-400",
      border: "border-pink-500/20",
    },
  },
  {
    href: "/admin/media",
    label: "Media Library",
    description: "Image assets, document storage & media upload manager",
    icon: ImageIcon,
    category: "media",
    badgeColor: {
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-500/20",
    },
  },

  // System & Administration
  {
    href: "/admin/users",
    label: "Users Directory",
    description: "Learner profiles, roles, badges & account permissions",
    icon: Users,
    category: "system",
    badgeColor: {
      bg: "bg-sky-500/10 dark:bg-sky-500/20",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-500/20",
    },
  },
  {
    href: "/admin/emails",
    label: "Email Center",
    description: "SMTP configuration, automated triggers & delivery logs",
    icon: Mail,
    category: "system",
    badgeColor: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/20",
    },
  },
  {
    href: "/admin/popup",
    label: "Popup Notices",
    description: "Promotional banners, system alerts & modal popups",
    icon: Megaphone,
    category: "system",
    badgeColor: {
      bg: "bg-teal-500/10 dark:bg-teal-500/20",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-500/20",
    },
  },
];

