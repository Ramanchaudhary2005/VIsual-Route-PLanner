import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  getStraightPath,
  EdgeLabelRenderer,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraph } from '../context/GraphContext';
import { Trash2, MapPin } from 'lucide-react';

// Custom City Node Component
function CityNode({ id, data, selected }) {
  const { nodeStates, setNodes, setEdges } = useGraph();
  const state = nodeStates[id]; // 'visited' | 'frontier' | 'current' | 'path'
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleBlur = () => {
    setIsEditing(false);
    if (!label.trim()) return;
    setNodes(nds => nds.map(node => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, label } };
      }
      return node;
    }));
  };

  // Node styles based on simulation traversal status
  let nodeColorClass = 'bg-white border-slate-400 text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-55';
  let pinColorClass = 'text-indigo-600 dark:text-indigo-400';
  let pulseClass = '';

  if (state === 'visited') {
    nodeColorClass = 'bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-500 dark:text-white';
    pinColorClass = 'text-white';
    pulseClass = 'node-pulse-visited';
  } else if (state === 'frontier') {
    nodeColorClass = 'bg-orange-500 border-orange-600 text-white dark:bg-orange-600 dark:border-orange-500 dark:text-white';
    pinColorClass = 'text-white';
    pulseClass = 'node-pulse-frontier';
  } else if (state === 'current') {
    nodeColorClass = 'bg-blue-500 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-500 dark:text-white';
    pinColorClass = 'text-white';
    pulseClass = 'node-pulse-current';
  } else if (state === 'path') {
    nodeColorClass = 'bg-gradient-to-r from-rose-500 to-pink-500 border-rose-600 text-white dark:from-rose-600 dark:to-pink-600 dark:border-rose-500 font-extrabold shadow-lg shadow-rose-500/30';
    pinColorClass = 'text-white';
  }

  const handleDelete = (e) => {
    e.stopPropagation();
    // Delete this node and all connected edges
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div
      className={`group relative px-4 py-2.5 rounded-2xl border-2 text-sm min-w-[125px] text-center transition-all duration-300 shadow-md hover:scale-105 hover:shadow-lg ${nodeColorClass} ${pulseClass} ${
        selected ? 'ring-4 ring-blue-500/40 border-blue-500 dark:ring-blue-400/40 dark:border-blue-400' : ''
      }`}
    >
      {/* Node Input Handles */}
      <Handle type="target" position={Position.Top} id="t" className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} id="s" className="!w-2.5 !h-2.5" />

      <div className="flex items-center justify-center gap-1.5 w-full">
        <MapPin className={`w-3.5 h-3.5 shrink-0 ${pinColorClass}`} />
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            autoFocus
            className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-center border border-blue-500 rounded-lg focus:outline-none w-full font-extrabold focus:ring-2 focus:ring-blue-500/20 px-1 py-0.5 text-xs"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="cursor-pointer font-black select-none truncate text-xs tracking-wide w-full"
            title="Double click to rename"
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Delete trigger */}
      <button
        onClick={handleDelete}
        className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-all shadow-md cursor-pointer border border-rose-600 opacity-0 group-hover:opacity-100"
        title="Delete Node"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// Custom Weighted Edge Component
function WeightedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data
}) {
  const { edgeStates, setEdges, theme } = useGraph();
  const state = edgeStates[id]; // 'path' | 'active'
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(data?.weight || 100);

  const handleBlur = () => {
    setIsEditing(false);
    const numWeight = Math.max(1, Number(weight) || 1);
    setWeight(numWeight);
    setEdges(eds => eds.map(edge => {
      if (edge.id === id) {
        return {
          ...edge,
          data: { ...edge.data, weight: numWeight },
          label: String(numWeight)
        };
      }
      return edge;
    }));
  };

  const handleDeleteEdge = () => {
    setEdges(eds => eds.filter(e => e.id !== id));
  };

  // Traversal styling color code
  let strokeColor = theme === 'dark' ? '#576b85' : '#788da8'; // high visibility default gray-blue
  let strokeWidth = 3;
  let pathClass = '';

  if (state === 'active') {
    strokeColor = '#f97316'; // orange visiting edge
    strokeWidth = 4.5;
    pathClass = 'edge-active-animation';
  } else if (state === 'path') {
    strokeColor = '#f43f5e'; // final shortest path
    strokeWidth = 6.5;
    pathClass = 'edge-path-animation';
  }

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${pathClass} transition-all duration-300`}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all'
          }}
          className="nodrag nopan group/label"
        >
          {isEditing ? (
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
              autoFocus
              className="w-14 text-center text-xs font-extrabold px-1.5 py-0.5 rounded-lg border border-blue-500 bg-white text-slate-800 shadow-lg focus:outline-none"
            />
          ) : (
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setIsEditing(true)}
                className={`px-2.5 py-1 rounded-full text-2xs font-extrabold shadow-md border transition-all duration-200 cursor-pointer
                  ${state === 'path'
                    ? 'bg-rose-500 border-rose-600 text-white scale-110 shadow-rose-500/20'
                    : 'bg-slate-100 border-slate-400 text-slate-800 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100'
                  }
                `}
                title="Click to edit weight"
              >
                {data?.weight || 0}
              </button>
              
              {/* Delete Edge button on hover */}
              <button
                onClick={handleDeleteEdge}
                className="absolute -top-4 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-all border border-rose-600 opacity-0 group-hover/label:opacity-100 shadow-md cursor-pointer"
                title="Delete Road"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  city: CityNode,
  default: CityNode
};

const edgeTypes = {
  weighted: WeightedEdge
};

// Canvas wrapper to allow projecting click coords
function CanvasContent() {
  const { nodes, setNodes, edges, setEdges, resetSimulation } = useGraph();
  const { screenToFlowPosition } = useReactFlow();

  // Double click to create node
  const onPaneDoubleClick = useCallback((event) => {
    // Prevent default double click zoom
    event.preventDefault();
    resetSimulation();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    const nextId = String(nodes.length > 0 ? Math.max(...nodes.map(n => Number(n.id) || 0)) + 1 : 1);
    
    // Sequential naming helper
    const cityList = [
      'Delhi', 'Mumbai', 'Pune', 'Jaipur', 'Bangalore', 
      'Chennai', 'Kolkata', 'Hyderabad', 'Bhopal', 'Ahmedabad'
    ];
    const label = cityList[(Number(nextId) - 1) % cityList.length] + ` ${Math.floor((Number(nextId) - 1) / cityList.length) + 1}`;

    const newNode = {
      id: nextId,
      type: 'city',
      position,
      data: { label }
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes, screenToFlowPosition, resetSimulation]);

  // Connect nodes handler
  const onConnect = useCallback((params) => {
    resetSimulation();
    const source = params.source;
    const target = params.target;

    if (source === target) return;

    // Check if edge already exists
    const exists = edges.some(
      (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
    );
    if (exists) return;

    const defaultWeight = 100;
    const edgeId = `e${source}-${target}`;
    const newEdge = {
      id: edgeId,
      source,
      target,
      type: 'weighted',
      data: { weight: defaultWeight },
      label: String(defaultWeight)
    };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [edges, setEdges, resetSimulation]);

  const onNodesChange = useCallback((changes) => {
    resetSimulation();
    setNodes((nds) => {
      // Manual mapping of react flow changes for basic drag/selection
      let updated = [...nds];
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          updated = updated.map(n => n.id === change.id ? { ...n, position: change.position } : n);
        } else if (change.type === 'select') {
          updated = updated.map(n => n.id === change.id ? { ...n, selected: change.selected } : n);
        }
      });
      return updated;
    });
  }, [setNodes, resetSimulation]);

  const onEdgesChange = useCallback((changes) => {
    resetSimulation();
    setEdges((eds) => {
      let updated = [...eds];
      changes.forEach(change => {
        if (change.type === 'select') {
          updated = updated.map(e => e.id === change.id ? { ...e, selected: change.selected } : e);
        }
      });
      return updated;
    });
  }, [setEdges, resetSimulation]);

  return (
    <div className="w-full h-full relative" onDoubleClick={onPaneDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="w-full h-full"
      >
        <Background gap={20} size={1} className="bg-grid-dots" />
        <Controls className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !shadow-md rounded-lg [&_button]:!border-slate-100 dark:[&_button]:!border-slate-800 [&_button]:!text-slate-600 dark:[&_button]:!text-slate-400 hover:[&_button]:!bg-slate-50 dark:hover:[&_button]:!bg-slate-800" />
      </ReactFlow>

      {/* Double click instruction watermark */}
      <div className="absolute bottom-4 left-4 pointer-events-none select-none text-3xs font-semibold uppercase tracking-wider text-slate-400/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
        💡 Double-click blank area to create Node. Drag connections.
      </div>
    </div>
  );
}

export default function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
