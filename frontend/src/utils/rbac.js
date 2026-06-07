// RBAC Utility Functions
export const getNormalizedRole = (role) => {
  if (!role) return '';
  const r = role.toUpperCase().trim().replace(/[\s_/]/g, '');
  if (r === 'COMPLIANCEOFFICER') return 'GOVERNANCE_MANAGER';
  return r;
};

export const getDashboardForRole = (role) => {
  const norm = getNormalizedRole(role);
  const mapping = {
    EXECUTIVE: 'executive-dashboard',
    PRODUCT_MANAGER: 'pm-dashboard',
    BUSINESS_ANALYST: 'ba-dashboard',
    PRODUCT_OWNER: 'po-dashboard',
    PRODUCTOWNER: 'po-dashboard',
    PO: 'po-dashboard',
    PROGRAM_MANAGER: 'program-dashboard',
    DELIVERY_MANAGER: 'program-dashboard',
    DEV_LEAD: 'devlead-dashboard',
    DEVELOPER: 'devlead-dashboard',
    QA_LEAD: 'qa-dashboard',
    QA: 'qa-dashboard',
    ARCHITECT: 'devlead-dashboard',
    AI_ML_ENGINEER: 'devlead-dashboard',
    RPA_DEVELOPER: 'devlead-dashboard',
    DEVOPS_ENGINEER: 'devlead-dashboard',
    GOVERNANCE_MANAGER: 'admin-dashboard',
    ADMIN: 'admin-dashboard'
  };
  return mapping[norm] || 'devlead-dashboard';
};

export const isDashboardAllowed = (role, view) => {
  const norm = getNormalizedRole(role);
  if (!norm) return false;
  if (view === 'login') return true;
  
  const permissions = {
    EXScs: ['executive-dashboard', 'portfolio', 'timeline', 'analytics', 'scenario-planning', 'copilot/strategy', 'workspace'],
    EXECUTIVE: ['executive-dashboard', 'portfolio', 'timeline', 'analytics', 'scenario-planning', 'copilot/strategy', 'workspace'],
    
    PRODUCT_MANAGER: ['pm-dashboard', 'timeline', 'pm/prds', 'analytics', 'copilot/prioritize', 'copilot/collaboration', 'workspace'],
    
    BUSINESS_ANALYST: ['ba-dashboard', 'collaboration/whiteboard', 'pm/meetings', 'copilot/stories', 'pm/documents', 'copilot/prd', 'workspace'],
    
    PRODUCT_OWNER: ['po-dashboard', 'workflows', 'pm/prds', 'copilot/prioritize', 'copilot/stories', 'workspace'],
    PRODUCTOWNER: ['po-dashboard', 'workflows', 'pm/prds', 'copilot/prioritize', 'copilot/stories', 'workspace'],
    PO: ['po-dashboard', 'workflows', 'pm/prds', 'copilot/prioritize', 'copilot/stories', 'workspace'],
    
    PROGRAM_MANAGER: ['program-dashboard', 'resources', 'releases', 'scenario-planning', 'copilot/strategy', 'workspace'],
    DELIVERY_MANAGER: ['program-dashboard', 'resources', 'releases', 'scenario-planning', 'copilot/strategy', 'workspace'],
    
    DEV_LEAD: ['collaboration/whiteboard', 'orchestrator', 'devlead-dashboard', 'health', 'copilot/warroom', 'workspace'],
    DEVELOPER: ['collaboration/whiteboard', 'orchestrator', 'devlead-dashboard', 'health', 'copilot/warroom', 'workspace'],
    ARCHITECT: ['collaboration/whiteboard', 'orchestrator', 'devlead-dashboard', 'health', 'copilot/warroom', 'workspace'],
    AI_ML_ENGINEER: ['collaboration/whiteboard', 'orchestrator', 'devlead-dashboard', 'health', 'copilot/warroom', 'workspace'],
    RPA_DEVELOPER: ['collaboration/whiteboard', 'orchestrator', 'devlead-dashboard', 'health', 'copilot/warroom', 'workspace'],
    DEVOPS_ENGINEER: ['collaboration/whiteboard', 'orchestrator', 'devlead-dashboard', 'health', 'copilot/warroom', 'workspace'],
    
    QA_LEAD: ['qa-dashboard', 'approvals', 'copilot/experimentation', 'workspace'],
    QA: ['qa-dashboard', 'approvals', 'copilot/experimentation', 'workspace'],
    
    ADMIN: ['admin', 'connectors', 'health', 'admin-dashboard', 'usage-analytics', 'brain', 'workspace'],
    GOVERNANCE_MANAGER: ['admin', 'connectors', 'health', 'admin-dashboard', 'usage-analytics', 'brain', 'workspace']
  };
  
  const allowed = permissions[norm] || [];
  return allowed.includes(view);
};

export const isPMRouteAllowed = (role) => {
  const norm = getNormalizedRole(role);
  return ['EXECUTIVE', 'PRODUCT_MANAGER', 'ADMIN'].includes(norm);
};