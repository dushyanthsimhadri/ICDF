import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RoadProgress from './components/RoadProgress';
import Navbar from './components/Navbar';
import Login from './views/Login';
import ExecutiveDashboard from './views/ExecutiveDashboard';
import PMDashboard from './views/PMDashboard';
import BADashboard from './views/BADashboard';
import ProgramDashboard from './views/ProgramDashboard';
import DevLeadDashboard from './views/DevLeadDashboard';
import QADashboard from './views/QADashboard';
import AdminDashboard from './views/AdminDashboard';
import WorkspaceDashboard from './views/WorkspaceDashboard';
import Workflows from './views/Workflows';
import MeetingIntelligence from './views/MeetingIntelligence';
import KnowledgeHub from './views/KnowledgeHub';
import ProductBrain from './views/ProductBrain';
import IntegrationHub from './views/IntegrationHub';
import AdminPortal from './views/AdminPortal';
import Orchestrator from './views/Orchestrator';
import HealthCenter from './views/HealthCenter';
import ApprovalsConsole from './views/ApprovalsConsole';
import UsageAnalytics from './views/UsageAnalytics';
import PortfolioWorkspace from './views/PortfolioWorkspace';
import ReleaseCommandCenter from './views/ReleaseCommandCenter';
import ResourceCapacity from './views/ResourceCapacity';
import TimelineCenter from './views/TimelineCenter';
import AdvancedAnalyticsCenter from './views/AdvancedAnalyticsCenter';
import ScenarioPlanning from './views/ScenarioPlanning';
import PMMessenger from './views/PMMessenger';
import PMDocumentSpace from './views/PMDocumentSpace';
import PMMeetingIntelligence from './views/PMMeetingIntelligence';
import PMPRDSpace from './views/PMPRDSpace';
import WhiteboardSpace from './views/WhiteboardSpace';
import DocumentUploadCenter from './views/DocumentUploadCenter';
import CommandPalette from './components/CommandPalette';
import AIDeliveryCopilot from './components/AIDeliveryCopilot';
import { GlassModal, GlassButton } from './components/GlassComponents';
import { getNormalizedRole, getDashboardForRole, isDashboardAllowed, isPMRouteAllowed } from './utils/rbac';

// Global fetch interceptor to append role and tenant headers automatically
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const userStr = localStorage.getItem('icdf_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const activeRole = localStorage.getItem('icdf_active_role') || user?.role || 'Guest';
  
  const headers = { ...options.headers };
  if (url.toString().includes('127.0.0.1:8109') || url.toString().startsWith('/')) {
    headers['X-User-Role'] = activeRole;
    headers['X-User-Tenant'] = user?.tenant_id || 'acme_corp';
  }
  options.headers = headers;
  return originalFetch(url, options);
};

// AI PM Copilot views
import PRDGenerator from './views/PRDGenerator';
import PrioritizationEngine from './views/PrioritizationEngine';
import StoryGenerator from './views/StoryGenerator';
import StrategyMode from './views/StrategyMode';
import WarRoom from './views/WarRoom';
import ExperimentationLab from './views/ExperimentationLab';
import AnalyticsPlanner from './views/AnalyticsPlanner';
import StakeholderCollaboration from './views/StakeholderCollaboration';
import { ToastContainer } from './components/Common/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('workspace');
  const [simulatedRole, setSimulatedRole] = useState(null);

  // Shared Project States (AI Copilot Context Pipeline)
  const [projectNotes, setProjectNotes] = useState('');
  const [generatedPrd, setGeneratedPrd] = useState('');
  const [analyticsStrategy, setAnalyticsStrategy] = useState('');
  const [userStories, setUserStories] = useState([]);
  const [activeProjectName, setActiveProjectName] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const [activeTheme, setActiveTheme] = useState('dark');
  const [platformMode, setPlatformMode] = useState('Integration');
  const [sprintStatus, setSprintStatus] = useState(45);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Scopes Matrix
  const [activeOrg, setActiveOrg] = useState('Acme Corp');
  const [activeTeam, setActiveTeam] = useState('Platform Engineering');
  const [activeWorkspace, setActiveWorkspace] = useState('ICDF Main Portal');

  const activeRole = simulatedRole || currentUser?.role || 'Guest';

  // Load configuration from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('icdf_user');
    const savedToken = localStorage.getItem('icdf_token');
    const savedMode = localStorage.getItem('icdf_platform_mode');
    const savedTheme = localStorage.getItem('icdf_active_theme');

    if (savedUser && savedToken) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (!localStorage.getItem('icdf_active_role')) {
        localStorage.setItem('icdf_active_role', user.role);
      }
      
      const path = window.location.pathname.replace(/^\//, '');
      if (path && isDashboardAllowed(user.role, path)) {
        setCurrentView(path);
      } else {
        const home = getDashboardForRole(user.role);
        setCurrentView(home);
        window.history.replaceState(null, '', `/${home}`);
      }
    } else {
      setCurrentUser(null);
      if (window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      setCurrentView('login');
    }

    if (savedMode) setPlatformMode(savedMode);
    if (savedTheme) setActiveTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const activeRole = simulatedRole || currentUser?.role;
      if (!currentUser) {
        setCurrentView('login');
      } else if (path && isDashboardAllowed(activeRole, path)) {
        setCurrentView(path);
      } else {
        const home = getDashboardForRole(activeRole);
        setCurrentView(home);
        window.history.replaceState(null, '', `/${home}`);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser, simulatedRole]);

  // Listen for Ctrl+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLoginSuccess = (loginPayload) => {
    localStorage.setItem('icdf_token', loginPayload.access_token);
    localStorage.setItem('icdf_user', JSON.stringify(loginPayload.user));
    localStorage.setItem('icdf_active_role', loginPayload.user.role);
    setCurrentUser(loginPayload.user);
    setSimulatedRole(null);
    const home = getDashboardForRole(loginPayload.user.role);
    setCurrentView(home);
    window.history.replaceState(null, '', `/${home}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('icdf_token');
    localStorage.removeItem('icdf_user');
    localStorage.removeItem('icdf_active_role');
    setCurrentUser(null);
    setSimulatedRole(null);
    setCurrentView('login');
    setShowLogoutModal(false);
    window.history.replaceState(null, '', '/login');
  };

  const navigateToView = (viewName) => {
    if (viewName === 'login' || isDashboardAllowed(activeRole, viewName)) {
      setCurrentView(viewName);
      window.history.pushState(null, '', `/${viewName}`);
    } else {
      const home = getDashboardForRole(activeRole);
      setCurrentView(home);
      window.history.replaceState(null, '', `/${home}`);
    }
  };

  const renderActiveView = () => {
    if (!currentUser) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (currentView !== 'login' && !isDashboardAllowed(activeRole, currentView)) {
      const home = getDashboardForRole(activeRole);
      switch (home) {
        case 'executive-dashboard': return <ExecutiveDashboard />;
        case 'pm-dashboard': return <PMDashboard />;
        case 'ba-dashboard': return <BADashboard />;
        case 'po-dashboard': return <PODashboard />;
        case 'program-dashboard': return <ProgramDashboard />;
        case 'devlead-dashboard': return <DevLeadDashboard />;
        case 'qa-dashboard': return <QADashboard />;
        case 'admin-dashboard': return <AdminDashboard />;
        default: return <DevLeadDashboard />;
      }
    }

    switch (currentView) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case 'executive-dashboard':
        return <ExecutiveDashboard />;
      case 'pm-dashboard':
        return <PMDashboard />;
      case 'ba-dashboard':
        return <BADashboard />;
      case 'program-dashboard':
        return <ProgramDashboard />;
      case 'devlead-dashboard':
        return <DevLeadDashboard />;
      case 'qa-dashboard':
        return <QADashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'workspace':
        return <WorkspaceDashboard currentUser={{ ...currentUser, role: activeRole }} />;
      case 'workflows':
        return <Workflows />;
      case 'meetings':
        return <MeetingIntelligence />;
      case 'knowledge':
        return <KnowledgeHub />;
      case 'brain':
        return <ProductBrain />;
      case 'connectors':
        return <IntegrationHub />;
      case 'orchestrator':
        return <Orchestrator />;
      case 'health':
        return <HealthCenter />;
      case 'approvals':
        return <ApprovalsConsole />;
      case 'admin':
        return <AdminPortal />;
      case 'usage-analytics':
        return <UsageAnalytics />;
      case 'portfolio':
        return <PortfolioWorkspace />;
      case 'releases':
        return <ReleaseCommandCenter />;
      case 'resources':
        return <ResourceCapacity />;
      case 'timeline':
        return <TimelineCenter />;
      case 'analytics':
        return <AdvancedAnalyticsCenter />;
      case 'scenario-planning':
        return <ScenarioPlanning />;
      case 'pm/messenger':
        return <PMMessenger />;
      case 'pm/documents':
        return <PMDocumentSpace />;
      case 'pm/meetings':
        return <PMMeetingIntelligence />;
      case 'pm/prds':
        return <PMPRDSpace />;
      case 'collaboration/whiteboard':
        return <WhiteboardSpace />;
      case 'collaboration/uploads':
        return <DocumentUploadCenter />;
      case 'copilot/prd':
        return (
          <PRDGenerator 
            generatedPrd={generatedPrd}
            setGeneratedPrd={setGeneratedPrd}
            projectNotes={projectNotes}
            setProjectNotes={setProjectNotes}
            setActiveProjectName={setActiveProjectName}
            addToast={addToast}
          />
        );
      case 'copilot/prioritize':
        return (
          <PrioritizationEngine 
            model="qwen"
            addToast={addToast}
          />
        );
      case 'copilot/stories':
        return (
          <StoryGenerator 
            generatedPrd={generatedPrd}
            userStories={userStories}
            setUserStories={setUserStories}
            addToast={addToast}
          />
        );
      case 'copilot/strategy':
        return (
          <StrategyMode 
            model="qwen"
            addToast={addToast}
          />
        );
      case 'copilot/warroom':
        return (
          <WarRoom 
            model="qwen"
            addToast={addToast}
          />
        );
      case 'copilot/experimentation':
        return (
          <ExperimentationLab 
            model="qwen"
            addToast={addToast}
          />
        );
      case 'copilot/analytics':
        return (
          <AnalyticsPlanner 
            generatedPrd={generatedPrd}
            analyticsStrategy={analyticsStrategy}
            setAnalyticsStrategy={setAnalyticsStrategy}
            addToast={addToast}
          />
        );
      case 'copilot/collaboration':
        return (
          <StakeholderCollaboration 
            generatedPrd={generatedPrd}
            addToast={addToast}
          />
        );
      default:
        return <WorkspaceDashboard currentUser={{ ...currentUser, role: activeRole }} />;
    }
  };

  if (!currentUser || currentView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden theme-${activeTheme} bg-slate-955 text-white font-sans`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        currentUser={{ ...currentUser, role: activeRole }} 
        currentView={currentView} 
        navigateToView={navigateToView}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* Main Workspace Frame */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        <Navbar 
          activeTheme={activeTheme} 
          setActiveTheme={(theme) => {
            setActiveTheme(theme);
            localStorage.setItem('icdf_active_theme', theme);
          }} 
          currentUser={currentUser} 
          handleLogout={() => setShowLogoutModal(true)}
          platformMode={platformMode}
          setPlatformMode={(mode) => {
            setPlatformMode(mode);
            localStorage.setItem('icdf_platform_mode', mode);
          }}
          simulatedRole={simulatedRole}
          setSimulatedRole={(role) => {
            const finalRole = role || currentUser.role;
            setSimulatedRole(role);
            localStorage.setItem('icdf_active_role', finalRole);
            const home = getDashboardForRole(finalRole);
            setCurrentView(home);
            window.history.pushState(null, '', `/${home}`);
          }}
          activeOrg={activeOrg}
          setActiveOrg={setActiveOrg}
          activeTeam={activeTeam}
          setActiveTeam={setActiveTeam}
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
        />

        {/* Top road status progress indicator */}
        <div className="px-6 pb-2 pt-2 shrink-0">
          <RoadProgress sprintStatus={sprintStatus} setSprintStatus={setSprintStatus} />
        </div>

        {/* Dynamic view screen */}
        <main className="flex-grow overflow-y-auto px-6 pb-8 pt-2">
          <div className="max-w-[1600px] mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <GlassModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        title="Confirm Logout"
      >
        <div className="space-y-4 text-center p-2 font-mono">
          <p className="text-xs text-gray-300 leading-relaxed">Are you sure you want to sign out from ICDF?</p>
          <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
            <GlassButton onClick={() => setShowLogoutModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="danger" onClick={handleLogout}>
              Logout
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Keyboard Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
        setCurrentView={navigateToView} 
      />

      {/* AI Delivery Copilot Floating Panel */}
      <AIDeliveryCopilot currentUser={{ ...currentUser, role: activeRole }} />

      {/* Toast Alert Popups */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
