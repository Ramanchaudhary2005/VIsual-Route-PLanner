# 🗺️ Visual Route Planner Sandbox

An interactive visual dashboard and sandbox to build, simulate, and benchmark graph pathfinding algorithms live. It supports custom node arrangements, adjustable road connection weights, and real-time visualization of search steps.

---

## 🚀 Key Features

* **Interactive Graph Canvas**: 
  * Double-click on any empty space to add new nodes.
  * Drag-connect node handles to form links.
  * Double-click nodes or click on edge weight badges to rename or change weights dynamically.
  * Built using straight-line paths for maximum clarity.
* **Sidebar Graph Editor**:
  * Form-based entry to quickly add nodes or connect/update path weights from dropdown selections.
* **Animated Search Playback**:
  * Fully control playback speed and step through the exploration path step-by-step.
  * Animated exploring edges (orange dashes) and shortest path flows (rose-pink dashes).
* **Live Exploration Diagnostics**:
  * Shows total path distance, execution time (in ms), complexity summaries, and the **exact chronological order** in which the pathfinder explored each node.
* **Live Side-by-Side Benchmark**:
  * Compare execution speeds, node explored ratios, path optimality, and route details of **Dijkstra**, **A\***, **BFS**, and **DFS** simultaneously.
* **Database & JSON Synchronization**:
  * Save layouts directly to a database, reload saved layouts, or export/import local JSON graphs.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, `@xyflow/react` (React Flow), Tailwind CSS v4, Lucide Icons.
* **Backend**: Node.js, Express, MongoDB (Mongoose) with a transparent local JSON file fallback (`mock_db.json`) if MongoDB is unavailable.

---

## 📦 Installation & Setup

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Backend Server Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Start the backend in development (watch) mode:
```bash
npm run dev
```
The backend server runs at `http://localhost:5000`.

### 2. Frontend Sandbox Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Core Project Architecture

* **Backend**:
  * `server.js` - Server entry point and middleware configuration.
  * `algorithms/pathfinders.js` - Pathfinding implementations (Dijkstra, A*, BFS, DFS) with exploration step logs.
  * `routes/algorithmRoutes.js` - API routing for simulation runs and side-by-side benchmarking.
  * `services/db.js` - Database engine with a local JSON file database manager.
* **Frontend**:
  * `src/context/GraphContext.jsx` - Global state engine, theme manager, and simulation timers.
  * `src/components/GraphCanvas.jsx` - Interactive React Flow canvas containing custom nodes and weighted edges.
  * `src/components/Sidebar.jsx` - Panel for algorithms, graph editing forms, playback controllers, presets, and sync utilities.
  * `src/components/StatsPanel.jsx` - Execution telemetry showing exploration order, complexities, and distances.
