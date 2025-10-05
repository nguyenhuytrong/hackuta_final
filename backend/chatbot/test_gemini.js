// chatbot/test_gemini.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const {
  calculateWeeklySummary,
  generateChatbotAdvice,
} = require('./assistant');

async function runGeminiTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // find a test user by email (created by your test_db.js)
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.error(
        '❌ Test user not found. Run test_db.js or change the email here.'
      );
      return;
    }

    // use the actual ObjectId from the found user
    const userId = user._id;
    console.log('Using user:', user.email, 'id:', userId.toString());

    const summary = await calculateWeeklySummary(userId);
    console.log('\n📊 Weekly Summary:', summary);

    if (!process.env.GEMINI_API_KEY) {
      console.error('\n❌ GEMINI_API_KEY not set in .env — set it and retry.');
      return;
    }

    const advice = await generateChatbotAdvice(summary);
    console.log('\n🤖 Gemini Chatbot Advice:\n', advice);
  } catch (err) {
    console.error('\n❌ Error running Gemini test:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
}

runGeminiTest();
