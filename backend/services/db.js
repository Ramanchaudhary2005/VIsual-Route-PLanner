import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Graph } from '../models/graphModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOCK_FILE = path.join(__dirname, '..', 'data', 'mock_db.json');

// Helper to check and create data directory + local JSON file
const ensureDataFolder = () => {
  const dir = path.dirname(MOCK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MOCK_FILE)) {
    fs.writeFileSync(MOCK_FILE, JSON.stringify([], null, 2));
  }
};

let useMock = false;

/**
 * Initializes DB connection or sets up JSON fallback.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visual_route_planner';

  if (process.env.MOCK_DB === 'true') {
    console.log('⚠️ MOCK_DB environment variable is set to true. Using local JSON database.');
    useMock = true;
    ensureDataFolder();
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    // Connect with a 3-second timeout so it falls back quickly if Mongo isn't running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.log('⚠️ Failed to connect to MongoDB:', error.message);
    console.log('🔄 Transparently falling back to local JSON database (mock_db.json).');
    useMock = true;
    ensureDataFolder();
  }
}

/**
 * Gets all saved graphs.
 */
export async function getGraphs() {
  if (useMock) {
    ensureDataFolder();
    const data = fs.readFileSync(MOCK_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return await Graph.find({}).sort({ updatedAt: -1 });
}

/**
 * Gets a specific graph by its unique name.
 */
export async function getGraphByName(name) {
  if (useMock) {
    ensureDataFolder();
    const data = JSON.parse(fs.readFileSync(MOCK_FILE, 'utf-8'));
    return data.find(g => g.name === name) || null;
  }
  return await Graph.findOne({ name });
}

/**
 * Saves or updates a graph.
 */
export async function saveGraph(graphData) {
  if (!graphData.name) {
    throw new Error('Graph name is required to save');
  }

  if (useMock) {
    ensureDataFolder();
    const data = JSON.parse(fs.readFileSync(MOCK_FILE, 'utf-8'));
    const index = data.findIndex(g => g.name === graphData.name);

    const formattedGraph = {
      _id: index >= 0 ? data[index]._id : new Date().getTime().toString(),
      name: graphData.name,
      type: graphData.type || 'normal',
      nodes: graphData.nodes || [],
      edges: graphData.edges || [],
      createdAt: index >= 0 ? data[index].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      data[index] = formattedGraph;
    } else {
      data.push(formattedGraph);
    }

    fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
    return formattedGraph;
  }

  // MongoDB mode
  const existing = await Graph.findOne({ name: graphData.name });
  if (existing) {
    existing.nodes = graphData.nodes;
    existing.edges = graphData.edges;
    existing.type = graphData.type || 'normal';
    return await existing.save();
  } else {
    const newGraph = new Graph(graphData);
    return await newGraph.save();
  }
}

/**
 * Deletes a graph by ID or name.
 */
export async function deleteGraph(idOrName) {
  if (useMock) {
    ensureDataFolder();
    let data = JSON.parse(fs.readFileSync(MOCK_FILE, 'utf-8'));
    data = data.filter(g => g._id !== idOrName && g.name !== idOrName);
    fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
    return { success: true };
  }

  // MongoDB mode
  try {
    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      await Graph.findByIdAndDelete(idOrName);
    } else {
      await Graph.findOneAndDelete({ name: idOrName });
    }
    return { success: true };
  } catch (error) {
    await Graph.findOneAndDelete({ name: idOrName });
    return { success: true };
  }
}
