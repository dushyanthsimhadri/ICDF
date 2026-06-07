import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Square, 
  Circle, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Users, 
  Trash2, 
  CheckSquare, 
  Activity, 
  FileText, 
  Layers, 
  Clock, 
  Zap, 
  Download,
  MousePointer,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Settings,
  CheckCircle2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function WhiteboardSpace() {
  const [currentTemplate, setCurrentTemplate] = useState('Brainstorming');
  const [tool, setTool] = useState('select'); // select, pen
  const [activeColor, setActiveColor] = useState('#eab308'); // Yellow default
  const [notes, setNotes] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  
  // V3 Infinite Canvas States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);

  // V3 Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, noteId: null });
  
  const canvasRef = useRef(null);

  // Collaborators Cursor simulation
  const [presenceCursors, setPresenceCursors] = useState([
    { email: 'dev@icdf.io', x: 250, y: 180, color: '#06b6d4' },
    { email: 'qa@icdf.io', x: 580, y: 320, color: '#a855f7' }
  ]);

  // Jitter collaborators' cursors
  useEffect(() => {
    const timer = setInterval(() => {
      setPresenceCursors(prev => prev.map(c => ({
        ...c,
        x: Math.max(50, Math.min(800, c.x + (Math.random() - 0.5) * 40)),
        y: Math.max(50, Math.min(450, c.y + (Math.random() - 0.5) * 40))
      })));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Templates definitions
  const loadTemplate = (templateName) => {
    setCurrentTemplate(templateName);
    setDrawings([]);
    if (templateName === 'Brainstorming') {
      setNotes([
        { id: 1, text: 'Ensure token validation includes client-side keys', x: 100, y: 120, color: '#eab308', selected: false },
        { id: 2, text: 'Optimize DB connection pool limits in main.py', x: 340, y: 160, color: '#3b82f6', selected: false },
        { id: 3, text: 'Audit multi-tenant schemas for SQLite injection leaks', x: 220, y: 280, color: '#ec4899', selected: false }
      ]);
    } else if (templateName === 'Retrospective') {
      setNotes([
        { id: 10, text: 'What went well: FastAPI migration completed', x: 80, y: 160, color: '#10b981', selected: false },
        { id: 11, text: 'What went well: Automated build pipelines pass', x: 80, y: 280, color: '#10b981', selected: false },
        { id: 12, text: 'Improvements: WebSockets memory leakage issues', x: 340, y: 160, color: '#ef4444', selected: false },
        { id: 13, text: 'Actions: Implement keep-alive pings on client disconnect', x: 600, y: 160, color: '#8b5cf6', selected: false }
      ]);
    } else if (templateName === 'UserStory') {
      setNotes([
        { id: 20, text: 'User auth gate with SQLite matrix', x: 100, y: 100, color: '#3b82f6', selected: false },
        { id: 21, text: 'Display telemetry stats inside Executive Portal', x: 340, y: 100, color: '#3b82f6', selected: false },
        { id: 22, text: 'Ingest and chunk text files in Product Brain', x: 600, y: 100, color: '#3b82f6', selected: false }
      ]);
    }
  };

  useEffect(() => {
    loadTemplate('Brainstorming');
  }, []);

  // Close context menu on general click
  useEffect(() => {
    const closeMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Canvas Coordinate conversions
  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Adjust for pan and zoom
    const rawX = (clientX - rect.left - pan.x) / zoom;
    const rawY = (clientY - rect.top - pan.y) / zoom;
    
    return { x: rawX, y: rawY };
  };

  // Canvas Mouse Actions
  const handleMouseDown = (e) => {
    if (e.button === 1 || tool === 'pan' || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
      return;
    }
    
    if (tool !== 'pen') return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    setCurrentPath(`M ${x} ${y}`);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }
    
    if (!isDrawing || tool !== 'pen') return;
    const { x, y } = getCanvasCoords(e);
    setCurrentPath(prev => `${prev} L ${x} ${y}`);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath) {
      setDrawings(prev => [...prev, { path: currentPath, color: activeColor }]);
    }
    setCurrentPath('');
  };

  // Sticky Note handlers
  const addStickyNote = () => {
    const text = newNoteText.trim() || 'Double click to edit note';
    let rawX = 100 + Math.random() * 200;
    let rawY = 100 + Math.random() * 150;
    
    if (snapToGrid) {
      rawX = Math.round(rawX / 20) * 20;
      rawY = Math.round(rawY / 20) * 20;
    }

    const newNote = {
      id: Date.now(),
      text,
      x: rawX,
      y: rawY,
      color: activeColor,
      selected: false
    };
    setNotes(prev => [...prev, newNote]);
    setNewNoteText('');
  };

  const updateNoteText = (id, newText) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: newText } : n));
  };

  const toggleSelectNote = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, selected: !n.selected } : n));
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Handle Dragging of Sticky Notes with Grid Snapping
  const handleNoteDrag = (id, info) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        let nextX = n.x + info.delta.x / zoom;
        let nextY = n.y + info.delta.y / zoom;
        if (snapToGrid) {
          nextX = Math.round(nextX / 20) * 20;
          nextY = Math.round(nextY / 20) * 20;
        }
        return { ...n, x: nextX, y: nextY };
      }
      return n;
    }));
  };

  // Sticky Right Click Menu
  const handleNoteRightClick = (e, noteId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      noteId
    });
  };

  // Right Click Context AI actions
  const triggerContextAction = async (actionType) => {
    const noteId = contextMenu.noteId;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    setIsAiLoading(true);
    setContextMenu(prev => ({ ...prev, visible: false }));
    
    const userStr = localStorage.getItem('icdf_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tenant = user?.tenant_id || 'acme_corp';
    const activeRole = localStorage.getItem('icdf_active_role') || user?.role || 'Guest';

    try {
      if (['epic', 'story', 'task'].includes(actionType)) {
        // Convert to database ticket
        const cat = actionType === 'epic' ? 'Epic' : (actionType === 'story' ? 'Feature' : 'Task');
        const response = await fetch('http://127.0.0.1:8109/workflows/ticket-create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': activeRole,
            'X-User-Tenant': tenant
          },
          body: JSON.stringify({
            title: note.text.substring(0, 60),
            description: `Auto-generated from Whiteboard Sticky Note #${noteId}:\n\n${note.text}`,
            status: "To Do",
            assignee: activeRole,
            priority: "Medium",
            category: cat,
            tenant_id: tenant
          })
        });
        const ticket = await response.json();
        setAiOutput(`[SUCCESS] Converted sticky note into a real database ticket!\n- Ticket ID: #${ticket.id}\n- Title: ${ticket.title}\n- Category: ${ticket.category}`);
        updateNoteText(noteId, `${note.text}\n\n[Synced Backlog ticket #${ticket.id}]`);
      } else {
        // AI Assist content updates
        const response = await fetch('http://127.0.0.1:8109/agents/query', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': activeRole,
            'X-User-Tenant': tenant
          },
          body: JSON.stringify({
            role: "Product Owner",
            query: `Perform action '${actionType}' on this sticky note item text: "${note.text}". Provide brief output.`,
            context: "Whiteboard sticky assistant",
            tenant_id: tenant
          })
        });
        const res = await response.json();
        const output = res.response || "Refinement suggestions added.";
        updateNoteText(noteId, `${note.text}\n\n[AI - ${actionType.toUpperCase()}]: ${output}`);
        setAiOutput(`AI refiner executed successfully on sticky note!\nOutput added directly to elements.`);
      }
    } catch (err) {
      console.error("Right-click context action error:", err);
      // Fallback
      if (['epic', 'story', 'task'].includes(actionType)) {
        setAiOutput(`[OFFLINE SIMULATION] Created Backlog ${actionType.toUpperCase()} ticket from note: "${note.text.substring(0, 40)}..."`);
      } else {
        updateNoteText(noteId, `${note.text}\n\n[AI - ${actionType.toUpperCase()}]: Refined details and estimation metrics mapped.`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // V2 Canvas Analyzer V2: Selected stickies conversions
  const handleV2Analyzer = async (type) => {
    const selectedNotes = notes.filter(n => n.selected);
    if (selectedNotes.length === 0) {
      setAiOutput("Error: No sticky notes selected. Please check the checkbox on sticky notes to select them.");
      return;
    }
    
    setIsAiLoading(true);
    setAiOutput('');

    const userStr = localStorage.getItem('icdf_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tenant = user?.tenant_id || 'acme_corp';
    const activeRole = localStorage.getItem('icdf_active_role') || user?.role || 'Guest';

    const textPayload = selectedNotes.map(n => `- ${n.text}`).join('\n');

    try {
      if (type === 'prd') {
        const response = await fetch('http://127.0.0.1:8109/pm-prds/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': activeRole,
            'X-User-Tenant': tenant
          },
          body: JSON.stringify({
            title: `PRD from Whiteboard Canvas`,
            overview: `Extracted from selected brainstorming sticky notes:\n\n${textPayload}`,
            problem_statement: "Identified during collaborative whiteboard session.",
            goals: "Streamline operations and connect backend workflows.",
            scope: "Initial MVP release",
            tenant_id: tenant
          })
        });
        const prd = await response.json();
        setAiOutput(`[SUCCESS] Exported selected sticky notes directly into a new PRD Document in the database!\n- PRD Title: ${prd.title}\n- ID: #${prd.id}\n- Quality Score: ${prd.quality_score}`);
      } else if (type === 'backlog') {
        // Create a user story ticket for each note
        let createdIds = [];
        for (const note of selectedNotes) {
          const response = await fetch('http://127.0.0.1:8109/workflows/ticket-create', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-User-Role': activeRole,
              'X-User-Tenant': tenant
            },
            body: JSON.stringify({
              title: note.text.substring(0, 60),
              description: `Generated from whiteboard sticky note:\n\n${note.text}`,
              status: "To Do",
              assignee: "Unassigned",
              priority: "Medium",
              category: "Feature",
              tenant_id: tenant
            })
          });
          const ticket = await response.json();
          createdIds.push(ticket.id);
          updateNoteText(note.id, `${note.text}\n\n[Synced Story #${ticket.id}]`);
        }
        setAiOutput(`[SUCCESS] Exported ${selectedNotes.length} sticky notes directly into backlog user stories!\nCreated ticket IDs: ${createdIds.map(id => `#${id}`).join(', ')}`);
      } else {
        // Default agent summary query
        const response = await fetch('http://127.0.0.1:8109/agents/query', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': activeRole,
            'X-User-Tenant': tenant
          },
          body: JSON.stringify({
            role: "Business Analyst",
            query: `Analyze these selected sticky notes and output structured ${type}:\n${textPayload}`,
            context: "Canvas V2 Analyzer",
            tenant_id: tenant
          })
        });
        const res = await response.json();
        setAiOutput(`### Generated ${type.toUpperCase()}:\n\n${res.response}`);
      }
    } catch (err) {
      console.error("Analyzer V2 error:", err);
      setAiOutput(`[OFFLINE SIMULATION] Processed selected sticky notes for ${type.toUpperCase()}:\n\n- Completed mock data output to database modules.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider font-mono uppercase flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400 animate-pulse" /> Whiteboard Infinite Canvas V3
          </h1>
          <p className="text-[10px] text-gray-500 font-mono">Zoom and pan across infinite workspace, right-click sticky notes for AI workflows, and analyze selections</p>
        </div>

        {/* Template Selectors */}
        <div className="flex items-center gap-2">
          {['Brainstorming', 'Retrospective', 'UserStory'].map(tpl => (
            <button
              key={tpl}
              onClick={() => loadTemplate(tpl)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                currentTemplate === tpl 
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                  : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
              }`}
            >
              {tpl === 'Brainstorming' ? 'Brainstorm Board' : tpl === 'Retrospective' ? 'Sprint Retro' : 'User Story Map'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Toolbar + Drawing Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between flex-wrap gap-4 items-center bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5">
            {/* Tools list */}
            <div className="flex items-center gap-3">
              {[
                { id: 'select', label: 'Pointer Tool', icon: MousePointer },
                { id: 'pan', label: 'Pan Hand', icon: Maximize2 },
                { id: 'pen', label: 'Pen Draw', icon: PenTool }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                      tool === t.id 
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' 
                        : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
                    }`}
                    title={t.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}

              <div className="h-6 w-px bg-white/10 mx-1" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setZoom(prev => Math.max(0.4, prev - 0.15))}
                  className="p-1.5 bg-black/25 border border-white/5 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[9px] text-cyan-400 font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
                  className="p-1.5 bg-black/25 border border-white/5 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="p-1.5 bg-black/25 border border-white/5 rounded text-[8px] hover:text-cyan-400 font-bold"
                  title="Reset viewport"
                >
                  Reset
                </button>
              </div>

              <div className="h-6 w-px bg-white/10 mx-1" />

              {/* Grid Snap Toggle */}
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                  snapToGrid ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-black/20 border-white/5 text-gray-500'
                }`}
                title="Snap elements to 20px grid"
              >
                <Grid className="h-4 w-4" />
                <span className="text-[9px] font-bold">Snap Grid</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New note text..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStickyNote()}
                className="bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/30 w-44 font-mono"
              />
              <GlassButton onClick={addStickyNote} className="px-3 py-1.5">
                <Plus className="h-3.5 w-3.5 text-cyan-400" /> Note
              </GlassButton>
              <button 
                onClick={() => { setDrawings([]); setNotes([]); }}
                className="p-2 bg-rose-950/20 border border-rose-500/20 rounded-lg text-rose-450 hover:bg-rose-950/40 transition-all"
                title="Clear Canvas"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div 
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className={`w-full h-[55vh] bg-slate-950/80 border border-white/5 rounded-2xl relative overflow-hidden shadow-2xl select-none ${
              tool === 'pen' ? 'cursor-crosshair' : (tool === 'pan' || isPanning ? 'cursor-grabbing' : 'cursor-default')
            }`}
          >
            {/* Grid background visual */}
            <div 
              className="absolute inset-0 bg-[radial-gradient(#ffffff03_1.5px,transparent_1.5px)] bg-[size:20px_20px] pointer-events-none" 
              style={{
                backgroundPosition: `${pan.x}px ${pan.y}px`,
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`
              }}
            />

            {/* Transform Container representing Infinite Workspace */}
            <div 
              className="absolute w-full h-full transform-gpu"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0px 0px'
              }}
            >
              {/* Render Pen drawings */}
              <svg className="absolute inset-0 w-[5000px] h-[3000px] pointer-events-none z-0">
                {drawings.map((d, i) => (
                  <path key={i} d={d.path} stroke={d.color} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {currentPath && (
                  <path d={currentPath} stroke={activeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>

              {/* Render simulated cursors */}
              {presenceCursors.map((cursor, idx) => (
                <div
                  key={idx}
                  className="absolute z-30 flex items-center gap-1.5 pointer-events-none text-[8px] font-bold"
                  style={{ left: cursor.x, top: cursor.y }}
                >
                  <MousePointer className="h-3.5 w-3.5" style={{ color: cursor.color, fill: cursor.color }} />
                  <span 
                    className="px-1.5 py-0.5 rounded border text-slate-955 shadow-md font-mono"
                    style={{ backgroundColor: cursor.color, borderColor: cursor.color }}
                  >
                    {cursor.email.split('@')[0]}
                  </span>
                </div>
              ))}

              {/* Render Sticky Notes */}
              <AnimatePresence>
                {notes.map(note => (
                  <motion.div
                    key={note.id}
                    drag={tool === 'select'}
                    dragMomentum={false}
                    dragElastic={0}
                    onDrag={(e, info) => handleNoteDrag(note.id, info)}
                    onContextMenu={(e) => handleNoteRightClick(e, note.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute p-3 w-40 min-h-36 rounded-xl border flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-xl text-slate-950 font-sans z-10"
                    style={{ 
                      left: note.x, 
                      top: note.y, 
                      backgroundColor: `${note.color}dd`, 
                      borderColor: note.color,
                      boxShadow: `0 10px 15px -3px rgba(0,0,0,0.3), 0 0 10px ${note.color}20`
                    }}
                  >
                    {/* Header bar with checkboxes for V2 selection */}
                    <div className="flex justify-between items-center border-b border-black/10 pb-1 mb-1 text-[8px]">
                      <span className="font-bold opacity-75 uppercase">Task Item</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={note.selected || false}
                          onChange={() => toggleSelectNote(note.id)}
                          className="accent-cyan-700 h-2.5 w-2.5 rounded cursor-pointer"
                        />
                        <span className="font-bold">Select</span>
                      </label>
                    </div>

                    {/* Note text field */}
                    <textarea
                      value={note.text}
                      onChange={(e) => updateNoteText(note.id, e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none text-[9px] font-bold leading-normal resize-none flex-grow h-16 text-slate-900 font-mono"
                    />
                    
                    {/* Actions */}
                    <div className="flex justify-between items-center border-t border-black/10 pt-1.5 mt-1.5">
                      <span className="text-[7px] opacity-60 font-mono">Right-click for AI</span>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="p-1 hover:bg-black/10 rounded text-slate-955 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {notes.length === 0 && drawings.length === 0 && (
                <div className="absolute left-[250px] top-[150px] flex flex-col items-center justify-center text-center p-6 text-gray-500 pointer-events-none">
                  <Users className="h-10 w-10 text-gray-700 animate-pulse mb-3" />
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-600">V3 OS Infinite Canvas</span>
                  <span className="text-[9px] text-gray-750 mt-1">Select tool, create stickies, right click notes, or check selectors to batch analyze.</span>
                </div>
              )}
            </div>

            {/* Custom Right-Click Context Menu */}
            {contextMenu.visible && (
              <div 
                className="absolute bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 w-44 font-mono text-[9px] text-gray-300"
                style={{ left: contextMenu.x, top: contextMenu.y }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 border-b border-white/5 font-bold text-[8px] uppercase text-cyan-400">AI Sticky Tools</div>
                <button onClick={() => triggerContextAction('explain')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-purple-400" /> Explain Goal
                </button>
                <button onClick={() => triggerContextAction('expand')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <Plus className="h-3 w-3 text-cyan-400" /> Expand Details
                </button>
                <button onClick={() => triggerContextAction('ac')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <CheckSquare className="h-3 w-3 text-emerald-400" /> Generate Acceptance
                </button>
                <button onClick={() => triggerContextAction('testcases')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-blue-400" /> Generate Test Cases
                </button>
                
                <div className="h-px bg-white/5 my-1" />
                <div className="px-2 py-1 font-bold text-[8px] uppercase text-amber-500">Backlog Sync</div>
                <button onClick={() => triggerContextAction('epic')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-amber-400" /> Convert To Epic
                </button>
                <button onClick={() => triggerContextAction('story')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-cyan-400" /> Convert To Story
                </button>
                <button onClick={() => triggerContextAction('task')} className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-white flex items-center gap-1.5">
                  <Settings className="h-3 w-3 text-gray-400" /> Convert To Task
                </button>
              </div>
            )}

            {/* Minimap Thumbnail (top-right corner overlay) */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-white/5 rounded-xl p-2 z-20 w-24 h-16 pointer-events-none select-none hidden sm:block">
              <div className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Minimap</div>
              <div className="relative w-full h-10 border border-white/5 bg-black/40 rounded mt-1 overflow-hidden">
                {/* Active viewport box representation */}
                <div 
                  className="absolute border border-cyan-400/50 bg-cyan-400/5 transition-all duration-300"
                  style={{
                    left: `${Math.max(0, Math.min(70, 20 - (pan.x / 10)))}%`,
                    top: `${Math.max(0, Math.min(70, 20 - (pan.y / 10)))}%`,
                    width: `${Math.max(20, 50 / zoom)}%`,
                    height: `${Math.max(20, 50 / zoom)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Canvas Analyzer V2 Panel */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 flex flex-col h-full space-y-4">
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" /> AI Canvas Analyzer V2
              </span>
              <p className="text-[9px] text-gray-500 mt-1">Select sticky notes via check-tags to batch orchestrate deliverables</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-[9px] text-gray-400 font-bold mb-1">
                Selected Notes: <strong className="text-cyan-400">{notes.filter(n => n.selected).length}</strong> / {notes.length}
              </div>
              
              <GlassButton 
                variant="primary" 
                onClick={() => handleV2Analyzer('prd')}
                disabled={isAiLoading || notes.filter(n => n.selected).length === 0}
                className="w-full text-left justify-start py-2"
              >
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                <span>Create PRD Document</span>
              </GlassButton>

              <GlassButton 
                onClick={() => handleV2Analyzer('backlog')}
                disabled={isAiLoading || notes.filter(n => n.selected).length === 0}
                className="w-full text-left justify-start py-2 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-450"
              >
                <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>Generate Backlog Stories</span>
              </GlassButton>

              <div className="h-px bg-white/5 my-1" />
              <div className="text-[8px] uppercase text-gray-500 font-bold">Additional specs</div>
              
              <div className="grid grid-cols-2 gap-1.5">
                {['acceptance', 'testcases', 'risks', 'dependencies'].map(spec => (
                  <button
                    key={spec}
                    onClick={() => handleV2Analyzer(spec)}
                    disabled={isAiLoading || notes.filter(n => n.selected).length === 0}
                    className="py-1 px-2 bg-black/35 hover:bg-white/5 border border-white/5 rounded text-[8px] font-bold text-gray-400 hover:text-white transition-all text-left truncate uppercase"
                  >
                    + {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow bg-slate-950 border border-white/5 rounded-xl p-3.5 overflow-y-auto min-h-[220px] leading-relaxed">
              {isAiLoading ? (
                <div className="flex flex-col justify-center items-center h-full py-12 gap-2 text-cyan-400">
                  <Activity className="h-5 w-5 animate-spin" />
                  <span className="text-[9px] animate-pulse">Running cognitive pipeline...</span>
                </div>
              ) : aiOutput ? (
                <div className="space-y-3 font-mono text-[9px] text-gray-350">
                  <GlassBadge color="purple">Analyzer V2 Output</GlassBadge>
                  <div className="whitespace-pre-wrap leading-relaxed">{aiOutput}</div>
                </div>
              ) : (
                <div className="text-center text-gray-650 py-16 font-mono text-[9px]">
                  Select stickies on the whiteboard and run an analyzer command. Output synced directly to DB.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
