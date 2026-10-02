const mongoose = require('mongoose');

const compilationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  projectName: {
    type: String,
    default: 'Optimization Run'
  },
  sourceCode: {
    type: String,
    required: true
  },
  tokensCount: {
    type: Number,
    default: 0
  },
  astNodeCount: {
    type: Number,
    default: 0
  },
  irBeforeCount: {
    type: Number,
    default: 0
  },
  irAfterCount: {
    type: Number,
    default: 0
  },
  instructionsRemoved: {
    type: Number,
    default: 0
  },
  reductionPercentage: {
    type: Number,
    default: 0
  },
  optimizationsCount: {
    type: Number,
    default: 0
  },
  fullResult: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompilationHistory', compilationHistorySchema);
