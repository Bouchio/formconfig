import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['approve', 'reject', 'request_changes']
  },
  nextStep: {
    type: mongoose.Schema.Types.Mixed, // Peut être un Number ou "end"
    required: true
  },
  stateChanges: [{
    field: {
      type: String,
      required: true
    },
    value: mongoose.Schema.Types.Mixed
  }],
  allowMessage: {
    type: Boolean,
    default: true
  }
});

const stepSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    min: 1
  },
  allowedRoles: [{
    type: String,
    required: true,
    enum: ['Admin', 'RH', 'Directeur', 'Utilisateur']
  }],
  actions: [actionSchema]
});

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  trigger: {
    type: String,
    required: true,
    enum: ['USER_CREATED', 'USER_UPDATED', 'CONTRACT_SUBMITTED']
  },
  steps: [stepSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validation pour s'assurer que les étapes sont dans l'ordre
workflowSchema.pre('save', function(next) {
  const stepOrders = this.steps.map(step => step.order).sort((a, b) => a - b);
  const expectedOrders = Array.from({length: this.steps.length}, (_, i) => i + 1);
  
  if (JSON.stringify(stepOrders) !== JSON.stringify(expectedOrders)) {
    return next(new Error('Les étapes doivent être numérotées consécutivement à partir de 1'));
  }
  
  next();
});

const Workflow = mongoose.model("Workflow", workflowSchema);

export default Workflow; 