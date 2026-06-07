import React, { useState, useEffect } from 'react';
import { CheckSquare, ShieldCheck, Flame } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function ApprovalsConsole() {
  const [approvals, setApprovals] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchApprovals = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8109/collaboration/approvals');
      const data = await res.json();
      setApprovals(data || []);
    } catch (err) {
      console.log('Error fetching approvals, using mock fallback.');
      setApprovals([
        { id: 1, action_type: "Create Ticket", status: "Awaiting Approval", payload: { title: "Deploy Release Build - Verified by ICDF Orchestrator" }, created_at: "Just Now", escalation_status: "Standard", sla_deadline_hours: 24 }
      ]);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (id, decision) => {
    setStatusMessage("Processing decision...");
    try {
      const res = await fetch('http://127.0.0.1:8109/collaboration/approval-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: id,
          user_email: "admin_dashboard@icdf.io",
          decision: decision,
          comments: "Approved override via ICDF Console"
        })
      });
      const data = await res.json();
      setStatusMessage(data.message || `Action ${decision}ed successfully!`);
      fetchApprovals();
    } catch (err) {
      setStatusMessage("Decision processed locally (mock approval applied).");
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: decision === 'approve' ? 'Approved' : 'Rejected' } : a));
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">AUTOMATED APPROVALS GATES</h1>
        <p className="text-[10px] text-gray-500 font-mono">SOC2 pipeline compliance gates, ticket escalations and approval logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-cyan-400" /> Pending Gate Approvals
            </h2>
            
            {statusMessage && <div className="text-[10px] text-cyan-400 p-2 bg-white/5 border border-white/5 rounded">{statusMessage}</div>}
            
            <div className="space-y-3">
              {approvals.length === 0 ? (
                <div className="text-gray-500 py-4 text-center">No pending gate approvals found.</div>
              ) : (
                approvals.map(a => (
                  <div key={a.id} className="p-3 bg-black/20 border border-white/5 rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{a.payload?.title || "Release Gate Request"}</span>
                      <GlassBadge color={a.status === 'Approved' ? 'green' : (a.status === 'Rejected' ? 'red' : 'yellow')}>
                        {a.status}
                      </GlassBadge>
                    </div>
                    <div className="text-[10px] text-gray-500 flex gap-4">
                      <span>Created: {a.created_at}</span>
                      <span>Escalation: {a.escalation_status}</span>
                      <span>SLA: {a.sla_deadline_hours}h deadline</span>
                    </div>
                    {a.status === 'Awaiting Approval' && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <GlassButton onClick={() => handleDecision(a.id, "reject")}>Reject Gate</GlassButton>
                        <GlassButton variant="primary" onClick={() => handleDecision(a.id, "approve")}>Approve Gate</GlassButton>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
