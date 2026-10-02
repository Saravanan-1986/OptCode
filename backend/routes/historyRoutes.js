const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const historyController = require('../controllers/historyController');

router.use(auth);

router.get('/', historyController.getHistory);
router.get('/:id', historyController.getHistoryById);
router.delete('/:id', historyController.deleteHistory);
router.delete('/', historyController.clearHistory);

module.exports = router;
