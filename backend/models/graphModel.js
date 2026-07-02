import mongoose from 'mongoose';

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  }
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  weight: { type: Number, required: true, default: 1 }
}, { _id: false });

const GraphSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true, default: 'normal', enum: ['normal', 'campus', 'metro'] },
  nodes: [NodeSchema],
  edges: [EdgeSchema]
}, { timestamps: true });

export const Graph = mongoose.model('Graph', GraphSchema);
