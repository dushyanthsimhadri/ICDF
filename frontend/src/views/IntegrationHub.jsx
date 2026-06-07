import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  HelpCircle, 
  Save, 
  RefreshCw, 
  MessageSquare, 
  Cpu, 
  FileText, 
  Folder, 
  Users, 
  Wifi, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Play
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function IntegrationHub() {
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/mock/secret");
  const [jiraUrl, setJiraUrl] = useState("https://acme-corp.atlassian.net");
  const [azureProject, setAzureProject] = useState("ICDF-Kernel-Core");
  const [confluenceSpace, setConfluenceSpace] = useState("ICDF-PM-PRDS");
  const [notionWorkspace, setNotionWorkspace] = useState("Acme Product Docs");
  const [teamsWebhook, setTeamsWebhook] = useState("https://outlook.office.com/webhook/mock");
  const [driveFolder, setDriveFolder] = useState("ICDF_Delivery_Assets");

  // Sync Telemetry Logs state
  const [telemetryLogs, setTelemetryLogs] = useState([
    { time: "14:40:02", service: "Jira Sync", event: "Successfully parsed 12 backlog stories", status: "success" },
    { time: "14:40:15", service: "Slack Webhook", event: "Dispatched consensus approval notifications", status: "success" },
    { time: "14:41:10", service: "Azure DevOps", event: "Ingested active deployment telemetry pipeline", status: "success" },
    { time: "14:42:05", service: "Confluence Space", event: "Compiled Q2 Product Requirements list (3 documents)", status: "success" }
  ]);

  const [activeSyncing, setActiveSyncing] = useState(null);

  // Simulate incoming live telemetry sync events
  useEffect(() => {
    const services = ["Jira Sync", "Slack Webhook", "Azure DevOps", "Confluence Space", "Notion Workspace", "Teams Alerts", "Google Drive"];
    const events = [
      "Polled active release train status.",
      "Synchronized whiteboard stickies to story backlog.",
      "Uploaded weekly briefing markdown document.",
      "Flushed cache of Tri-Agent Consensus endpoint.",
      "Re-indexed requirements document workspace.",
      "Dispatched sprint delay warning to executive channels."
    ];

    const interval = setInterval(() => {
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      setTelemetryLogs(prev => [
        { time: currentTime, service: randomService, event: randomEvent, status: "success" },
        ...prev.slice(0, 9) // Keep last 10 logs
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const triggerManualSync = (serviceName) => {
    setActiveSyncing(serviceName);
    setTimeout(() => {
      setActiveSyncing(null);
      const currentTime = new Date().toTimeString().split(' ')[0];
      setTelemetryLogs(prev => [
        { time: currentTime, service: serviceName, event: `Manual trigger: Forced complete telemetry re-sync.`, status: "success" },
        ...prev
      ]);
    }, 1500);
  };

  const connectors = [
    { 
      id: "jira", 
      name: "Atlassian Jira", 
      desc: "Bidirectional user story synchronization & sprint backlog planning.", 
      icon: Layers, 
      status: "Connected", 
      color: "text-blue-400 border-blue-500/25 bg-blue-950/20",
      value: jiraUrl,
      setValue: setJiraUrl,
      label: "Jira Domain URL"
    },
    { 
      id: "slack", 
      name: "Slack Channels", 
      desc: "Outbound alerts for Tri-Agent consensus decisions & sprint delay forecasts.", 
      icon: MessageSquare, 
      status: "Connected", 
      color: "text-emerald-400 border-emerald-500/25 bg-emerald-950/20",
      value: slackWebhook,
      setValue: setSlackWebhook,
      label: "Slack Inbound Webhook"
    },
    { 
      id: "azure", 
      name: "Azure DevOps", 
      desc: "Ingest CI/CD release pipeline logs, commit hashes & test suites.", 
      icon: Cpu, 
      status: "Syncing", 
      color: "text-cyan-400 border-cyan-500/25 bg-cyan-950/20",
      value: azureProject,
      setValue: setAzureProject,
      label: "Azure Organization/Project"
    },
    { 
      id: "confluence", 
      name: "Confluence Wiki", 
      desc: "Publish compiled PRD blueprints & technical design documents.", 
      icon: FileText, 
      status: "Connected", 
      color: "text-amber-400 border-amber-500/25 bg-amber-950/20",
      value: confluenceSpace,
      setValue: setConfluenceSpace,
      label: "Target Wiki Space Key"
    },
    { 
      id: "notion", 
      name: "Notion Workspace", 
      desc: "Import raw whiteboard ideas & user journey stickies directly.", 
      icon: FileText, 
      status: "Configured", 
      color: "text-purple-400 border-purple-500/25 bg-purple-950/20",
      value: notionWorkspace,
      setValue: setNotionWorkspace,
      label: "Notion API Database ID"
    },
    { 
      id: "teams", 
      name: "Microsoft Teams", 
      desc: "Publish daily standup transcript updates & critical QA defects logs.", 
      icon: Users, 
      status: "Connected", 
      color: "text-teal-400 border-teal-500/25 bg-teal-950/20",
      value: teamsWebhook,
      setValue: setTeamsWebhook,
      label: "Teams Webhook URL"
    },
    { 
      id: "gdrive", 
      name: "Google Drive Store", 
      desc: "Export weekly audio transcript recordings & meeting briefing summaries.", 
      icon: Folder, 
      status: "Disconnected", 
      color: "text-rose-400 border-rose-500/25 bg-rose-955/20",
      value: driveFolder,
      setValue: setDriveFolder,
      label: "Shared Folder Path"
    }
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">ENTERPRISE INTEGRATION HUB</h1>
        <p className="text-[10px] text-gray-500 font-mono">Connect and monitor external systems. All data points feed directly into the central sqlite telemetry layer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sync Telemetry Dashboard */}
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 lg:col-span-1 h-fit">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2 uppercase">
            <Activity className="h-4 w-4 text-cyan-400" /> Sync Telemetry HUD
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 p-2.5 rounded border border-white/5">
              <span className="text-[9px] text-gray-500 uppercase">Success Rate</span>
              <div className="text-base font-bold text-white mt-0.5">99.8%</div>
            </div>
            <div className="bg-black/20 p-2.5 rounded border border-white/5">
              <span className="text-[9px] text-gray-500 uppercase">Latency Rate</span>
              <div className="text-base font-bold text-cyan-400 mt-0.5">42 ms</div>
            </div>
            <div className="bg-black/20 p-2.5 rounded border border-white/5">
              <span className="text-[9px] text-gray-500 uppercase">Active Connectors</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">6 / 7</div>
            </div>
            <div className="bg-black/20 p-2.5 rounded border border-white/5">
              <span className="text-[9px] text-gray-500 uppercase">Total Syncs (24h)</span>
              <div className="text-base font-bold text-purple-400 mt-0.5">4,281</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
              <span className="text-gray-400">Telemetry Sync Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Wifi className="h-3.5 w-3.5 animate-pulse" /> Live & Online
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
              <span className="text-gray-400">Database Context Lock:</span>
              <span className="text-gray-300 font-mono">SQLite (Open)</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-white uppercase block">Sync Event Streams:</span>
            <div className="bg-black/30 p-3 rounded border border-white/5 font-mono text-[9px] text-gray-400 h-[210px] overflow-y-auto space-y-2 leading-relaxed">
              {telemetryLogs.map((log, index) => (
                <div key={index} className="border-b border-white/5 pb-1.5 last:border-0">
                  <div className="flex justify-between font-semibold">
                    <span className="text-cyan-400">[{log.time}] {log.service}</span>
                    <span className="text-emerald-500">ok</span>
                  </div>
                  <div className="text-gray-300 mt-0.5">{log.event}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Connectors Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map((conn) => {
              const IconComp = conn.icon;
              return (
                <GlassCard key={conn.id} className="p-4 bg-slate-900/60 border-white/5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <IconComp className="h-4.5 w-4.5 text-cyan-400" />
                        <span className="font-bold text-white">{conn.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded border text-[8px] uppercase font-bold tracking-wider ${
                        conn.status === "Connected" ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" :
                        conn.status === "Syncing" ? "text-cyan-400 border-cyan-500/20 bg-cyan-950/20 animate-pulse" :
                        conn.status === "Configured" ? "text-purple-400 border-purple-500/20 bg-purple-950/20" :
                        "text-rose-400 border-rose-500/20 bg-rose-955/20"
                      }`}>
                        {conn.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{conn.desc}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-gray-500 text-[9px] font-semibold uppercase">{conn.label}:</label>
                      <input 
                        type="text" 
                        value={conn.value}
                        onChange={(e) => conn.setValue(e.target.value)}
                        className="bg-black/35 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-400/30 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[8.5px] text-gray-600">Interval: 15s checks</span>
                    <div className="flex gap-2">
                      <GlassButton 
                        onClick={() => triggerManualSync(conn.name)} 
                        disabled={activeSyncing === conn.name}
                        className="text-[9px] px-2 py-1 flex items-center gap-1.5"
                      >
                        <RefreshCw className={`h-3 w-3 ${activeSyncing === conn.name ? 'animate-spin' : ''}`} />
                        {activeSyncing === conn.name ? 'Syncing...' : 'Sync'}
                      </GlassButton>
                      <GlassButton className="text-[9px] px-2 py-1 text-gray-400 hover:text-white">
                        Configure
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

