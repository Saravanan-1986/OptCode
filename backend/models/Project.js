const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    default: 'Untitled Optimization Project'
  },
  description: {
    type: String,
    default: 'C-Like Compiler Optimization Program'
  },
  sourceCode: {
    type: String,
    default: `int x = 10 * 20;\nint y = x + 0;\nint z = y * 1;\n\nint unused = 500;\n\nif (false) {\n    int a = 100;\n}\n\nprint(z);`
  },
  languageVersion: {
    type: String,
    default: 'C-Like v1.0'
  },
  latestCompilation: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
