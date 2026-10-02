const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const compilerController = require('../controllers/compilerController');

// All compiler operations now strictly require authentication
router.post('/compile', authMiddleware, compilerController.compile);

module.exports = router;
