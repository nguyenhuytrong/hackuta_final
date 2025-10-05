const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getSummaryForChatbot } = require('../chatbot/assistant');

const router = express.Router();

// POST /api/v1/gemini
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { command } = req.body;

    console.log(`[Gemini] User ${userId} command: ${command}`);

    if (!command)
      return res.status(400).json({ message: 'Please provide a command.' });

    let period;

    if (command.toLowerCase().includes('week')) period = 'week';
    else if (command.toLowerCase().includes('month')) period = 'month';
    else
      return res.status(400).json({
        message:
          'Invalid command. Use "summarize a week" or "summarize a month".',
      });

    // ✅ Call helper
    const summary = await getSummaryForChatbot(userId, period);

    // Return JSON to frontend
    return res.status(200).json({ response: summary });
  } catch (err) {
    console.error('Error in /gemini route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
