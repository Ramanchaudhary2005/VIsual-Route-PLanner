import React from 'react';
import { useGraph } from '../context/GraphContext';
import { Activity, Clock, Navigation, Zap, Network, ShieldCheck } from 'lucide-react';

export default function StatsPanel() {
  const { stats, shortestPath, steps, currentStepIndex, nodes } = useGraph();

  const isAnimationFinished = steps.length > 0 && currentStepIndex === steps.length - 1;

  if (!stats || !isAnimationFinished) {
    return (
      <div className="glass-panel rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-4 flex items-center justify-center text-slate-400 text-2xs font-bold gap-2">
        <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
        {steps.length > 0 ? 'Animating route search traversal...' : 'Run pathfinding to view execution statistics'}
      </div>
    );
  }

  // Create node lookup map
  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.id] = n.data?.label || n.id;
  });

  // Round execution speed to 3 decimals or display < 0.001
  const executionTimeStr = stats.executionTimeMs < 0.001 
    ? '< 0.001' 
    : stats.executionTimeMs.toFixed(3);

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-4.5 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Path Statistics
          </h3>
        </div>
        
        {shortestPath.length > 0 ? (
          <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" /> Optimal Route Found
          </span>
        ) : (
          <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400">
            Unreachable Destination
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Distance */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900/40">
          <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Distance</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {stats.distance === Infinity ? 'Infinity' : `${stats.distance} km`}
            </p>
          </div>
        </div>

        {/* Execution Time */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900/40">
          <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/5 text-blue-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Execution Time</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {executionTimeStr} ms
            </p>
          </div>
        </div>

        {/* Nodes Explored */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900/40">
          <div className="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/5 text-orange-500">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Nodes Visited</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {stats.nodesVisited} nodes
            </p>
          </div>
        </div>

        {/* Time & Space Complexity */}
        <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900/40">
          <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-500">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Complexity</p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {stats.algoComplexity.time}
            </p>
          </div>
        </div>
      </div>

      {/* Nodes Exploration Order Sequence */}
      <div className="bg-orange-600/5 border border-orange-500/10 rounded-xl p-3 text-2xs text-slate-500 dark:text-slate-400 font-medium">
        <span className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-3xs block mb-1.5 flex items-center gap-1">
          <Network className="w-3.5 h-3.5" /> Exploration Order ({stats.nodesVisited} nodes visited)
        </span>
        <div className="flex flex-wrap items-center gap-1 mt-1 font-semibold text-slate-700 dark:text-slate-350">
          {steps.map((step, idx) => {
            const nodeName = nodeMap[step.current] || step.current;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400 dark:text-slate-600 select-none mx-0.5 text-4xs">➔</span>}
                <span className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-3xs shadow-sm">
                  {nodeName}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Description / Mathematical Breakdown */}
      {stats.algoComplexity.desc && (
        <div className="bg-blue-600/5 border border-blue-500/10 rounded-xl p-3 text-2xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-3xs block mb-0.5">Complexity Insight</span>
          {stats.algoComplexity.desc}
        </div>
      )}
    </div>
  );
}
