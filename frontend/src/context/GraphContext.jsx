import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GraphContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};

// Initial nodes and edges for visual presentation
const DEFAULT_NODES = [
  { id: '1', type: 'city', data: { label: 'Delhi' }, position: { x: 150, y: 150 } },
  { id: '2', type: 'city', data: { label: 'Jaipur' }, position: { x: 450, y: 100 } },
  { id: '3', type: 'city', data: { label: 'Mumbai' }, position: { x: 200, y: 400 } },
  { id: '4', type: 'city', data: { label: 'Pune' }, position: { x: 500, y: 450 } }
];

const DEFAULT_EDGES = [
  { id: 'e1-2', source: '1', target: '2', data: { weight: 120 }, label: '120' },
  { id: 'e1-3', source: '1', target: '3', data: { weight: 300 }, label: '300' },
  { id: 'e3-4', source: '3', target: '4', data: { weight: 150 }, label: '150' },
  { id: 'e2-4', source: '2', target: '4', data: { weight: 280 }, label: '280' }
];

export const GraphProvider = ({ children }) => {
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [edges, setEdges] = useState(DEFAULT_EDGES);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [source, setSource] = useState('1');
  const [destination, setDestination] = useState('4');

  // Themes and presets
  const [theme, setTheme] = useState('light'); // Default to light mode
  const [graphType, setGraphType] = useState('normal'); // normal, campus, metro
  const [savedGraphs, setSavedGraphs] = useState([]);

  // Simulation / Animation states
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [shortestPath, setShortestPath] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(400); // Animation delay in ms
  const [stats, setStats] = useState(null);

  // Active comparison state
  const [comparisonData, setComparisonData] = useState(null);

  // Visual highlights for nodes and edges
  const [nodeStates, setNodeStates] = useState({}); // nodeId -> 'visited' | 'frontier' | 'current' | 'path'
  const [edgeStates, setEdgeStates] = useState({}); // edgeId -> 'path' | 'active'

  const intervalRef = useRef(null);

  // Sync theme to root class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load list of saved graphs from database on mount
  const fetchSavedGraphs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/graphs`);
      setSavedGraphs(res.data);
    } catch (err) {
      console.warn('Could not fetch saved graphs (API server may be offline):', err.message);
    }
  };

  useEffect(() => {
    fetchSavedGraphs();
  }, []);

  // Sync Source & Destination choices when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      const nodeIds = nodes.map(n => n.id);
      if (!nodeIds.includes(source)) {
        setSource(nodeIds[0]);
      }
      if (!nodeIds.includes(destination)) {
        setDestination(nodeIds[nodeIds.length - 1] || '');
      }
    } else {
      setSource('');
      setDestination('');
    }
  }, [nodes]);

  // Stop simulation on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Update visual styles based on the current step in animation
  useEffect(() => {
    if (currentStepIndex === -1) {
      // Clear visual state
      setNodeStates({});
      setEdgeStates({});
      return;
    }

    if (steps.length === 0 || currentStepIndex >= steps.length) return;

    const step = steps[currentStepIndex];
    const newNodeStates = {};
    const newEdgeStates = {};

    // Visited nodes are colored Green
    step.visited.forEach(id => {
      newNodeStates[id] = 'visited';
    });

    // Frontier (open list / queue) nodes are colored Orange
    step.frontier.forEach(id => {
      newNodeStates[id] = 'frontier';
    });

    // Current node being processed is colored Blue (glow / active)
    newNodeStates[step.current] = 'current';

    // Highlight traversed edges during exploration
    // If a node is visited, highlight edges connecting it to its parent/frontier if they have been explored
    edges.forEach(edge => {
      const u = edge.source;
      const v = edge.target;
      // If one of the endpoints is current and the other is visited/frontier, mark it active
      if ((u === step.current && (step.visited.includes(v) || step.frontier.includes(v))) ||
          (v === step.current && (step.visited.includes(u) || step.frontier.includes(u)))) {
        newEdgeStates[edge.id] = 'active';
      }
    });

    // If we have reached the last step and have a shortest path, paint the final path Red
    const isLastStep = currentStepIndex === steps.length - 1;
    if (isLastStep && shortestPath && shortestPath.length > 0) {
      for (let i = 0; i < shortestPath.length; i++) {
        newNodeStates[shortestPath[i]] = 'path';
      }
      // Paint edges on path Red
      for (let i = 0; i < shortestPath.length - 1; i++) {
        const u = shortestPath[i];
        const v = shortestPath[i + 1];
        const edge = edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
        if (edge) {
          newEdgeStates[edge.id] = 'path';
        }
      }
    }

    setNodeStates(newNodeStates);
    setEdgeStates(newEdgeStates);
  }, [currentStepIndex, steps, shortestPath, edges]);

  // Handle visual playback step intervals
  useEffect(() => {
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            // Finished playing
            setIsRunning(false);
            clearInterval(intervalRef.current);
            return prev;
          }
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, steps, speed]);

  // Clean graph canvas
  const clearGraph = () => {
    resetSimulation();
    setNodes([]);
    setEdges([]);
  };

  // Reset simulation highlights to default unvisited state
  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setSteps([]);
    setShortestPath([]);
    setTotalDistance(0);
    setStats(null);
    setNodeStates({});
    setEdgeStates({});
    clearInterval(intervalRef.current);
  };

  // Run pathfinder visual simulation
  const runSimulation = async () => {
    if (!source || !destination) {
      alert('Please select both a source and a destination node.');
      return;
    }
    if (source === destination) {
      alert('Source and Destination nodes must be different.');
      return;
    }

    resetSimulation();

    // Format nodes & edges for Express backend Graph Engine
    const formattedNodes = nodes.map(n => ({
      id: n.id,
      name: n.data.label,
      position: n.position
    }));

    const formattedEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.data?.weight || 1
    }));

    try {
      const res = await axios.post(`${API_BASE}/algorithm/run`, {
        nodes: formattedNodes,
        edges: formattedEdges,
        source,
        destination,
        algorithm
      });

      const { steps, shortestPath, totalDistance, stats: runStats } = res.data;

      if (!steps || steps.length === 0) {
        alert('No path could be found between source and destination.');
        return;
      }

      setSteps(steps);
      setShortestPath(shortestPath);
      setTotalDistance(totalDistance);
      setStats({
        ...runStats,
        distance: totalDistance,
        algoComplexity: getComplexityInfo(algorithm)
      });

      // Start playback
      setCurrentStepIndex(0);
      setIsRunning(true);
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to execute Pathfinding Engine API');
    }
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resumeSimulation = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const stepForward = () => {
    if (steps.length === 0) return;
    setIsRunning(false);
    setIsPaused(true);
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  };

  const stepBackward = () => {
    if (steps.length === 0) return;
    setIsRunning(false);
    setIsPaused(true);
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  };

  // Compare all algorithms
  const compareAlgorithms = async () => {
    if (!source || !destination) {
      alert('Select source & destination to compare.');
      return;
    }
    if (source === destination) {
      alert('Source & Destination must be different.');
      return;
    }

    const formattedNodes = nodes.map(n => ({
      id: n.id,
      name: n.data.label,
      position: n.position
    }));

    const formattedEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.data?.weight || 1
    }));

    try {
      const res = await axios.post(`${API_BASE}/algorithm/compare`, {
        nodes: formattedNodes,
        edges: formattedEdges,
        source,
        destination
      });
      setComparisonData(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to compare algorithms.');
    }
  };

  // Generate random visual nodes & connect them automatically (Bonus Feature)
  const generateRandomGraph = () => {
    resetSimulation();
    const NUM_NODES = 10;
    const canvasWidth = 600;
    const canvasHeight = 400;
    const padding = 60;

    const newNodes = [];
    const cityNames = [
      'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai',
      'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
    ];

    for (let i = 0; i < NUM_NODES; i++) {
      newNodes.push({
        id: String(i + 1),
        type: 'city',
        data: { label: cityNames[i] || `Node ${i + 1}` },
        position: {
          x: padding + Math.random() * (canvasWidth - padding * 2),
          y: padding + Math.random() * (canvasHeight - padding * 2)
        }
      });
    }

    // Connect nodes dynamically (generating around 16 - 20 edges)
    const newEdges = [];
    let edgeCount = 0;

    // Helper to check if edge already exists
    const edgeExists = (u, v) => {
      return newEdges.some(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
    };

    // Ensure connectivity by forming a simple spanning path first
    for (let i = 0; i < NUM_NODES - 1; i++) {
      const sourceId = newNodes[i].id;
      const targetId = newNodes[i + 1].id;
      const weight = Math.floor(50 + Math.random() * 250);
      newEdges.push({
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        data: { weight },
        label: String(weight)
      });
      edgeCount++;
    }

    // Add extra random edges for density (target 18 total edges)
    while (edgeCount < 18) {
      const uIdx = Math.floor(Math.random() * NUM_NODES);
      const vIdx = Math.floor(Math.random() * NUM_NODES);
      if (uIdx !== vIdx) {
        const u = newNodes[uIdx].id;
        const v = newNodes[vIdx].id;
        if (!edgeExists(u, v)) {
          const weight = Math.floor(50 + Math.random() * 250);
          newEdges.push({
            id: `e-${u}-${v}`,
            source: u,
            target: v,
            data: { weight },
            label: String(weight)
          });
          edgeCount++;
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setGraphType('normal');
  };

  // Preloaded layouts (Phase 8 presets)
  const loadPresetGraph = (type) => {
    resetSimulation();
    setGraphType(type);

    if (type === 'campus') {
      const campusNodes = [
        { id: 'c1', type: 'city', data: { label: 'Main Gate' }, position: { x: 300, y: 480 } },
        { id: 'c2', type: 'city', data: { label: 'Library' }, position: { x: 150, y: 350 } },
        { id: 'c3', type: 'city', data: { label: 'Academic Block' }, position: { x: 450, y: 350 } },
        { id: 'c4', type: 'city', data: { label: 'Hostel A' }, position: { x: 100, y: 150 } },
        { id: 'c5', type: 'city', data: { label: 'Hostel B' }, position: { x: 500, y: 150 } },
        { id: 'c6', type: 'city', data: { label: 'Cafeteria' }, position: { x: 300, y: 250 } },
        { id: 'c7', type: 'city', data: { label: 'Sports Complex' }, position: { x: 300, y: 50 } }
      ];

      const campusEdges = [
        { id: 'ec1-2', source: 'c1', target: 'c2', data: { weight: 120 }, label: '120' },
        { id: 'ec1-3', source: 'c1', target: 'c3', data: { weight: 140 }, label: '140' },
        { id: 'ec2-6', source: 'c2', target: 'c6', data: { weight: 80 }, label: '80' },
        { id: 'ec3-6', source: 'c3', target: 'c6', data: { weight: 90 }, label: '90' },
        { id: 'ec2-4', source: 'c2', target: 'c4', data: { weight: 150 }, label: '150' },
        { id: 'ec3-5', source: 'c3', target: 'c5', data: { weight: 160 }, label: '160' },
        { id: 'ec4-7', source: 'c4', target: 'c7', data: { weight: 110 }, label: '110' },
        { id: 'ec5-7', source: 'c5', target: 'c7', data: { weight: 100 }, label: '100' },
        { id: 'ec6-7', source: 'c6', target: 'c7', data: { weight: 130 }, label: '130' }
      ];

      setNodes(campusNodes);
      setEdges(campusEdges);
    } else if (type === 'metro') {
      const metroNodes = [
        { id: 'm1', type: 'city', data: { label: 'Central Depot' }, position: { x: 300, y: 250 } },
        { id: 'm2', type: 'city', data: { label: 'Blue Line North' }, position: { x: 300, y: 80 } },
        { id: 'm3', type: 'city', data: { label: 'Blue Line South' }, position: { x: 300, y: 420 } },
        { id: 'm4', type: 'city', data: { label: 'Red Line West' }, position: { x: 80, y: 250 } },
        { id: 'm5', type: 'city', data: { label: 'Red Line East' }, position: { x: 520, y: 250 } },
        { id: 'm6', type: 'city', data: { label: 'Airport Express' }, position: { x: 120, y: 100 } },
        { id: 'm7', type: 'city', data: { label: 'IT Corridor' }, position: { x: 480, y: 400 } }
      ];

      const metroEdges = [
        { id: 'em1-2', source: 'm1', target: 'm2', data: { weight: 12 }, label: '12' },
        { id: 'em1-3', source: 'm1', target: 'm3', data: { weight: 15 }, label: '15' },
        { id: 'em1-4', source: 'm1', target: 'm4', data: { weight: 18 }, label: '18' },
        { id: 'em1-5', source: 'm1', target: 'm5', data: { weight: 14 }, label: '14' },
        { id: 'em2-6', source: 'm2', target: 'm6', data: { weight: 9 }, label: '9' },
        { id: 'em4-6', source: 'm4', target: 'm6', data: { weight: 11 }, label: '11' },
        { id: 'em3-7', source: 'm3', target: 'm7', data: { weight: 8 }, label: '8' },
        { id: 'em5-7', source: 'm5', target: 'm7', data: { weight: 10 }, label: '10' }
      ];

      setNodes(metroNodes);
      setEdges(metroEdges);
    }
  };

  // Export JSON graph locally
  const exportGraphToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ nodes, edges, graphType }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `graph-${graphType}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON graph locally
  const importGraphFromJSON = (e) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.nodes && parsed.edges) {
          resetSimulation();
          const nodesWithCityType = parsed.nodes.map(n => ({
            ...n,
            type: 'city'
          }));
          setNodes(nodesWithCityType);
          setEdges(parsed.edges);
          setGraphType(parsed.graphType || 'normal');
          alert('Graph imported successfully!');
        } else {
          alert('Invalid graph file format. Missing nodes or edges.');
        }
      } catch (err) {
        alert('Failed to parse graph file.');
      }
    };
  };

  // Sync Graph layouts to MongoDB/mock DB APIs
  const saveGraphToDB = async (graphName) => {
    if (!graphName || graphName.trim() === '') {
      alert('Graph name cannot be empty');
      return;
    }
    const formattedNodes = nodes.map(n => ({
      id: n.id,
      name: n.data.label,
      position: n.position
    }));
    const formattedEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.data?.weight || 1
    }));

    try {
      await axios.post(`${API_BASE}/graphs`, {
        name: graphName,
        type: graphType,
        nodes: formattedNodes,
        edges: formattedEdges
      });
      alert('Graph saved successfully!');
      fetchSavedGraphs();
    } catch (err) {
      console.error(err);
      alert('Could not save graph to database');
    }
  };

  const loadGraphFromDB = async (dbGraph) => {
    resetSimulation();
    try {
      const mappedNodes = dbGraph.nodes.map(n => ({
        id: n.id,
        type: 'city',
        data: { label: n.name },
        position: n.position
      }));
      const mappedEdges = dbGraph.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        data: { weight: e.weight },
        label: String(e.weight)
      }));

      setNodes(mappedNodes);
      setEdges(mappedEdges);
      setGraphType(dbGraph.type || 'normal');
    } catch (err) {
      console.error(err);
      alert('Error loading selected graph.');
    }
  };

  const deleteGraphFromDB = async (graphId) => {
    try {
      await axios.delete(`${API_BASE}/graphs/${graphId}`);
      fetchSavedGraphs();
    } catch (err) {
      console.error(err);
      alert('Could not delete graph');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <GraphContext.Provider value={{
      nodes, setNodes,
      edges, setEdges,
      algorithm, setAlgorithm,
      source, setSource,
      destination, setDestination,
      theme, toggleTheme,
      graphType, setGraphType,
      savedGraphs, fetchSavedGraphs,

      // Simulation Playback State
      steps,
      currentStepIndex,
      shortestPath,
      totalDistance,
      isRunning,
      isPaused,
      speed, setSpeed,
      stats,

      // Actions
      clearGraph,
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

      // Highlighting States
      nodeStates,
      edgeStates,

      // Comparison results
      comparisonData,
      setComparisonData
    }}>
      {children}
    </GraphContext.Provider>
  );
};

// Help Helper to output complexity analysis
function getComplexityInfo(algo) {
  switch (algo.toLowerCase()) {
    case 'bfs':
      return {
        time: 'O(V + E)',
        space: 'O(V)',
        desc: 'Explores neighbors level-by-level. Guaranteed unweighted shortest path.'
      };
    case 'dfs':
      return {
        time: 'O(V + E)',
        space: 'O(V)',
        desc: 'Explores deeply down paths before backtracking. Not optimal for paths.'
      };
    case 'dijkstra':
      return {
        time: 'O((V + E) log V)',
        space: 'O(V)',
        desc: 'Uses Min-Heap Priority Queue. Guarantees optimal path on weighted graphs.'
      };
    case 'astar':
    case 'a*':
      return {
        time: 'O((V + E) log V)',
        space: 'O(V)',
        desc: 'Incorporate heuristic h(n) estimation. Drastically cuts explored nodes.'
      };
    default:
      return { time: '', space: '', desc: '' };
  }
}
