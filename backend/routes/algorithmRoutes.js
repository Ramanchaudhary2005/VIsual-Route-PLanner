import express from 'express';
import {
  buildAdjacencyList,
  runBFS,
  runDFS,
  runDijkstra,
  runAStar
} from '../algorithms/pathfinders.js';

const router = express.Router();

// Helper helper to route and execute chosen pathfinder
function executeAlgorithm(algoName, adjList, source, destination, nodesMap) {
  switch (algoName.toLowerCase()) {
    case 'bfs':
      return runBFS(adjList, source, destination, nodesMap);
    case 'dfs':
      return runDFS(adjList, source, destination, nodesMap);
    case 'dijkstra':
      return runDijkstra(adjList, source, destination, nodesMap);
    case 'astar':
    case 'a*':
      return runAStar(adjList, source, destination, nodesMap);
    default:
      throw new Error(`Unsupported algorithm: ${algoName}`);
  }
}

// POST /api/algorithm/run - Runs a specific algorithm and returns details + visual steps
router.post('/run', (req, res) => {
  try {
    const { nodes, edges, source, destination, algorithm } = req.body;

    if (!nodes || !edges || !source || !destination || !algorithm) {
      return res.status(400).json({ error: 'Missing fields: nodes, edges, source, destination, algorithm' });
    }

    const nodesMap = {};
    nodes.forEach(n => {
      nodesMap[n.id] = n;
    });

    if (!nodesMap[source] || !nodesMap[destination]) {
      return res.status(400).json({ error: 'Source or Destination node does not exist in graph layout' });
    }

    const adjacencyList = buildAdjacencyList(nodes, edges);
    const result = executeAlgorithm(algorithm, adjacencyList, source, destination, nodesMap);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/algorithm/compare - Runs all algorithms to compare timing, path distance, and explored nodes
router.post('/compare', (req, res) => {
  try {
    const { nodes, edges, source, destination } = req.body;

    if (!nodes || !edges || !source || !destination) {
      return res.status(400).json({ error: 'Missing fields: nodes, edges, source, destination' });
    }

    const nodesMap = {};
    nodes.forEach(n => {
      nodesMap[n.id] = n;
    });

    if (!nodesMap[source] || !nodesMap[destination]) {
      return res.status(400).json({ error: 'Source or Destination node does not exist in graph layout' });
    }

    const adjacencyList = buildAdjacencyList(nodes, edges);

    const dResult = runDijkstra(adjacencyList, source, destination, nodesMap);
    const aResult = runAStar(adjacencyList, source, destination, nodesMap);
    const bResult = runBFS(adjacencyList, source, destination, nodesMap);
    const dfResult = runDFS(adjacencyList, source, destination, nodesMap);

    res.json({
      dijkstra: {
        time: dResult.stats.executionTimeMs,
        distance: dResult.totalDistance,
        explored: dResult.stats.nodesVisited,
        path: dResult.shortestPath
      },
      astar: {
        time: aResult.stats.executionTimeMs,
        distance: aResult.totalDistance,
        explored: aResult.stats.nodesVisited,
        path: aResult.shortestPath
      },
      bfs: {
        time: bResult.stats.executionTimeMs,
        distance: bResult.totalDistance,
        explored: bResult.stats.nodesVisited,
        path: bResult.shortestPath
      },
      dfs: {
        time: dfResult.stats.executionTimeMs,
        distance: dfResult.totalDistance,
        explored: dfResult.stats.nodesVisited,
        path: dfResult.shortestPath
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
