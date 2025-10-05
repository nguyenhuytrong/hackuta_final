const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { handleGeminiChatCommand } = require('../chatbot/assistant'); // ✅ new import

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { command } = req.body;

    console.log(`[Gemini] User ${userId} command: ${command}`);

    if (!command)
      return res.status(400).json({ message: 'Please provide a command.' });

    const result = await handleGeminiChatCommand(userId, command);
    res.status(200).json({ response: result });
  } catch (err) {
    console.error('Error in /gemini route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
