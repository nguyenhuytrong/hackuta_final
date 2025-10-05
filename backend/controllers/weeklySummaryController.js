const Expense = require('../models/Expense.js');
const Goal = require('../models/set_goal.js'); // assuming you store monthly goal here
const User = require('../models/User');
const dayjs = require('dayjs');

// utility to check Monday→Sunday validity
function isValidWeekRange(startDate, endDate) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const isMonday = start.day() === 1; // Monday = 1 in dayjs
  const isSunday = end.day() === 0; // Sunday = 0
  const diff = end.diff(start, 'day') === 6;
  const isPast = end.isBefore(dayjs(), 'day');

  return isMonday && isSunday && diff && isPast;
}

exports.getWeeklySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userId = req.user._id;

    // ✅ Validate input
    if (!startDate || !endDate)
      return res
        .status(400)
        .json({ message: 'Please provide startDate and endDate.' });

    if (!isValidWeekRange(startDate, endDate))
      return res.status(400).json({
        message: 'Invalid date range. Must be a past week (Mon–Sun).',
      });

    // ✅ Fetch all expenses for that week
    const expenses = await Expense.find({
      userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    if (!expenses.length)
      return res
        .status(404)
        .json({ message: 'No expenses found for that week.' });

    // ✅ Calculate total and per-category
    const categories = [
      'travel',
      'entertainment',
      'food & drink',
      'clothes',
      'appliances',
      'other',
    ];
    const categoryTotals = {};

    for (const cat of categories) categoryTotals[cat] = 0;

    let total = 0;
    expenses.forEach((exp) => {
      total += exp.amount;
      const cat = exp.category?.toLowerCase() || 'other';
      if (categoryTotals[cat] !== undefined) categoryTotals[cat] += exp.amount;
      else categoryTotals.other += exp.amount;
    });

    // ✅ Compare with average goal expense
    const month = dayjs(startDate).month() + 1;
    const year = dayjs(startDate).year();
    const goal = await Goal.findOne({ userId, month, year });
    const averageGoalExpense = goal ? goal.amount / 4 : 0;

    const difference = total - averageGoalExpense;
    const comparison =
      difference > 0
        ? `You spent over your weekly goal by $${difference.toFixed(2)}`
        : `You saved $${Math.abs(difference).toFixed(
            2
          )} compared to your weekly goal`;

    // ✅ Build summary
    const summary = {
      totalExpense: total,
      categoryBreakdown: categoryTotals,
      averageGoalExpense,
      comparison,
    };

    // ✅ Later: send this summary to Gemini for advice
    return res.status(200).json(summary);
  } catch (error) {
    console.error('❌ Error in getWeeklySummary:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
