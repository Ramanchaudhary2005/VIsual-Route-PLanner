import React, { useState } from 'react';
import { useGraph } from '../context/GraphContext';
import {
  Play, Pause, RotateCcw, Sparkles, Save, Download,
  Upload, BarChart3, Trash2, Map, Layers, SkipForward, SkipBack,
  Plus, Link
} from 'lucide-react';

export default function Sidebar() {
  const {
    nodes, setNodes,
    edges, setEdges,
    algorithm, setAlgorithm,
    source, setSource,
    destination, setDestination,
    savedGraphs,
    isRunning, isPaused,
    speed, setSpeed,
    steps, currentStepIndex,

    // Actions
    resetSimulation,
    runSimulation,
    pauseSimulation,
    resumeSimulation,
    stepForward,
    stepBackward,
    generateRandomGraph,
    loadPresetGraph,
    exportGraphToJSON,
    importGraphFromJSON,
    saveGraphToDB,
    loadGraphFromDB,
    deleteGraphFromDB,
    compareAlgorithms,
    clearGraph
  } = useGraph();

  const [newGraphName, setNewGraphName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Quick Graph Editor State
  const [nodeInput, setNodeInput] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState(100);

  const handleSave = () => {
    if (!newGraphName.trim()) {
      alert('Enter a valid name to save your graph.');
      return;
    }
    saveGraphToDB(newGraphName.trim());
    setNewGraphName('');
    setShowSaveInput(false);
  };

  const handleAddNode = () => {
    const name = nodeInput.trim();
    if (!name) {
      alert('Please enter a valid node name.');
      return;
    }

    // Check if label exists
    const exists = nodes.some(n => n.data?.label?.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert(`A node named "${name}" already exists.`);
      return;
    }

    resetSimulation();

    const nextId = String(nodes.length > 0 ? Math.max(...nodes.map(n => Number(n.id) || 0)) + 1 : 1);
    const newNode = {
      id: nextId,
      type: 'city',
      position: {
        x: 100 + Math.random() * 250,
        y: 100 + Math.random() * 250
      },
      data: { label: name }
    };

    setNodes(nds => nds.concat(newNode));
    setNodeInput('');
  };

  const handleConnectNodes = () => {
    if (!edgeSource || !edgeTarget) {
      alert('Please select From and To nodes to connect.');
      return;
    }
    if (edgeSource === edgeTarget) {
      alert('Cannot connect a node to itself.');
      return;
    }

    resetSimulation();

    // Check if connection already exists
    const existingIndex = edges.findIndex(
      e => (e.source === edgeSource && e.target === edgeTarget) ||
           (e.source === edgeTarget && e.target === edgeSource)
    );

    const weightNum = Math.max(1, Number(edgeWeight) || 1);

    if (existingIndex >= 0) {
      // Edit weight
      setEdges(eds => eds.map((e, idx) => {
        if (idx === existingIndex) {
          return {
            ...e,
            data: { ...e.data, weight: weightNum },
            label: String(weightNum)
          };
        }
        return e;
      }));
      alert('Connection weight updated successfully!');
    } else {
      // Create new edge
      const edgeId = `e${edgeSource}-${edgeTarget}`;
      const newEdge = {
        id: edgeId,
        source: edgeSource,
        target: edgeTarget,
        type: 'weighted',
        data: { weight: weightNum },
        label: String(weightNum)
      };
      setEdges(eds => eds.concat(newEdge));
      alert('Connection created successfully!');
    }

    setEdgeSource('');
    setEdgeTarget('');
    setEdgeWeight(100);
  };

  const hasSteps = steps.length > 0;

  return (
    <div className="w-full lg:w-96 glass-panel border-r border-slate-200 dark:border-slate-800 p-5 overflow-y-auto flex flex-col gap-6 text-slate-800 dark:text-slate-200 h-full">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6.5 h-6.5 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Route Engine
          </h2>
        </div>
        <p className="text-3xs text-slate-400 uppercase tracking-widest font-semibold">
          Visual Graph Pathfinder
        </p>
      </div>

      {/* Path Configuration */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Path Setup</h3>
        
        {/* Algorithm Select */}
        <div>
          <label className="text-3xs font-semibold text-slate-400 uppercase block mb-1">Pathfinding Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value);
              resetSimulation();
            }}
            disabled={isRunning}
            className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm"
          >
            <option value="dijkstra">Dijkstra's Algorithm ⭐</option>
            <option value="astar">A* Heuristic Search</option>
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
          </select>
        </div>

        {/* Source and Target Nodes */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase block mb-1">Source Node</label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                resetSimulation();
              }}
              disabled={isRunning}
              className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="" disabled>Select Source</option>
              {nodes.map(n => (
                <option key={`src-${n.id}`} value={n.id}>{n.data.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase block mb-1">Destination Node</label>
            <select
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                resetSimulation();
              }}
              disabled={isRunning}
              className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="" disabled>Select Target</option>
              {nodes.map(n => (
                <option key={`dest-${n.id}`} value={n.id}>{n.data.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Graph Editor Panel */}
      <div className="flex flex-col gap-3.5 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Graph Editor</h3>
        
        {/* Add Node Subform */}
        <div className="flex flex-col gap-1.5">
          <label className="text-3xs font-semibold text-slate-400 uppercase block">Quick Add Node</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="City name... (e.g., Lucknow)"
              value={nodeInput}
              onChange={(e) => setNodeInput(e.target.value)}
              disabled={isRunning}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-sm placeholder-slate-400/80"
            />
            <button
              onClick={handleAddNode}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Connect Nodes Subform */}
        <div className="flex flex-col gap-1.5">
          <label className="text-3xs font-semibold text-slate-400 uppercase block">Add / Edit Connection</label>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={edgeSource}
              onChange={(e) => setEdgeSource(e.target.value)}
              disabled={isRunning}
              className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-2xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="">From Node...</option>
              {nodes.map(n => (
                <option key={`esrc-${n.id}`} value={n.id}>{n.data.label}</option>
              ))}
            </select>

            <select
              value={edgeTarget}
              onChange={(e) => setEdgeTarget(e.target.value)}
              disabled={isRunning}
              className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-2xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="">To Node...</option>
              {nodes.map(n => (
                <option key={`etgt-${n.id}`} value={n.id}>{n.data.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5 mt-0.5">
            <div className="flex-1 flex items-center bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-3xs font-bold text-slate-400 mr-2 uppercase">Weight:</span>
              <input
                type="number"
                min="1"
                placeholder="100"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(Number(e.target.value) || '')}
                disabled={isRunning}
                className="w-full bg-transparent border-0 p-0 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-0 focus:outline-none"
              />
            </div>
            
            <button
              onClick={handleConnectNodes}
              disabled={isRunning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm shadow-indigo-500/10 cursor-pointer disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              <Link className="w-3.5 h-3.5" /> Connect
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Playback Actions */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Visual Playback</h3>
        
        {/* Play control triggers */}
        <div className="grid grid-cols-5 gap-1.5">
          {/* Step Back */}
          <button
            onClick={stepBackward}
            disabled={!hasSteps}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 transition-colors cursor-pointer"
            title="Step Back"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Pause or Play */}
          {isRunning ? (
            <button
              onClick={pauseSimulation}
              className="col-span-2 flex items-center justify-center gap-1 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/10 cursor-pointer animate-pulse"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={isPaused && steps.length > 0 ? resumeSimulation : runSimulation}
              className="col-span-2 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" /> {isPaused && steps.length > 0 ? 'Resume' : 'Run'}
            </button>
          )}

          {/* Step Forward */}
          <button
            onClick={stepForward}
            disabled={!hasSteps}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 transition-colors cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            title="Reset highlights"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Slider */}
        <div>
          <div className="flex justify-between text-3xs font-semibold text-slate-400 uppercase mb-1">
            <span>Animation Delay</span>
            <span>{speed}ms</span>
          </div>
          <input
            type="range"
            min="100"
            max="1200"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Diagnostic Steps progress bar */}
        {steps.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex justify-between text-3xs font-semibold text-slate-400 uppercase mb-1">
              <span>Simulation Steps</span>
              <span>{currentStepIndex + 1} / {steps.length}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-150" 
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Preset layouts Loader (Campus & Metro Navigation) */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Presets & Tools</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => loadPresetGraph('campus')}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-2xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-indigo-500" /> Campus Map
          </button>
          <button
            onClick={() => loadPresetGraph('metro')}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-2xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-cyan-500" /> Metro Network
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={generateRandomGraph}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-200/20 hover:bg-indigo-600/15 text-2xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Random Spanner
          </button>
          <button
            onClick={clearGraph}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-rose-200 dark:border-rose-900/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-2xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Board
          </button>
        </div>
      </div>

      {/* Compare Algorithms Diagnostics */}
      <div>
        <button
          onClick={compareAlgorithms}
          disabled={isRunning || nodes.length < 2}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-violet-500/10 cursor-pointer disabled:opacity-40"
        >
          <BarChart3 className="w-4 h-4" /> Compare Algorithms v/s
        </button>
      </div>

      {/* Database Sync Panel */}
      <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Database Sync</h3>
          
          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="text-3xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
          >
            {showSaveInput ? 'Cancel' : 'Save Layout +'}
          </button>
        </div>

        {showSaveInput && (
          <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <input
              type="text"
              placeholder="Graph Name..."
              value={newGraphName}
              onChange={(e) => setNewGraphName(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-2xs font-semibold focus:outline-none"
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white rounded-lg p-1.5 hover:bg-blue-700 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Database List */}
        {savedGraphs.length > 0 ? (
          <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5 pr-1 border border-slate-100 dark:border-slate-800/50 rounded-xl p-1.5">
            {savedGraphs.map(g => (
              <div
                key={`db-${g._id}`}
                className="flex justify-between items-center bg-white/40 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-900/60 px-2.5 py-1.5 rounded-lg text-2xs font-semibold"
              >
                <span className="truncate max-w-[150px] font-bold text-slate-600 dark:text-slate-300">{g.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => loadGraphFromDB(g)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer text-3xs font-extrabold"
                  >
                    Load
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => deleteGraphFromDB(g._id)}
                    className="text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-3xs text-slate-400/70 italic text-center py-2">
            No layouts saved in database yet.
          </p>
        )}
      </div>

      {/* Local JSON Import/Export */}
      <div className="grid grid-cols-2 gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-auto">
        <label className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-2xs font-bold transition-all cursor-pointer">
          <Upload className="w-3.5 h-3.5 text-slate-500" /> Import JSON
          <input
            type="file"
            accept=".json"
            onChange={importGraphFromJSON}
            className="hidden"
          />
        </label>
        <button
          onClick={exportGraphToJSON}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-2xs font-bold transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" /> Export JSON
        </button>
      </div>
    </div>
  );
}
