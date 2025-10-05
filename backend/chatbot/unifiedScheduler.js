// unifiedScheduler.js
const cron = require('node-cron');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Notification = require('../models/Notification');
const {
  calculateWeeklySummary,
  generateChatbotAdvice,
} = require('./assistant');

function startSchedulers() {
  /* Weekly Summary */
  cron.schedule('0 8 * * 1', async () => {
    console.log('📅 Running weekly summary task...');
    const users = await User.find({});
    for (const user of users) {
      const summary = await calculateWeeklySummary(user._id);
      const advice = await generateChatbotAdvice(summary);

      await Notification.create({
        userId: user._id,
        title: 'Weekly Expense Summary',
        message: `Total expense: $${summary.totalExpense}. Advice: ${advice}`,
        read: false,
      });
      console.log(`[Weekly] Notification created for ${user.email}`);
    }
  });

  /* Monthly Summary */
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

      const advice = await generateChatbotAdvice({
        totalExpense,
        weeklyGoal: user.goal_expense || 100,
        performance,
      });

      await Notification.create({
        userId: user._id,
        title: 'Monthly Expense Summary',
        message: `Total expense: $${totalExpense}, total income: $${totalIncome}. Advice: ${advice}`,
        read: false,
      });

      console.log(`[Monthly] Notification created for ${user.email}`);
    }
  });
}

module.exports = startSchedulers;
