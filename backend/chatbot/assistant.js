const Expense = require('../models/Expense');
const Income = require('../models/Income');
const User = require('../models/User');
const { startOfWeek, endOfWeek } = require('../lib/dates');
const { GoogleGenAI } = require('@google/genai');

// Lazy-initialized Google GenAI client. This file supports two auth modes:
// 1) API key via GEMINI_API_KEY (recommended for simple setups)
// 2) Application Default Credentials (ADC) via GOOGLE_APPLICATION_CREDENTIALS
// If neither is present we throw a clear error with instructions.
let genaiClient = null;

function getGenAIClient() {
  if (genaiClient) return genaiClient;

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (apiKey) {
    genaiClient = new GoogleGenAI({ apiKey, authType: 'API_KEY' });
    console.log('GenAI client initialized using API key.');
    return genaiClient;
  }

  // If an API key wasn't provided, check for ADC environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Leave auth to the library (ADC). This may still fail at runtime if ADC is misconfigured.
    genaiClient = new GoogleGenAI();
    console.log(
      'GenAI client initialized using Application Default Credentials (ADC).'
    );
    return genaiClient;
  }

  // Helpful error to guide the developer to set credentials instead of letting the library
  // fail deep inside google-auth-library with a generic stack trace.
  const examples = [];
  examples.push(
    'PowerShell (set API key): $env:GEMINI_API_KEY = "YOUR_API_KEY"'
  );
  examples.push(
    'PowerShell (use ADC file): $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\\\path\\\\to\\\\service-account.json"'
  );

  const msg = [
    'Missing Google GenAI credentials. Provide either:',
    '- An API key in environment variable GEMINI_API_KEY (or GENAI_API_KEY / GOOGLE_API_KEY), or',
    '- Application Default Credentials (set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file).',
    '',
    'Example (PowerShell):',
    ...examples,
    '',
    'See https://cloud.google.com/docs/authentication/getting-started for more information.',
  ].join('\n');

  const error = new Error(msg);
  // attach a flag to allow callers/tests to recognize this is a credential issue
  error.code = 'MISSING_GENAI_CREDENTIALS';
  throw error;
}

// 1️⃣ Calculate weekly summary
async function calculateWeeklySummary(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());

  const expenses = await Expense.find({
    userId,
    date: { $gte: start, $lte: end },
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyGoal = user.goal_expense ? user.goal_expense / 4 : 100; // default 100 if goal_expense not set

  const performance =
    totalExpense <= weeklyGoal
      ? '✅ You’re doing great! Keep it up!'
      : '⚠️ You’re over your goal pace. Try to reduce spending next week.';

  return { totalExpense, weeklyGoal, performance };
}

// 2️⃣ Generate Gemini AI advice
async function generateChatbotAdvice({
  totalExpense,
  weeklyGoal,
  performance,
}) {
  const prompt = `You are a friendly financial assistant chatbot. Here is the user's weekly summary:
- Total expense this week: $${totalExpense}
- Weekly goal: $${weeklyGoal}
- Performance summary: ${performance}
Write a helpful, motivating message (3–4 sentences):
1. Encourage the user based on their performance.
2. Suggest which categories they might reduce spending in (food, shopping, entertainment, etc.).
3. Give one actionable tip for the next week.
Keep it concise and natural.`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const response = await getGenAIClient().models.generateContent({
    model,
    contents: [
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  // 🔍 Log full response
  console.log('Full Gemini Response:', JSON.stringify(response, null, 2));

  const reply =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No response generated.';

  return reply.trim();
}

// ================================
// Get summary for chatbot
// period = 'week' | 'month'
// ================================
async function getSummaryForChatbot(userId, period = 'week') {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let start, end;
  const monthlyGoal = 400; // default monthly goal
  let goal;

  const now = new Date();

  if (period === 'week') {
    start = startOfWeek(now);
    end = endOfWeek(now);
    goal = monthlyGoal / 4; // weekly goal = 1/4 monthly goal
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    goal = monthlyGoal;
  } else {
    throw new Error('Invalid period. Use "week" or "month".');
  }

  console.log(`Calculating ${period} summary for ${start} → ${end}`);

  // Lấy tất cả expenses trong khoảng
  const expenses = await Expense.find({
    userId,
    date: { $gte: start, $lte: end },
  });

  // Tính tổng và theo category
  const categories = [
    'travel',
    'entertainment',
    'food & drink',
    'clothes',
    'appliances',
    'other',
  ];
  const categoryTotals = {};
  categories.forEach((c) => (categoryTotals[c] = 0));

  let totalExpense = 0;
  expenses.forEach((e) => {
    totalExpense += e.amount;
    const cat = e.category?.toLowerCase() || 'other';
    if (categoryTotals[cat] !== undefined) categoryTotals[cat] += e.amount;
    else categoryTotals.other += e.amount;
  });

  // So sánh với goal
  const difference = totalExpense - goal;
  const comparison =
    difference > 0
      ? `You spent over your ${period} goal by $${difference.toFixed(2)}`
      : `You saved $${Math.abs(difference).toFixed(
          2
        )} compared to your ${period} goal`;

  // Gọi Gemini AI
  const advicePrompt = `You are a friendly financial assistant chatbot. Here is the user's ${period} summary:
- Total expense: $${totalExpense}
- Expense each category: ${JSON.stringify(categoryTotals, null, 2)}
- ${period.charAt(0).toUpperCase() + period.slice(1)} goal: $${goal}
- Performance summary: ${comparison}

Write a helpful, motivating message (3–4 sentences):
1. Encourage the user based on their performance.
2. Suggest which categories they might reduce spending (food, shopping, entertainment, etc.).
3. Give one actionable tip for the next ${period}.
Keep it concise and natural.`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const response = await getGenAIClient().models.generateContent({
    model,
    contents: [{ type: 'text', text: advicePrompt }],
  });

  const advice =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No response generated.';

  return {
    totalExpense,
    categoryBreakdown: categoryTotals,
    goal,
    comparison,
    advice: advice.trim(),
  };
}
// ✅ Unified handler: can answer general chat or summaries
async function handleGeminiChatCommand(userId, command) {
  const lower = command.toLowerCase().trim();

  // --- 1️⃣ Detect summary commands ---
  if (lower.includes('summarize a week') || lower.includes('weekly summary')) {
    return await getSummaryForChatbot(userId, 'week');
  }

  if (
    lower.includes('summarize a month') ||
    lower.includes('monthly summary')
  ) {
    return await getSummaryForChatbot(userId, 'month');
  }

  // --- 2️⃣ Otherwise, act like a general Gemini chatbot ---
  const prompt = `
You are a friendly financial assistant chatbot that helps users track and plan expenses.
The user says: "${command}"
Respond conversationally, give helpful answers, and keep your tone supportive.
`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const response = await getGenAIClient().models.generateContent({
    model,
    contents: [{ type: 'text', text: prompt }],
  });

  const advice =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No response generated.';

  return { type: 'chat', text: advice.trim() };
}

// ✅ Export functions
module.exports = {
  calculateWeeklySummary,
  generateChatbotAdvice,
  getSummaryForChatbot,
  handleGeminiChatCommand, // ✅ new unified function
  __initGenAIClientForTest: () => {
    try {
      getGenAIClient();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message, code: e.code };
    }
  },
};
