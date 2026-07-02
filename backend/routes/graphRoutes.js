import express from 'express';
import { getGraphs, saveGraph, deleteGraph } from '../services/db.js';

const router = express.Router();

// GET /api/graphs - Retrieve all saved graphs
router.get('/', async (req, res) => {
  try {
    const graphs = await getGraphs();
    res.json(graphs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/graphs - Save or update a graph layout
router.post('/', async (req, res) => {
  try {
    const { name, type, nodes, edges } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Graph name is required' });
    }
    const saved = await saveGraph({ name, type, nodes, edges });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/graphs/:idOrName - Delete a graph by id or name
router.delete('/:idOrName', async (req, res) => {
  try {
    const { idOrName } = req.params;
    await deleteGraph(idOrName);
    res.json({ success: true, message: 'Graph deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
