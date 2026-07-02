import { PriorityQueue } from './priorityQueue.js';

/**
 * BFS Pathfinding (ignores edge weights - unweighted shortest path)
 */
export function runBFS(adjacencyList, sourceId, targetId, nodesMap) {
  const startTime = process.hrtime.bigint();
  const queue = [sourceId];
  const visited = new Set([sourceId]);
  const parent = {};
  const steps = [];
  const distances = { [sourceId]: 0 };
  let edgesTraversed = 0;

  // Add initial step
  steps.push({
    current: sourceId,
    visited: Array.from(visited),
    frontier: [...queue],
    distances: { ...distances }
  });

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      edgesTraversed++;
      if (!visited.has(neighbor.nodeId)) {
        visited.add(neighbor.nodeId);
        parent[neighbor.nodeId] = current;
        distances[neighbor.nodeId] = distances[current] + 1; // unweighted step count
        queue.push(neighbor.nodeId);

        steps.push({
          current: neighbor.nodeId,
          visited: Array.from(visited),
          frontier: [...queue],
          distances: { ...distances }
        });
      }
    }
  }

  const path = [];
  if (found || visited.has(targetId)) {
    let curr = targetId;
    while (curr !== undefined) {
      path.unshift(curr);
      curr = parent[curr];
    }
  }

  // Calculate actual weighted distance along BFS path
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const neighbors = adjacencyList[u] || [];
    const edge = neighbors.find(n => n.nodeId === v);
    totalDistance += edge ? edge.weight : 0;
  }

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1e6;

  return {
    shortestPath: path,
    totalDistance: path.length > 0 ? totalDistance : Infinity,
    steps,
    stats: {
      executionTimeMs,
      nodesVisited: visited.size,
      edgesTraversed,
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)"
    }
  };
}

/**
 * DFS Pathfinding (traversal search - ignores edge weights)
 */
export function runDFS(adjacencyList, sourceId, targetId, nodesMap) {
  const startTime = process.hrtime.bigint();
  const stack = [sourceId];
  const visited = new Set();
  const parent = {};
  const steps = [];
  const distances = { [sourceId]: 0 };
  let edgesTraversed = 0;
  let found = false;

  while (stack.length > 0) {
    const current = stack.pop();

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push({
      current: current,
      visited: Array.from(visited),
      frontier: [...stack],
      distances: { ...distances }
    });

    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = adjacencyList[current] || [];
    // Iterate in reverse to maintain node exploration order consistent with typical code
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      edgesTraversed++;
      if (!visited.has(neighbor.nodeId)) {
        parent[neighbor.nodeId] = current;
        distances[neighbor.nodeId] = distances[current] + 1;
        stack.push(neighbor.nodeId);
      }
    }
  }

  const path = [];
  if (found) {
    let curr = targetId;
    while (curr !== undefined) {
      path.unshift(curr);
      curr = parent[curr];
    }
  }

  // Calculate actual weighted distance along DFS path
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const neighbors = adjacencyList[u] || [];
    const edge = neighbors.find(n => n.nodeId === v);
    totalDistance += edge ? edge.weight : 0;
  }

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1e6;

  return {
    shortestPath: path,
    totalDistance: path.length > 0 ? totalDistance : Infinity,
    steps,
    stats: {
      executionTimeMs,
      nodesVisited: visited.size,
      edgesTraversed,
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)"
    }
  };
}

/**
 * Dijkstra Shortest Path Algorithm (uses Priority Queue Min-Heap)
 */
export function runDijkstra(adjacencyList, sourceId, targetId, nodesMap) {
  const startTime = process.hrtime.bigint();
  const pq = new PriorityQueue();
  const distances = {};
  const parent = {};
  const visited = new Set();
  const steps = [];
  let edgesTraversed = 0;

  // Initialize distances
  Object.keys(adjacencyList).forEach(nodeId => {
    distances[nodeId] = Infinity;
  });
  distances[sourceId] = 0;

  pq.enqueue(sourceId, 0);

  while (!pq.isEmpty()) {
    const minNode = pq.dequeue();
    const current = minNode.val;

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push({
      current: current,
      visited: Array.from(visited),
      frontier: pq.values.map(v => v.val),
      distances: { ...distances }
    });

    if (current === targetId) {
      break;
    }

    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      edgesTraversed++;
      if (!visited.has(neighbor.nodeId)) {
        const alt = distances[current] + neighbor.weight;
        if (alt < distances[neighbor.nodeId]) {
          distances[neighbor.nodeId] = alt;
          parent[neighbor.nodeId] = current;
          pq.enqueue(neighbor.nodeId, alt);
        }
      }
    }
  }

  const path = [];
  if (distances[targetId] !== undefined && distances[targetId] !== Infinity) {
    let curr = targetId;
    while (curr !== undefined) {
      path.unshift(curr);
      curr = parent[curr];
    }
  }

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1e6;

  return {
    shortestPath: path,
    totalDistance: distances[targetId] === Infinity ? Infinity : distances[targetId],
    steps,
    stats: {
      executionTimeMs,
      nodesVisited: visited.size,
      edgesTraversed,
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V)"
    }
  };
}

/**
 * A* Pathfinding (uses Priority Queue & Euclidean Distance heuristic)
 */
export function runAStar(adjacencyList, sourceId, targetId, nodesMap) {
  const startTime = process.hrtime.bigint();
  const pq = new PriorityQueue();
  const gScore = {};
  const fScore = {};
  const parent = {};
  const visited = new Set();
  const steps = [];
  let edgesTraversed = 0;

  // Find target node coordinates for Euclidean heuristic
  const targetNode = nodesMap[targetId];
  const targetX = targetNode?.position?.x || 0;
  const targetY = targetNode?.position?.y || 0;

  const heuristic = (nodeId) => {
    const node = nodesMap[nodeId];
    if (!node || !node.position) return 0;
    const dx = node.position.x - targetX;
    const dy = node.position.y - targetY;
    // Standard Euclidean distance
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Initialize scores
  Object.keys(adjacencyList).forEach(nodeId => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  });

  gScore[sourceId] = 0;
  fScore[sourceId] = heuristic(sourceId);

  pq.enqueue(sourceId, fScore[sourceId]);

  while (!pq.isEmpty()) {
    const minNode = pq.dequeue();
    const current = minNode.val;

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push({
      current: current,
      visited: Array.from(visited),
      frontier: pq.values.map(v => v.val),
      distances: { ...gScore }
    });

    if (current === targetId) {
      break;
    }

    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      edgesTraversed++;
      if (!visited.has(neighbor.nodeId)) {
        const tentativeG = gScore[current] + neighbor.weight;
        if (tentativeG < gScore[neighbor.nodeId]) {
          gScore[neighbor.nodeId] = tentativeG;
          fScore[neighbor.nodeId] = tentativeG + heuristic(neighbor.nodeId);
          parent[neighbor.nodeId] = current;
          pq.enqueue(neighbor.nodeId, fScore[neighbor.nodeId]);
        }
      }
    }
  }

  const path = [];
  if (gScore[targetId] !== undefined && gScore[targetId] !== Infinity) {
    let curr = targetId;
    while (curr !== undefined) {
      path.unshift(curr);
      curr = parent[curr];
    }
  }

  const endTime = process.hrtime.bigint();
  const executionTimeMs = Number(endTime - startTime) / 1e6;

  return {
    shortestPath: path,
    totalDistance: gScore[targetId] === Infinity ? Infinity : gScore[targetId],
    steps,
    stats: {
      executionTimeMs,
      nodesVisited: visited.size,
      edgesTraversed,
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V)"
    }
  };
}

/**
 * Builds an adjacency list from nodes and edges.
 * Handles both bidirectional (default) and directed edge structures.
 */
export function buildAdjacencyList(nodes, edges) {
  const list = {};

  // Initialize keys for all nodes
  nodes.forEach(node => {
    list[node.id] = [];
  });

  // Populate edges
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    // weights default to 1 if not defined or 0
    const weight = Number(edge.weight !== undefined ? edge.weight : edge.data?.weight) || 1;

    // Verify nodes exist in our list
    if (list[source] && list[target]) {
      list[source].push({ nodeId: target, weight });
      // Undirected graph (roads go both ways)
      list[target].push({ nodeId: source, weight });
    }
  });

  return list;
}
