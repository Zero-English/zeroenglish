"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Settings2,
  FileCode2,
  Zap,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  RotateCcw,
  Sparkles,
  Search,
  ShieldCheck,
  Save,
  Info,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Code,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmtpConfigState {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  isEnabled: boolean;
  hasPassword?: boolean;
}

interface TemplateItem {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  variables: string[];
  isActive: boolean;
  autoTriggerEnabled: boolean;
}

interface EmailLogItem {
  id: number;
  recipientEmail: string;
  recipientUserId?: number | null;
  templateKey?: string | null;
  subject: string;
  status: "SENT" | "FAILED" | "PENDING";
  errorMessage?: string | null;
  metadata?: any;
  sentAt: string;
}

interface TabConfigItem {
  id: string;
  label: string;
  icon: any;
  badgeCountKey?: "templates" | "logs";
}

const TABS_CONFIG: TabConfigItem[] = [
  { id: "smtp", label: "SMTP Settings", icon: Settings2 },
  { id: "templates", label: "Templates", icon: FileCode2, badgeCountKey: "templates" },
  { id: "triggers", label: "Automated Triggers", icon: Zap },
  { id: "broadcast", label: "Broadcast", icon: Send },
  { id: "logs", label: "Delivery Logs", icon: History, badgeCountKey: "logs" },
];

const SYSTEM_DEFAULT_KEYS = [
  "LEADERBOARD_RANKING_TOP3",
  "LEADERBOARD_PARTICIPANT",
  "WELCOME_USER",
  "CUSTOM_BROADCAST",
];

const DEFAULT_STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);"></td>
          </tr>

          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 0 32px 36px 32px;">
              <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #71717a; margin-bottom: 14px;">
                Platform Notification
              </div>
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #09090b; letter-spacing: -0.3px; line-height: 1.3;">
                Hello {{userName}},
              </h1>
              <div style="font-size: 14px; color: #3f3f46; line-height: 1.7;">
                Write your custom template message content here. You can include dynamic variables such as {{userName}} and {{userEmail}}.
              </div>
            </td>
          </tr>

          <!-- Minimalist Footer -->
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState<string>("smtp");

  // SMTP State
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigState>({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: "",
    pass: "",
    fromName: "Zero English",
    fromEmail: "",
    replyTo: "",
    isEnabled: true,
  });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Test Email State
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateViewMode, setTemplateViewMode] = useState<"code" | "preview">("code");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Create Template Modal State
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [createViewMode, setCreateViewMode] = useState<"code" | "preview">("code");
  const [createPreviewDevice, setCreatePreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    key: "",
    description: "",
    subject: "",
    bodyHtml: DEFAULT_STARTER_HTML,
    variablesText: "userName, userEmail, logoUrl, currentYear",
    isActive: true,
    autoTriggerEnabled: false,
  });

  // Broadcast State
  const [broadcastAudience, setBroadcastAudience] = useState<"ALL" | "ADMINS" | "SPECIFIC">("ALL");
  const [broadcastEmails, setBroadcastEmails] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastHtml, setBroadcastHtml] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logFilterStatus, setLogFilterStatus] = useState<string>("");
  const [logSearch, setLogSearch] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);

  // Load Initial Data
  useEffect(() => {
    fetchSmtpConfig();
    fetchTemplates();
    fetchLogs(1);
  }, []);

  async function fetchSmtpConfig() {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/v1/email/config");
      const json = await res.json();
      if (json.success && json.data) {
        setSmtpConfig({
          host: json.data.host || "smtp.gmail.com",
          port: json.data.port || 465,
          secure: json.data.secure ?? true,
          user: json.data.user || "",
          pass: json.data.pass || "",
          fromName: json.data.fromName || "Zero English",
          fromEmail: json.data.fromEmail || "",
          replyTo: json.data.replyTo || "",
          isEnabled: json.data.isEnabled ?? true,
          hasPassword: json.data.hasPassword,
        });
      }
    } catch (err) {
      toast.error("Failed to load SMTP configuration");
    } finally {
      setLoadingConfig(false);
    }
  }

  async function handleSaveSmtpConfig(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/v1/email/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpConfig),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "SMTP Settings verified and saved successfully!");
        fetchSmtpConfig();
      } else {
        toast.error(json.message || "Failed to save SMTP settings");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error("Please enter a valid recipient email address");
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch("/api/v1/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testRecipient,
          customConfig: smtpConfig,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Test email dispatched successfully!");
        setTestEmailOpen(false);
        fetchLogs(1);
      } else {
        toast.error(json.message || "Test email failed to send");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error sending test email");
    } finally {
      setSendingTest(false);
    }
  }

  async function fetchTemplates() {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/v1/email/templates");
      const json = await res.json();
      if (json.success && json.data) {
        setTemplates(json.data);
        if (json.data.length > 0 && !selectedTemplateKey) {
          setSelectedTemplateKey(json.data[0].key);
          setEditingTemplate(json.data[0]);
        } else if (selectedTemplateKey) {
          const found = json.data.find((t: TemplateItem) => t.key === selectedTemplateKey);
          if (found) setEditingTemplate(found);
        }
      }
    } catch (err) {
      toast.error("Failed to load email templates");
    } finally {
      setLoadingTemplates(false);
    }
  }

  function handleSelectTemplate(tpl: TemplateItem) {
    setSelectedTemplateKey(tpl.key);
    setEditingTemplate({ ...tpl });
  }

  async function handleSaveTemplate() {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/v1/email/templates/${editingTemplate.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          bodyHtml: editingTemplate.bodyHtml,
          bodyText: editingTemplate.bodyText,
          isActive: editingTemplate.isActive,
          autoTriggerEnabled: editingTemplate.autoTriggerEnabled,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Template saved successfully!");
        fetchTemplates();
      } else {
        toast.error(json.message || "Failed to update template");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error saving template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleResetTemplate() {
    if (!editingTemplate) return;
    if (!confirm(`Are you sure you want to reset "${editingTemplate.name}" to its original default content?`)) {
      return;
    }
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/v1/email/templates/${editingTemplate.key}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Template restored to original default!");
        setEditingTemplate(json.data);
        fetchTemplates();
      } else {
        toast.error(json.message || "Failed to reset template");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error resetting template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleDeleteTemplate(key: string) {
    if (!confirm(`Are you sure you want to delete template "${key}"? This action cannot be undone.`)) {
      return;
    }
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/v1/email/templates/${key}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Template deleted successfully.");
        setSelectedTemplateKey("");
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error(json.message || "Failed to delete template");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleCreateTemplate() {
    if (!newTemplate.name.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (!newTemplate.subject.trim()) {
      toast.error("Subject line is required.");
      return;
    }
    if (!newTemplate.bodyHtml.trim()) {
      toast.error("HTML body is required.");
      return;
    }

    setCreatingTemplate(true);
    try {
      const variablesArray = newTemplate.variablesText
        .split(/[\n,]+/)
        .map((v) => v.trim())
        .filter(Boolean);

      const generatedKey = newTemplate.key.trim()
        ? newTemplate.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_")
        : newTemplate.name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

      const res = await fetch("/api/v1/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplate.name.trim(),
          key: generatedKey,
          description: newTemplate.description.trim(),
          subject: newTemplate.subject.trim(),
          bodyHtml: newTemplate.bodyHtml,
          variables: variablesArray,
          isActive: newTemplate.isActive,
          autoTriggerEnabled: newTemplate.autoTriggerEnabled,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success("New email template created successfully!");
        setCreateTemplateOpen(false);
        setNewTemplate({
          name: "",
          key: "",
          description: "",
          subject: "",
          bodyHtml: DEFAULT_STARTER_HTML,
          variablesText: "userName, userEmail, logoUrl, currentYear",
          isActive: true,
          autoTriggerEnabled: false,
        });
        await fetchTemplates();
        setSelectedTemplateKey(json.data.key);
        setEditingTemplate(json.data);
      } else {
        toast.error(json.message || "Failed to create template");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error creating template");
    } finally {
      setCreatingTemplate(false);
    }
  }

  async function fetchLogs(page = 1) {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (logFilterStatus) params.append("status", logFilterStatus);
      if (logSearch) params.append("search", logSearch);

      const res = await fetch(`/api/v1/email/logs?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data.logs);
        setTotalLogs(json.data.total);
        setLogPage(page);
      }
    } catch (err) {
      toast.error("Failed to load email logs");
    } finally {
      setLoadingLogs(false);
    }
  }

  async function handleSendBroadcast() {
    if (!broadcastSubject || !broadcastHtml) {
      toast.error("Please enter a subject and email body");
      return;
    }

    let specificList: string[] = [];
    if (broadcastAudience === "SPECIFIC") {
      specificList = broadcastEmails
        .split(/[\n,]+/)
        .map((e) => e.trim())
        .filter((e) => e && e.includes("@"));

      if (specificList.length === 0) {
        toast.error("Please enter at least one valid recipient email");
        return;
      }
    }

    if (
      !confirm(
        `Are you sure you want to broadcast this email to ${
          broadcastAudience === "ALL"
            ? "ALL registered users"
            : broadcastAudience === "ADMINS"
            ? "ALL platform admins"
            : `${specificList.length} specific recipients`
        }?`
      )
    ) {
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await fetch("/api/v1/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: broadcastAudience,
          specificEmails: specificList,
          subject: broadcastSubject,
          bodyHtml: broadcastHtml,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Broadcast successfully sent!");
        setBroadcastSubject("");
        setBroadcastHtml("");
        setBroadcastEmails("");
        fetchLogs(1);
      } else {
        toast.error(json.message || "Failed to broadcast email");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error sending broadcast");
    } finally {
      setSendingBroadcast(false);
    }
  }

  // Helper for generating preview HTML with mock variables
  function getRenderedPreviewHtml(rawHtml: string) {
    const mockData: Record<string, any> = {
      userName: "Alexander Smith",
      userEmail: "alexander@example.com",
      examTitle: "Master IELTS General Exam 2026",
      rank: 1,
      rankSuffix: "st",
      totalParticipants: 42,
      totalScore: 98,
      scoreInPercent: 98,
      leaderboardUrl: "#",
      certificateUrl: "#",
      logoUrl: "/assets/logo/main-logo.png",
      currentYear: new Date().getFullYear(),
      exploreUrl: "#",
      message: "Here is your latest platform announcement and learning updates.",
    };

    let rendered = rawHtml;
    rendered = rendered.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        return mockData[condition] ? content : "";
      }
    );
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return mockData[key] !== undefined ? String(mockData[key]) : match;
    });

    return rendered;
  }

  return (
    <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Mail className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Email Dispatch & Automated Notifications
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure Gmail SMTP / custom mailer, create & customize templates, and send automated leaderboard emails.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Badge
            variant={smtpConfig.isEnabled && smtpConfig.user ? "default" : "secondary"}
            className="text-xs py-1 px-3 gap-1.5 shrink-0"
          >
            <span
              className={`size-2 rounded-full ${
                smtpConfig.isEnabled && smtpConfig.user ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            {smtpConfig.isEnabled && smtpConfig.user ? "SMTP Active" : "SMTP Inactive"}
          </Badge>

          <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-medium">
                <Send className="size-3.5 text-primary" />
                Send Test Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-primary" />
                  Send Test Verification Email
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Verify that your SMTP connection credentials and Gmail dispatcher are functioning properly.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="test-recipient" className="text-xs">
                    Recipient Email Address
                  </Label>
                  <Input
                    id="test-recipient"
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setTestEmailOpen(false)}
                  disabled={sendingTest}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendTestEmail}
                  disabled={sendingTest || !testRecipient}
                  className="gap-1.5"
                >
                  {sendingTest ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      Send Test
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modern Responsive Tab Navigation Bar */}
      <div className="overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 p-1 bg-muted/70 dark:bg-muted/40 border border-border/60 rounded-xl min-w-max sm:min-w-0 sm:w-full">
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const count =
              tab.badgeCountKey === "templates"
                ? templates.length
                : tab.badgeCountKey === "logs"
                ? totalLogs
                : undefined;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap outline-none",
                  "flex-1 justify-center sm:justify-center",
                  isActive
                    ? "bg-background text-foreground shadow-xs font-semibold border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary font-medium"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* TAB 1: SMTP CONFIGURATION */}
        <TabsContent value="smtp" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold">SMTP Connection Server</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Configure Gmail SMTP or custom transactional mail server for outgoing emails.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Label htmlFor="smtp-enabled" className="text-xs font-medium cursor-pointer">
                        {smtpConfig.isEnabled ? "Service Enabled" : "Service Disabled"}
                      </Label>
                      <Switch
                        id="smtp-enabled"
                        checked={smtpConfig.isEnabled}
                        onCheckedChange={(checked) =>
                          setSmtpConfig((prev) => ({ ...prev, isEnabled: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/40 rounded-lg border text-xs">
                    <span className="text-muted-foreground font-medium pl-1">Quick Presets:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "smtp.gmail.com",
                          port: 465,
                          secure: true,
                        }))
                      }
                    >
                      Gmail SSL (Port 465)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "smtp.gmail.com",
                          port: 587,
                          secure: false,
                        }))
                      }
                    >
                      Gmail TLS (Port 587)
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">SMTP Host</Label>
                      <Input
                        value={smtpConfig.host}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, host: e.target.value }))
                        }
                        placeholder="smtp.gmail.com"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">SMTP Port</Label>
                      <Input
                        type="number"
                        value={smtpConfig.port}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, port: parseInt(e.target.value, 10) || 465 }))
                        }
                        placeholder="465 or 587"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">SMTP Username / Gmail Address</Label>
                      <Input
                        type="email"
                        value={smtpConfig.user}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, user: e.target.value }))
                        }
                        placeholder="yourname@gmail.com"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">App Password</Label>
                        <span className="text-[10px] text-muted-foreground">
                          {smtpConfig.hasPassword ? "Password saved" : "No password set"}
                        </span>
                      </div>
                      <Input
                        type="password"
                        value={smtpConfig.pass}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, pass: e.target.value }))
                        }
                        placeholder="••••••••••••••••"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sender Name</Label>
                      <Input
                        value={smtpConfig.fromName}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, fromName: e.target.value }))
                        }
                        placeholder="Zero English"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">From Email Address</Label>
                      <Input
                        type="email"
                        value={smtpConfig.fromEmail}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, fromEmail: e.target.value }))
                        }
                        placeholder="noreply@zeroenglish.com"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Reply-To (Optional)</Label>
                      <Input
                        type="email"
                        value={smtpConfig.replyTo || ""}
                        onChange={(e) =>
                          setSmtpConfig((prev) => ({ ...prev, replyTo: e.target.value }))
                        }
                        placeholder="support@zeroenglish.com"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 bg-muted/20 border-t py-3 px-4 sm:px-6">
                  <p className="text-[11px] text-muted-foreground">
                    Saving verifies credentials directly against the SMTP server.
                  </p>
                  <Button
                    onClick={handleSaveSmtpConfig}
                    disabled={savingConfig || loadingConfig}
                    size="sm"
                    className="gap-1.5 text-xs font-medium w-full sm:w-auto"
                  >
                    {savingConfig ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        Verifying & Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        Save SMTP Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Side Info & App Password Guide */}
            <div className="space-y-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    Gmail SMTP Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    For security, Google requires a 16-character <strong>App Password</strong> rather than your standard account password:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-foreground/90 text-[11px]">
                    <li>Go to your Google Account Settings &gt; Security.</li>
                    <li>Ensure <strong>2-Step Verification</strong> is enabled.</li>
                    <li>Search for <strong>"App Passwords"</strong>.</li>
                    <li>Create a new app named <strong>"ZeroEnglish Mailer"</strong>.</li>
                    <li>Copy the generated 16-letter code into the App Password field above.</li>
                  </ol>
                  <div className="p-2.5 rounded-lg bg-background border text-[11px] text-muted-foreground">
                    <strong>Port recommendation:</strong> Port <code>465</code> (SSL) is optimal for high deliverability and instant verification.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: EMAIL TEMPLATES */}
        <TabsContent value="templates" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Template List Sidebar */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Templates
                </h3>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCreateTemplateOpen(true)}
                    className="h-7 px-2.5 text-xs gap-1 font-medium shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    New Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchTemplates}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Synchronize templates"
                  >
                    <RefreshCw className="size-3" />
                  </Button>
                </div>
              </div>

              {/* Template Pill Carousel on Mobile / Card List on Desktop */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateKey === tpl.key;
                  return (
                    <div
                      key={tpl.key}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer text-left shrink-0 min-w-[240px] lg:min-w-0 w-full",
                        isSelected
                          ? "bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary/20"
                          : "bg-card hover:bg-muted/50 border-border text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {tpl.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {tpl.autoTriggerEnabled && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/20 text-primary">
                              Auto
                            </Badge>
                          )}
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              tpl.isActive ? "bg-emerald-500" : "bg-muted-foreground/40"
                            )}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {tpl.description || "No description provided"}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground font-mono truncate">
                        <code>{tpl.key}</code>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Template Editor & Live Preview */}
            <div className="lg:col-span-8 space-y-4">
              {editingTemplate ? (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <FileCode2 className="size-4 text-primary" />
                          {editingTemplate.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5 font-mono text-muted-foreground">
                          Key: {editingTemplate.key}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 border-r pr-3">
                          <Label htmlFor="tpl-active" className="text-xs cursor-pointer">
                            Active
                          </Label>
                          <Switch
                            id="tpl-active"
                            checked={editingTemplate.isActive}
                            onCheckedChange={(c) =>
                              setEditingTemplate((prev) => (prev ? { ...prev, isActive: c } : null))
                            }
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Label htmlFor="tpl-auto" className="text-xs cursor-pointer">
                            Auto Trigger
                          </Label>
                          <Switch
                            id="tpl-auto"
                            checked={editingTemplate.autoTriggerEnabled}
                            onCheckedChange={(c) =>
                              setEditingTemplate((prev) =>
                                prev ? { ...prev, autoTriggerEnabled: c } : null
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Subject Line (supports dynamic variables)</Label>
                      <Input
                        value={editingTemplate.subject}
                        onChange={(e) =>
                          setEditingTemplate((prev) =>
                            prev ? { ...prev, subject: e.target.value } : null
                          )
                        }
                        placeholder="Subject..."
                        className="text-xs"
                      />
                    </div>

                    {/* Variable Pills */}
                    {editingTemplate.variables && editingTemplate.variables.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Click variable to copy:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {editingTemplate.variables.map((variable) => (
                            <Badge
                              key={variable}
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(`{{${variable}}}`);
                                toast.info(`Copied {{${variable}}} to clipboard`);
                              }}
                              className="text-[10px] cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors font-mono"
                            >
                              &#123;&#123;{variable}&#125;&#125;
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Editor / Live Preview Sub-header */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                        <div className="flex items-center gap-1.5 p-0.5 bg-muted/60 rounded-lg w-fit">
                          <button
                            type="button"
                            onClick={() => setTemplateViewMode("code")}
                            className={cn(
                              "px-3 py-1 text-xs rounded-md font-medium transition-all",
                              templateViewMode === "code"
                                ? "bg-background text-foreground shadow-xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            HTML Code
                          </button>
                          <button
                            type="button"
                            onClick={() => setTemplateViewMode("preview")}
                            className={cn(
                              "flex items-center gap-1 px-3 py-1 text-xs rounded-md font-medium transition-all",
                              templateViewMode === "preview"
                                ? "bg-background text-foreground shadow-xs font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Eye className="size-3" />
                            Live Preview
                          </button>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {templateViewMode === "preview" && (
                            <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-md">
                              <Button
                                variant={previewDevice === "desktop" ? "default" : "ghost"}
                                size="sm"
                                className="h-6 text-[10px] px-2 gap-1"
                                onClick={() => setPreviewDevice("desktop")}
                              >
                                <Monitor className="size-3" />
                                Desktop
                              </Button>
                              <Button
                                variant={previewDevice === "mobile" ? "default" : "ghost"}
                                size="sm"
                                className="h-6 text-[10px] px-2 gap-1"
                                onClick={() => setPreviewDevice("mobile")}
                              >
                                <Smartphone className="size-3" />
                                Mobile
                              </Button>
                            </div>
                          )}

                          {SYSTEM_DEFAULT_KEYS.includes(editingTemplate.key) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleResetTemplate}
                              disabled={savingTemplate}
                              className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                            >
                              <RotateCcw className="size-3" />
                              Reset
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(editingTemplate.key)}
                              disabled={savingTemplate}
                              className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      {templateViewMode === "code" ? (
                        <div className="space-y-2">
                          <Textarea
                            rows={14}
                            value={editingTemplate.bodyHtml}
                            onChange={(e) =>
                              setEditingTemplate((prev) =>
                                prev ? { ...prev, bodyHtml: e.target.value } : null
                              )
                            }
                            className="font-mono text-xs leading-relaxed w-full min-h-[340px]"
                            placeholder="Write responsive HTML email template..."
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center bg-muted/30 p-2 sm:p-4 rounded-xl border overflow-x-auto">
                          <div
                            style={{ width: previewDevice === "desktop" ? "100%" : "375px" }}
                            className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all max-w-full"
                          >
                            <iframe
                              title="Template Preview"
                              srcDoc={getRenderedPreviewHtml(editingTemplate.bodyHtml)}
                              className="w-full min-h-[460px] border-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 bg-muted/20 border-t py-3 px-4 sm:px-6">
                    <p className="text-[11px] text-muted-foreground">
                      Templates support handlebars syntax such as <code>{`{{userName}}`}</code> and <code>{`{{#if rank}}...{{/if}}`}</code>.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate}
                      className="gap-1.5 text-xs w-full sm:w-auto"
                    >
                      {savingTemplate ? (
                        <>
                          <RefreshCw className="size-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          Save Template
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-center space-y-3">
                  <FileCode2 className="size-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Select a template on the left to start editing, or create a new one.</p>
                  <Button
                    size="sm"
                    onClick={() => setCreateTemplateOpen(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="size-3.5" />
                    Create New Template
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: AUTOMATED TRIGGERS */}
        <TabsContent value="triggers" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trigger 1: Exam Leaderboard Wishing */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Exam Leaderboard Wishing Trigger
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Auto-fires when exam results are published.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px] bg-emerald-600">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  When results for an exam are marked as <strong>Published</strong> or manually triggered by an admin, ZeroEnglish automatically calculates rank, scores, and delivers:
                </p>
                <div className="rounded-lg bg-muted/40 p-3 space-y-2 border text-[11px]">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">1st - 3rd Place</Badge>
                    <span className="text-foreground font-medium">Podium Winner Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">Rank 4+</Badge>
                    <span className="text-foreground font-medium">Participant Score & Standing Email</span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Available directly inside each Exam Detail page.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setActiveTab("templates")}
                  >
                    Configure Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trigger 2: Welcome Onboarding */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Mail className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        New Learner Welcome Guide
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Auto-fires when new user accounts are activated.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Standard
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Provides new learners with direct links to the Vocabulary Explorer, Daily Quiz Challenges, and interactive leaderboard competitions.
                </p>
                <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border text-[11px]">
                  <div className="flex justify-between">
                    <span>Trigger Event:</span>
                    <span className="font-semibold text-foreground">User Registration / First Login</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template Key:</span>
                    <span className="font-mono text-foreground">WELCOME_USER</span>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setSelectedTemplateKey("WELCOME_USER");
                      const found = templates.find((t) => t.key === "WELCOME_USER");
                      if (found) setEditingTemplate(found);
                      setActiveTab("templates");
                    }}
                  >
                    Edit Welcome Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: BROADCAST SENDER */}
        <TabsContent value="broadcast" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Send className="size-4 text-primary" />
                    New Email Broadcast
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Send platform updates, exam alerts, or general news to learners.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Audience</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={broadcastAudience === "ALL" ? "default" : "outline"}
                        onClick={() => setBroadcastAudience("ALL")}
                        className="text-xs"
                      >
                        All Registered Users
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={broadcastAudience === "ADMINS" ? "default" : "outline"}
                        onClick={() => setBroadcastAudience("ADMINS")}
                        className="text-xs"
                      >
                        Platform Admins
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={broadcastAudience === "SPECIFIC" ? "default" : "outline"}
                        onClick={() => setBroadcastAudience("SPECIFIC")}
                        className="text-xs"
                      >
                        Specific Email List
                      </Button>
                    </div>
                  </div>

                  {broadcastAudience === "SPECIFIC" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Recipient Emails (comma or newline separated)</Label>
                      <Textarea
                        rows={3}
                        value={broadcastEmails}
                        onChange={(e) => setBroadcastEmails(e.target.value)}
                        placeholder="user1@example.com, user2@example.com"
                        className="text-xs font-mono"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Subject</Label>
                    <Input
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="Exciting New Quiz Challenge Available!"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">HTML Email Body</Label>
                    <Textarea
                      rows={10}
                      value={broadcastHtml}
                      onChange={(e) => setBroadcastHtml(e.target.value)}
                      placeholder="<p>Hello {{userName}},</p><p>We are thrilled to announce...</p>"
                      className="text-xs font-mono"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 bg-muted/20 border-t py-3 px-4 sm:px-6">
                  <p className="text-[11px] text-muted-foreground">
                    Available variables: <code>&#123;&#123;userName&#125;&#125;</code>, <code>&#123;&#123;userEmail&#125;&#125;</code>
                  </p>
                  <Button
                    size="sm"
                    onClick={handleSendBroadcast}
                    disabled={sendingBroadcast || !broadcastSubject || !broadcastHtml}
                    className="gap-1.5 text-xs font-medium w-full sm:w-auto"
                  >
                    {sendingBroadcast ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        Send Broadcast Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Broadcast Tips */}
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <Info className="size-3.5 text-primary" />
                    Deliverability Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-[11px] text-muted-foreground leading-relaxed">
                  <p>
                    • Keep your subject line concise (under 60 characters) to avoid spam filters.
                  </p>
                  <p>
                    • Include both personalized tags like <code>&#123;&#123;userName&#125;&#125;</code> and clean styling.
                  </p>
                  <p>
                    • Use Gmail SMTP for up to 500 emails/day or connect a dedicated SMTP relay for high volume dispatch.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: DELIVERY LOGS */}
        <TabsContent value="logs" className="space-y-4 focus-visible:outline-none">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="size-4 text-primary" />
                    Dispatched Email Logs
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Real-time status tracking of all automated and manual email deliveries.
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search recipient / subject..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") fetchLogs(1);
                      }}
                      className="text-xs h-8 pl-8 w-full sm:w-48 lg:w-64"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(1)}
                    className="h-8 text-xs gap-1 shrink-0"
                  >
                    <RefreshCw className={`size-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Recipient</th>
                      <th className="py-2.5 px-4">Template / Subject</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Sent At</th>
                      <th className="py-2.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                          Loading logs...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No email delivery logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-foreground">
                            {log.recipientEmail}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-medium text-foreground truncate max-w-xs">
                              {log.subject}
                            </div>
                            {log.templateKey && (
                              <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 h-3.5 mt-0.5">
                                {log.templateKey}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {log.status === "SENT" && (
                              <Badge variant="default" className="text-[10px] bg-emerald-600/90 gap-1">
                                <CheckCircle2 className="size-2.5" /> Sent
                              </Badge>
                            )}
                            {log.status === "FAILED" && (
                              <Badge variant="destructive" className="text-[10px] gap-1">
                                <AlertCircle className="size-2.5" /> Failed
                              </Badge>
                            )}
                            {log.status === "PENDING" && (
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <RefreshCw className="size-2.5 animate-spin" /> Pending
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                              className="h-6 text-[11px] px-2 text-primary hover:text-primary"
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* Pagination footer */}
            <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t py-3 px-4">
              <span className="text-[11px] text-muted-foreground">
                Showing {logs.length} of {totalLogs} delivery records
              </span>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logPage <= 1 || loadingLogs}
                  onClick={() => fetchLogs(logPage - 1)}
                  className="h-7 text-xs px-2.5"
                >
                  Previous
                </Button>
                <span className="text-xs px-2 text-muted-foreground">
                  Page {logPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={logs.length < 15 || loadingLogs}
                  onClick={() => fetchLogs(logPage + 1)}
                  className="h-7 text-xs px-2.5"
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Log Details Modal */}
          {selectedLog && (
            <Dialog open={Boolean(selectedLog)} onOpenChange={() => setSelectedLog(null)}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="size-4 text-primary" />
                    Delivery Log Details #{selectedLog.id}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg border">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Recipient:</span>
                      <span className="font-semibold text-foreground">{selectedLog.recipientEmail}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Status:</span>
                      <span className="font-semibold">{selectedLog.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Template Key:</span>
                      <span className="font-mono text-foreground">{selectedLog.templateKey || "Direct / Custom"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Sent Timestamp:</span>
                      <span>{new Date(selectedLog.sentAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[10px] mb-1">Subject:</span>
                    <p className="p-2 rounded bg-muted/30 border font-medium text-foreground">
                      {selectedLog.subject}
                    </p>
                  </div>

                  {selectedLog.errorMessage && (
                    <div>
                      <span className="text-destructive block text-[10px] mb-1 font-semibold">
                        Error Reason:
                      </span>
                      <p className="p-2 rounded bg-destructive/10 text-destructive border border-destructive/20 font-mono text-[11px] break-words">
                        {selectedLog.errorMessage}
                      </p>
                    </div>
                  )}

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div>
                      <span className="text-muted-foreground block text-[10px] mb-1">
                        Metadata Payload:
                      </span>
                      <pre className="p-2 rounded bg-muted/50 border font-mono text-[10px] overflow-x-auto max-h-40">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button size="sm" onClick={() => setSelectedLog(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
      </Tabs>

      {/* CREATE NEW TEMPLATE MODAL */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent className="sm:max-w-[760px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">Create New Email Template</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Design a custom reusable template for automated triggers or direct user dispatches.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* Quick Layout Presets */}
            <div className="p-3 rounded-xl bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Starter Presets
                </span>
                <span className="text-[10px] text-muted-foreground">Click to load boilerplate layout</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 bg-background"
                  onClick={() => {
                    setNewTemplate((prev) => ({
                      ...prev,
                      subject: "Platform Notification — Zero English",
                      bodyHtml: DEFAULT_STARTER_HTML,
                      variablesText: "userName, userEmail, logoUrl, currentYear",
                    }));
                  }}
                >
                  General Notification
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 bg-background"
                  onClick={() => {
                    const announcementHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Announcement — Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);"></td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 36px 32px;">
              <div style="display: inline-block; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #ea580c; margin-bottom: 14px;">
                Special Announcement
              </div>
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #09090b; letter-spacing: -0.3px; line-height: 1.3;">
                Exciting New Features Are Live, {{userName}}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b; line-height: 1.7;">
                We have just launched new interactive English mastery modules designed to boost your speaking fluency and exam scores.
              </p>
              <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #18181b;">What is new this week:</p>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #52525b; line-height: 1.6;">
                  <li style="margin-bottom: 6px;">Real-time IELTS simulation tests</li>
                  <li style="margin-bottom: 6px;">AI-driven vocabulary coaching</li>
                  <li>Instant leaderboard rankings & certificates</li>
                </ul>
              </div>
              <div style="text-align: center;">
                <a href="{{exploreUrl}}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 10px;">
                  Explore Platform Updates
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
                    setNewTemplate((prev) => ({
                      ...prev,
                      subject: "Exciting New Learning Features Are Live — Zero English",
                      bodyHtml: announcementHtml,
                      variablesText: "userName, userEmail, logoUrl, exploreUrl, currentYear",
                    }));
                  }}
                >
                  Feature Announcement
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 bg-background"
                  onClick={() => {
                    const examFeedbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Results — Zero English</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);"></td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 32px 20px 32px;">
              <img src="{{logoUrl}}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 36px 32px;">
              <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #71717a; margin-bottom: 14px;">
                Exam Results Published
              </div>
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #09090b; letter-spacing: -0.3px; line-height: 1.3;">
                {{examTitle}}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b; line-height: 1.7;">
                Congratulations {{userName}}! Your exam score and rank have been computed.
              </p>
              
              <!-- Metrics Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; text-align: center;">
                <tr>
                  <td width="50%" style="padding: 16px; background-color: #fafafa; border-right: 1px solid #e4e4e7;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">Final Score</div>
                    <div style="font-size: 24px; font-weight: 800; color: #09090b;">{{totalScore}} pts</div>
                  </td>
                  <td width="50%" style="padding: 16px; background-color: #fafafa;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">Position Rank</div>
                    <div style="font-size: 24px; font-weight: 800; color: #ea580c;">#{{rank}}</div>
                  </td>
                </tr>
              </table>

              <div style="text-align: center;">
                <a href="{{leaderboardUrl}}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 10px;">
                  View Full Leaderboard
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                Zero English Platform · Empowering English Fluency<br>
                © {{currentYear}} Zero English. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
                    setNewTemplate((prev) => ({
                      ...prev,
                      subject: "Your Performance Report: {{examTitle}} — Zero English",
                      bodyHtml: examFeedbackHtml,
                      variablesText: "userName, userEmail, examTitle, totalScore, rank, leaderboardUrl, logoUrl, currentYear",
                    }));
                  }}
                >
                  Score & Assessment Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-tpl-name" className="text-xs">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-tpl-name"
                  value={newTemplate.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoKey = val.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
                    setNewTemplate((prev) => ({
                      ...prev,
                      name: val,
                      key: prev.key ? prev.key : autoKey,
                    }));
                  }}
                  placeholder="e.g. Weekly Progress Digest"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-tpl-key" className="text-xs">
                  Unique Key Identifier <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-tpl-key"
                  value={newTemplate.key}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                    }))
                  }
                  placeholder="WEEKLY_PROGRESS_DIGEST"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-tpl-desc" className="text-xs">
                Description (Optional)
              </Label>
              <Input
                id="new-tpl-desc"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief summary of when this email is sent..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-tpl-subject" className="text-xs">
                Subject Line <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-tpl-subject"
                value={newTemplate.subject}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="e.g. Your Weekly Learning Digest — Zero English"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-tpl-variables" className="text-xs">
                Supported Dynamic Variables (comma separated)
              </Label>
              <Input
                id="new-tpl-variables"
                value={newTemplate.variablesText}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, variablesText: e.target.value }))
                }
                placeholder="userName, userEmail, logoUrl, currentYear, score"
                className="text-xs font-mono"
              />
            </div>

            {/* Template Body Section with Code vs Preview Switcher */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-semibold">
                  HTML Body Template <span className="text-destructive">*</span>
                </Label>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border">
                    <Button
                      type="button"
                      variant={createViewMode === "code" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setCreateViewMode("code")}
                      className="h-6 text-[11px] px-2 gap-1 rounded-md"
                    >
                      <Code className="size-3" />
                      HTML Code
                    </Button>
                    <Button
                      type="button"
                      variant={createViewMode === "preview" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setCreateViewMode("preview")}
                      className="h-6 text-[11px] px-2 gap-1 rounded-md text-primary font-medium"
                    >
                      <Eye className="size-3" />
                      Live Preview
                    </Button>
                  </div>

                  {createViewMode === "preview" && (
                    <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border">
                      <Button
                        type="button"
                        variant={createPreviewDevice === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setCreatePreviewDevice("desktop")}
                        className="h-6 px-1.5 text-[11px] gap-1"
                        title="Desktop view"
                      >
                        <Monitor className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={createPreviewDevice === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setCreatePreviewDevice("mobile")}
                        className="h-6 px-1.5 text-[11px] gap-1"
                        title="Mobile view"
                      >
                        <Smartphone className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {createViewMode === "code" ? (
                <div className="space-y-2">
                  {/* Quick Dynamic Variable Inserter */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground font-medium">Insert tag:</span>
                    {[
                      "{{userName}}",
                      "{{userEmail}}",
                      "{{logoUrl}}",
                      "{{currentYear}}",
                      "{{exploreUrl}}",
                      "{{examTitle}}",
                      "{{totalScore}}",
                      "{{rank}}",
                      "{{leaderboardUrl}}",
                    ].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setNewTemplate((prev) => ({
                            ...prev,
                            bodyHtml: prev.bodyHtml + "\n" + v,
                          }));
                          toast.info(`Appended ${v} to HTML template`);
                        }}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/80 hover:bg-primary/10 hover:text-primary transition-colors border border-border/60"
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    id="new-tpl-html"
                    rows={12}
                    value={newTemplate.bodyHtml}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, bodyHtml: e.target.value }))
                    }
                    className="font-mono text-xs leading-relaxed"
                    placeholder="<!DOCTYPE html>..."
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Tip: Switch to the <strong>Live Preview</strong> tab above at any time to see instant visual rendering.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Simulated Subject Header */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border text-xs flex items-center justify-between">
                    <div className="truncate">
                      <span className="text-muted-foreground mr-1.5">Subject:</span>
                      <span className="font-semibold text-foreground">
                        {newTemplate.subject || "(No subject line provided)"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0 ml-2">
                      {createPreviewDevice} Mode
                    </Badge>
                  </div>

                  {/* Responsive IFrame Sandbox */}
                  <div className="flex justify-center bg-muted/30 p-2 sm:p-4 rounded-xl border min-h-[380px] max-h-[460px] overflow-y-auto">
                    <div
                      className={cn(
                        "transition-all duration-300 bg-background shadow-md border rounded-xl overflow-hidden",
                        createPreviewDevice === "desktop"
                          ? "w-full max-w-[600px] min-h-[360px]"
                          : "w-[360px] min-h-[360px]"
                      )}
                    >
                      <iframe
                        title="New Template Live Preview"
                        srcDoc={getRenderedPreviewHtml(newTemplate.bodyHtml)}
                        className="w-full h-[400px] border-0"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 pt-3 border-t bg-muted/20 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreateTemplateOpen(false);
                setCreateViewMode("code");
              }}
              disabled={creatingTemplate}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleCreateTemplate}
              disabled={creatingTemplate || !newTemplate.name.trim() || !newTemplate.subject.trim()}
              className="gap-1.5 text-xs font-medium"
            >
              {creatingTemplate ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
