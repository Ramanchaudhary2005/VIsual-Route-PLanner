import React from 'react';
import { useGraph } from '../context/GraphContext';
import { X, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ComparisonModal() {
  const { comparisonData, setComparisonData, nodes } = useGraph();

  if (!comparisonData) return null;

  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.id] = n.data.label;
  });

  const getPathLabels = (pathIds) => {
    if (!pathIds || pathIds.length === 0) return 'No Path';
    return pathIds.map(id => nodeMap[id] || id).join(' ➔ ');
  };

  const rows = [
    {
      name: "Dijkstra's ⭐",
      time: comparisonData.dijkstra.time,
      distance: comparisonData.dijkstra.distance,
      explored: comparisonData.dijkstra.explored,
      path: comparisonData.dijkstra.path,
      optimality: "Optimal",
      complexity: "O((V + E) log V)",
      note: "Standard baseline for weighted networks.",
      status: "optimal"
    },
    {
      name: "A* Search",
      time: comparisonData.astar.time,
      distance: comparisonData.astar.distance,
      explored: comparisonData.astar.explored,
      path: comparisonData.astar.path,
      optimality: "Optimal",
      complexity: "O((V + E) log V)",
      note: "Euclidean coordinates guide search, visiting fewer nodes.",
      status: "optimal"
    },
    {
      name: "Breadth-First Search (BFS)",
      time: comparisonData.bfs.time,
      distance: comparisonData.bfs.distance,
      explored: comparisonData.bfs.explored,
      path: comparisonData.bfs.path,
      optimality: "Non-Optimal",
      complexity: "O(V + E)",
      note: "Ignores weights. Only optimal for edge count.",
      status: "suboptimal"
    },
    {
      name: "Depth-First Search (DFS)",
      time: comparisonData.dfs.time,
      distance: comparisonData.dfs.distance,
      explored: comparisonData.dfs.explored,
      path: comparisonData.dfs.path,
      optimality: "Non-Optimal",
      complexity: "O(V + E)",
      note: "Pathfinding exploration without routing optimization.",
      status: "warning"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Algorithm Benchmark Comparison
            </h2>
            <p className="text-3xs text-slate-500 mt-0.5">
              Performance statistics calculated live on the active graph layout
            </p>
          </div>
          <button
            onClick={() => setComparisonData(null)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto p-6 flex-1">
          <table className="w-full border-collapse text-left text-2xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-3xs">
                <th className="pb-3 pl-2">Algorithm</th>
                <th className="pb-3 text-center">Execution Time</th>
                <th className="pb-3 text-center">Distance</th>
                <th className="pb-3 text-center">Nodes Explored</th>
                <th className="pb-3 text-center">Optimality</th>
                <th className="pb-3 pl-4">Path Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50 font-semibold text-slate-700 dark:text-slate-300">
              {rows.map((row, idx) => (
                <tr key={`row-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="py-4 pl-2 font-extrabold text-slate-900 dark:text-white text-xs">
                    {row.name}
                  </td>
                  
                  <td className="py-4 text-center font-bold">
                    {row.time < 0.001 ? '< 0.001 ms' : `${row.time.toFixed(3)} ms`}
                  </td>

                  <td className={`py-4 text-center font-bold ${row.status === 'optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {row.distance === Infinity ? 'Unreachable' : `${row.distance} km`}
                  </td>

                  <td className="py-4 text-center font-bold">
                    {row.explored} nodes
                  </td>

                  <td className="py-4 text-center">
                    {row.status === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-3xs font-extrabold border border-emerald-500/10">
                        <CheckCircle2 className="w-3 h-3" /> {row.optimality}
                      </span>
                    ) : row.status === 'suboptimal' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-3xs font-extrabold border border-amber-500/10" title={row.note}>
                        <AlertTriangle className="w-3 h-3" /> {row.optimality}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 text-3xs font-extrabold border border-rose-500/10" title={row.note}>
                        <AlertTriangle className="w-3 h-3" /> {row.optimality}
                      </span>
                    )}
                  </td>

                  <td className="py-4 pl-4 max-w-xs">
                    <p className="truncate text-3xs font-mono font-medium text-slate-500 dark:text-slate-400" title={getPathLabels(row.path)}>
                      {getPathLabels(row.path)}
                    </p>
                    <p className="text-4xs text-slate-400 font-normal italic mt-0.5">{row.note}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 text-3xs text-slate-400 leading-relaxed font-medium flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-300">Observation Notes:</span> Dijkstra's algorithm and A* always guarantee the mathematically optimal shortest route on weighted graphs. However, BFS and DFS search patterns do not check edge weights during evaluation, meaning they can report suboptimal weighted paths. A* uses Euclidean straight-line distance heuristic estimation to reach targets faster, exploring fewer nodes.
          </div>
        </div>
      </div>
    </div>
  );
}
