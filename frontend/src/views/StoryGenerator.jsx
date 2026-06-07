import React, { useState, useEffect } from 'react';
import { GitMerge, Sparkles, RefreshCw, Download, Edit2, Check, Plus, Trash2 } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const StoryGenerator = ({ 
  model = 'qwen', 
  generatedPrd, 
  userStories = [], 
  setUserStories = () => {}, 
  addToast = () => {} 
}) => {
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editStory, setEditStory] = useState({ id: '', title: '', description: '', acceptance_criteria: '', priority: 'Must', story_points: 5, epic: '' });
  const [showAddStory, setShowAddStory] = useState(false);
  const [newStory, setNewStory] = useState({ id: '', title: '', description: '', acceptance_criteria: '', priority: 'Must', story_points: 3, epic: 'Core Core' });

  useEffect(() => {
    if (generatedPrd && userStories.length === 0 && !loading) {
      handleGenerateStories();
    }
  }, [generatedPrd]);

  const handleGenerateStories = async () => {
    if (!generatedPrd) {
      addToast('No active PRD found. Please generate a PRD first or run the simulation.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8109/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: generatedPrd, model })
      });

      if (response.ok) {
        const data = await response.json();
        setUserStories(data.stories || []);
        addToast('Agile user stories generated successfully!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Failed to generate stories'}`, 'error');
      }
    } catch (e) {
      // Fallback loader
      const mockResponse = await fetch('http://127.0.0.1:8109/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: generatedPrd || 'Mock Schedule PRD', model: 'mock' })
      });
      const data = await mockResponse.json();
      setUserStories(data.stories || []);
      addToast('User stories generated in Fallback Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (userStories.length === 0) {
      addToast('No user stories available to export.', 'warning');
      return;
    }

    const headers = ['Issue Type', 'Summary', 'Description', 'Acceptance Criteria', 'Priority', 'Story Points', 'Epic Link'];
    
    // Map priorities to Jira priorities format
    const mapPriority = (p) => {
      if (p === 'Must') return 'Highest';
      if (p === 'Should') return 'High';
      if (p === 'Could') return 'Medium';
      return 'Low';
    };

    const rows = userStories.map(story => [
      'Story',
      `"${story.title.replace(/"/g, '""')}"`,
      `"${story.description.replace(/"/g, '""')}"`,
      `"${story.acceptance_criteria.replace(/"/g, '""')}"`,
      mapPriority(story.priority),
      story.story_points,
      `"${story.epic.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'jira_user_stories_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Jira CSV downloaded! Import this directly in Jira -> Import Issues.', 'success');
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditStory({ ...userStories[index] });
  };

  const saveEdit = (index) => {
    const updated = [...userStories];
    updated[index] = editStory;
    setUserStories(updated);
    setEditingIndex(null);
    addToast('Story updated locally.', 'success');
  };

  const deleteStory = (index) => {
    const updated = userStories.filter((_, i) => i !== index);
    setUserStories(updated);
    addToast('User story deleted.', 'info');
  };

  const addCustomStory = () => {
    if (!newStory.title.trim() || !newStory.description.trim()) {
      addToast('Story Title and Description are required.', 'warning');
      return;
    }
    const nextId = `US-${101 + userStories.length}`;
    setUserStories([...userStories, { ...newStory, id: nextId }]);
    setNewStory({ id: '', title: '', description: '', acceptance_criteria: '', priority: 'Must', story_points: 3, epic: 'Features' });
    setShowAddStory(false);
    addToast('Added new user story.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-indigo-400" /> AI User Story Generator
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">Decompose system requirements into developer-ready scrum user stories and point estimates.</p>
        </div>
        {userStories.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Jira CSV
            </button>
            <button
              onClick={handleGenerateStories}
              disabled={loading}
              className="px-4 py-2 bg-slate-905 border border-white/5 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center transition-colors cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />}
              Re-Generate
            </button>
          </div>
        )}
      </div>

      {!generatedPrd ? (
        <div className="p-8 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[300px] bg-slate-900/60">
          <GitMerge className="w-14 h-14 mb-4 text-slate-600 stroke-[1.5]" />
          <h4 className="text-sm font-bold text-slate-355">No Active PRD Pipeline Found</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 font-mono leading-relaxed">
            We auto-map requirements from the active PRD to Agile User Stories. Head to the PRD Generator or trigger the fallback below.
          </p>
          <button
            onClick={handleGenerateStories}
            className="bg-slate-800 border border-white/10 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400 animate-pulse" />
            Generate Simulated Stories
          </button>
        </div>
      ) : loading ? (
        <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40">
          <SkeletonLoader type="table" rows={4} />
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          {/* Create custom story widget */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddStory(!showAddStory)}
              className="px-4 py-2 bg-slate-900 border border-white/10 text-indigo-400 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer font-mono"
            >
              {showAddStory ? 'Cancel' : 'Add Custom User Story'}
            </button>
          </div>

          {showAddStory && (
            <div className="p-6 rounded-2xl border border-indigo-500/20 space-y-4 bg-slate-900/60 font-mono">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Story Template</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Story Title</label>
                  <input
                    type="text"
                    placeholder="Provide a short developer task name"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Epic Mapping</label>
                  <input
                    type="text"
                    placeholder="Epic Name"
                    value={newStory.epic}
                    onChange={(e) => setNewStory({ ...newStory, epic: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Description (User Persona Format)</label>
                  <textarea
                    placeholder="As a [user], I want to [action], so that [goal]..."
                    value={newStory.description}
                    onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase">Acceptance Criteria (Given-When-Then)</label>
                  <textarea
                    placeholder="Given doctor scheduling is open, when patient submits text, then appointment is booked..."
                    value={newStory.acceptance_criteria}
                    onChange={(e) => setNewStory({ ...newStory, acceptance_criteria: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase">Scrum Story Points</label>
                  <select
                    value={newStory.story_points}
                    onChange={(e) => setNewStory({ ...newStory, story_points: parseInt(e.target.value) })}
                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                  >
                    {[1, 2, 3, 5, 8, 13].map(n => <option key={n} value={n}>{n} pts</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase">MoSCoW Priority</label>
                  <select
                    value={newStory.priority}
                    onChange={(e) => setNewStory({ ...newStory, priority: e.target.value })}
                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                  >
                    {['Must', 'Should', 'Could', "Won't"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addCustomStory}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer font-mono"
                  >
                    Add Story
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Stories List */}
          <div className="grid grid-cols-1 gap-4 font-mono text-xs">
            {userStories.map((story, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all bg-slate-900/40"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {story.id}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editStory.epic}
                            onChange={(e) => setEditStory({ ...editStory, epic: e.target.value })}
                            className="bg-black border border-white/10 rounded px-1.5 py-0.5 text-xs text-slate-355 w-32"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">
                            Epic: {story.epic}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <select
                              value={editStory.priority}
                              onChange={(e) => setEditStory({ ...editStory, priority: e.target.value })}
                              className="bg-black border border-white/10 rounded px-1 text-xs text-white"
                            >
                              {['Must', 'Should', 'Could', "Won't"].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select
                              value={editStory.story_points}
                              onChange={(e) => setEditStory({ ...editStory, story_points: parseInt(e.target.value) })}
                              className="bg-black border border-white/10 rounded px-1 text-xs text-white"
                            >
                              {[1, 2, 3, 5, 8, 13].map(n => <option key={n} value={n}>{n} pts</option>)}
                            </select>
                          </>
                        ) : (
                          <>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              story.priority === 'Must' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              story.priority === 'Should' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              story.priority === 'Could' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {story.priority}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-white/5 text-slate-300">
                              {story.story_points} Story Points
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="space-y-2 font-sans">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editStory.title}
                            onChange={(e) => setEditStory({ ...editStory, title: e.target.value })}
                            className="bg-black border border-white/10 rounded px-2 py-1 text-sm font-semibold text-white w-full"
                          />
                          <textarea
                            value={editStory.description}
                            onChange={(e) => setEditStory({ ...editStory, description: e.target.value })}
                            className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-slate-300 w-full h-14 resize-none"
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="text-sm font-bold text-white font-mono">{story.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                            {story.description}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Acceptance Criteria */}
                    <div className="space-y-1 bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                        Acceptance Criteria (Given-When-Then)
                      </span>
                      {isEditing ? (
                        <textarea
                          value={editStory.acceptance_criteria}
                          onChange={(e) => setEditStory({ ...editStory, acceptance_criteria: e.target.value })}
                          className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-slate-300 w-full h-14 resize-none"
                        />
                      ) : (
                        <p className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap">{story.acceptance_criteria}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end space-x-2">
                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(idx)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Save Story
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(idx)}
                        className="px-3 py-1 bg-slate-800 border border-white/5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-semibold flex items-center cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteStory(idx)}
                      className="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-semibold flex items-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
