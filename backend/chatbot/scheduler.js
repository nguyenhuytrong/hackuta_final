const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { generateChatbotAdvice } = require('./assistant');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB for monthly scheduler'))
  .catch((err) => console.error(err));

// Run on first day of each month at 9 AM
cron.schedule('0 8 1 * *', async () => {
  console.log('📅 Running monthly summary task...');

  const users = await User.find({});
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  for (const user of users) {
    const expenses = await Expense.find({
      userId: user._id,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    const incomes = await Income.find({
      userId: user._id,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const performance =
      totalExpense <= (user.goal_expense || 100)
        ? '✅ You met your monthly goal!'
        : '⚠️ You exceeded your monthly goal.';

    const summary = { totalExpense, totalIncome, performance };
    const advice = await generateChatbotAdvice({
      totalExpense,
      weeklyGoal: user.goal_expense || 100, // use monthly goal for simplicity
      performance,
    });

    console.log(`\nUser: ${user.email}`);
    console.log('Monthly Summary:', summary);
    console.log('🤖 Gemini Advice:', advice);
  }
});
