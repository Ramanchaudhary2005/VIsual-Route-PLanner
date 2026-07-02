import { buildAdjacencyList, runBFS, runDFS, runDijkstra, runAStar } from './algorithms/pathfinders.js';

// Setup sample nodes (with positions for Euclidean A* heuristic)
const nodes = [
  { id: 'A', position: { x: 0, y: 0 } },
  { id: 'B', position: { x: 300, y: 0 } },
  { id: 'C', position: { x: 0, y: 400 } },
  { id: 'D', position: { x: 300, y: 400 } }
];

// Setup sample edges (weighted)
// Path A-B-D: A -> B (5), B -> D (2) = Total 7
// Path A-C-D: A -> C (2), C -> D (1) = Total 3 (optimal weighted)
const edges = [
  { source: 'A', target: 'B', data: { weight: 5 } },
  { source: 'B', target: 'D', data: { weight: 2 } },
  { source: 'A', target: 'C', data: { weight: 2 } },
  { source: 'C', target: 'D', data: { weight: 1 } }
];

console.log('--- Pathfinding Logic Verification ---');
const adj = buildAdjacencyList(nodes, edges);

console.log('\nGenerated Adjacency List:');
console.log(JSON.stringify(adj, null, 2));

const nodesMap = { A: nodes[0], B: nodes[1], C: nodes[2], D: nodes[3] };

// Dijkstra (expects path A-C-D with distance 3)
const dijkstraRes = runDijkstra(adj, 'A', 'D', nodesMap);
console.log('\nDijkstra Results:');
console.log('  Path:', dijkstraRes.shortestPath.join(' -> '));
console.log('  Distance:', dijkstraRes.totalDistance);
console.log('  Steps Count:', dijkstraRes.steps.length);

// A* (expects path A-C-D with distance 3)
const astarRes = runAStar(adj, 'A', 'D', nodesMap);
console.log('\nA* Results:');
console.log('  Path:', astarRes.shortestPath.join(' -> '));
console.log('  Distance:', astarRes.totalDistance);
console.log('  Steps Count:', astarRes.steps.length);

// BFS (expects shortest path by edge count, A-B-D or A-C-D. Here both have 2 edges)
const bfsRes = runBFS(adj, 'A', 'D', nodesMap);
console.log('\nBFS Results:');
console.log('  Path:', bfsRes.shortestPath.join(' -> '));
console.log('  Distance (weighted):', bfsRes.totalDistance);

// DFS (expects deep traversal)
const dfsRes = runDFS(adj, 'A', 'D', nodesMap);
console.log('\nDFS Results:');
console.log('  Path:', dfsRes.shortestPath.join(' -> '));
console.log('  Distance (weighted):', dfsRes.totalDistance);
