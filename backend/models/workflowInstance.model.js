import mongoose from "mongoose";

const historyEntrySchema = new mongoose.Schema({
  stepOrder: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['approve', 'reject', 'request_changes']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const workflowInstanceSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Contract', 'Expense']
  },
  currentStep: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
    default: 'PENDING'
  },
  history: [historyEntrySchema]
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
workflowInstanceSchema.index({ entityId: 1, entityType: 1 });
workflowInstanceSchema.index({ status: 1, currentStep: 1 });

const WorkflowInstance = mongoose.model("WorkflowInstance", workflowInstanceSchema);

export default WorkflowInstance; 