require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const CompilationHistory = require('../models/CompilationHistory');

async function clean() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeopt';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB. Purging demo and test data...');

  await User.deleteMany({});
  await Project.deleteMany({});
  await CompilationHistory.deleteMany({});

  console.log('Database successfully reset. Zero demo accounts or dummy records remain.');
  await mongoose.disconnect();
}

clean().catch(console.error);
