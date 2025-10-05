const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getWeeklySummary } = require('../controllers/weeklySummaryController');

const router = express.Router();

router.post('/', protect, getWeeklySummary);

module.exports = router;
