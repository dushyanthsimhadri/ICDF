import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  MessageSquare, 
  FileText, 
  Wand2, 
  Layers, 
  Radio, 
  ShieldCheck, 
  Database, 
  Settings, 
  Activity, 
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileClock,
  LogOut,
  Compass,
  Users2,
  GitPullRequest,
  Play,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { getNormalizedRole } from '../utils/rbac';

const roleSidebars = {
  EXECUTIVE: {
    title: "Executive Center",
    items: [
      { name: "Executive Dashboard", view: "executive-dashboard", icon: LayoutDashboard },
      { name: "Portfolio Intelligence", view: "portfolio", icon: Layers },
      { name: "Delivery Forecast", view: "timeline", icon: Compass },
      { name: "Budget Analytics", view: "analytics", icon: TrendingUp },
      { name: "Risk Intelligence", view: "scenario-planning", icon: Activity },
      { name: "AI Executive Advisor", view: "copilot/strategy", icon: Wand2 }
    ]
  },
  PRODUCT_MANAGER: {
    title: "PM Studio",
    items: [
      { name: "Product Dashboard", view: "pm-dashboard", icon: KanbanSquare },
      { name: "Roadmap Studio", view: "timeline", icon: Compass },
      { name: "PRD Studio", view: "pm/prds", icon: FileText },
      { name: "Customer Insights", view: "analytics", icon: TrendingUp },
      { name: "Feature Prioritization", view: "copilot/prioritize", icon: Layers },
      { name: "AI Product Copilot", view: "copilot/collaboration", icon: Wand2 }
    ]
  },
  BUSINESS_ANALYST: {
    title: "BA Analytics Hub",
    items: [
      { name: "Requirements Hub", view: "ba-dashboard", icon: Layers },
      { name: "Process Mapping", view: "collaboration/whiteboard", icon: Compass },
      { name: "Meeting Intelligence", view: "pm/meetings", icon: MessageSquare },
      { name: "User Story Generator", view: "copilot/stories", icon: Wand2 },
      { name: "Gap Analysis", view: "pm/documents", icon: FileText },
      { name: "AI BA Assistant", view: "copilot/prd", icon: Wand2 }
    ]
  },
  PRODUCT_OWNER: {
    title: "PO Backlog Ops",
    items: [
      { name: "Backlog Command Center", view: "po-dashboard", icon: Award },
      { name: "Sprint Planning", view: "workflows", icon: KanbanSquare },
      { name: "Acceptance Criteria Studio", view: "pm/prds", icon: FileText },
      { name: "WSJF Prioritization", view: "copilot/prioritize", icon: Layers },
      { name: "AI Product Owner", view: "copilot/stories", icon: Wand2 }
    ]
  },
  PROGRAM_MANAGER: {
    title: "Program Control Room",
    items: [
      { name: "Dependency Matrix", view: "program-dashboard", icon: Radio },
      { name: "Capacity Planning", view: "resources", icon: Users2 },
      { name: "Release Trains", view: "releases", icon: ShieldCheck },
      { name: "Cross-Team Risks", view: "scenario-planning", icon: Activity },
      { name: "AI Program Advisor", view: "copilot/strategy", icon: Wand2 }
    ]
  },
  DEV_LEAD: {
    title: "Engineering Command",
    items: [
      { name: "Architecture Governance", view: "collaboration/whiteboard", icon: Layers },
      { name: "Repository Health", view: "orchestrator", icon: Settings },
      { name: "Technical Debt Board", view: "devlead-dashboard", icon: Activity },
      { name: "Pull Request Center", view: "devlead-dashboard", icon: GitPullRequest },
      { name: "Deployment Command", view: "orchestrator", icon: Play },
      { name: "Security Compliance", view: "health", icon: ShieldCheck },
      { name: "AI Engineering Assistant", view: "copilot/warroom", icon: Wand2 }
    ]
  },
  QA_LEAD: {
    title: "QA Command Center",
    items: [
      { name: "Test Coverage Matrix", view: "qa-dashboard", icon: ShieldCheck },
      { name: "Regression Center", view: "qa-dashboard", icon: Activity },
      { name: "Defect Intelligence", view: "qa-dashboard", icon: AlertTriangle },
      { name: "Release Certification", view: "approvals", icon: CheckSquare },
      { name: "AI QA Assistant", view: "copilot/experimentation", icon: Wand2 }
    ]
  },
  ADMIN: {
    title: "System Admin Panel",
    items: [
      { name: "User Management", view: "admin", icon: Users2 },
      { name: "Tenant Management", view: "connectors", icon: Layers },
      { name: "Security Center", view: "health", icon: ShieldCheck },
      { name: "Audit Logs", view: "admin-dashboard", icon: Database },
      { name: "Billing", view: "usage-analytics", icon: TrendingUp },
      { name: "Product Brain Config", view: "brain", icon: Settings }
    ]
  }
};

export default function Sidebar({ currentUser, currentView, navigateToView, setShowLogoutModal }) {
  const [collapsed, setCollapsed] = useState(false);
  const role = currentUser?.role;

  const norm = getNormalizedRole(role);
  
  // Resolve base role mapping
  let baseRole = 'DEV_LEAD';
  if (norm === 'EXECUTIVE') baseRole = 'EXECUTIVE';
  else if (norm === 'PRODUCT_MANAGER') baseRole = 'PRODUCT_MANAGER';
  else if (norm === 'BUSINESS_ANALYST') baseRole = 'BUSINESS_ANALYST';
  else if (['PRODUCT_OWNER', 'PRODUCTOWNER', 'PO'].includes(norm)) baseRole = 'PRODUCT_OWNER';
  else if (['PROGRAM_MANAGER', 'DELIVERY_MANAGER'].includes(norm)) baseRole = 'PROGRAM_MANAGER';
  else if (['QA_LEAD', 'QA'].includes(norm)) baseRole = 'QA_LEAD';
  else if (['ADMIN', 'GOVERNANCE_MANAGER'].includes(norm)) baseRole = 'ADMIN';
  else if (['DEV_LEAD', 'DEVELOPER', 'ARCHITECT', 'AI_ML_ENGINEER', 'RPA_DEVELOPER', 'DEVOPS_ENGINEER'].includes(norm)) baseRole = 'DEV_LEAD';

  const activeSidebar = roleSidebars[baseRole] || roleSidebars['DEV_LEAD'];

  return (
    <div 
      className={`h-full border-r border-white/5 bg-slate-950 flex flex-col justify-between transition-all duration-300 font-mono text-xs shrink-0 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col">
        <div className="h-16 border-b border-white/5 px-4 flex justify-between items-center shrink-0">
          {!collapsed && <span className="font-bold text-white tracking-widest text-[11px] uppercase">ICDF Platform</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Nav list */}
        <div className="flex-grow overflow-y-auto px-2 py-4 space-y-6 max-h-[calc(100vh-130px)]">
          <div className="space-y-1.5">
            {!collapsed && (
              <span className="text-[8px] font-bold text-cyan-400 px-3 uppercase tracking-wider block">
                {activeSidebar.title}
              </span>
            )}
            <div className="space-y-0.5">
              {activeSidebar.items.map((item, idx) => {
                const isSelected = currentView === item.view;
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.view}-${idx}`}
                    onClick={() => navigateToView(item.view)}
                    className={`w-full flex items-center rounded px-3 py-2 transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/10 text-cyan-400 font-bold border-l-2 border-cyan-400' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sign Out */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center rounded p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-mono"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2 font-bold uppercase text-[10px]">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

