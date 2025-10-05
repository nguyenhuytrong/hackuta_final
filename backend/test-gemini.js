require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client Gemini
const genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 7 category cố định
const categories = ["Travel", "Entertainment", "Food & Drink", "Clothes", "Appliances", "Services", "Other"];

function ruleBased(expense) {
  const text = expense.toLowerCase();
  if (/cinema|movie|concert|show|theater/.test(text)) return "Entertainment";
  if (/flight|hotel|taxi|train|bus/.test(text)) return "Travel";
  if (/restaurant|coffee|pizza|drink|meal|food/.test(text)) return "Food & Drink";
  if (/shirt|pants|shoes|clothes|jacket/.test(text)) return "Clothes";
  if (/fridge|tv|microwave|appliance/.test(text)) return "Appliances";
  if (/cleaning|repair|service|subscription/.test(text)) return "Services";
  return "Other";
}

async function callGemini(expense) {
  try {
    const prompt = `There are 7 categories: ${categories.join(", ")}. 
Which category does the following expense belong to? Only respond with the category name.\nExpense: "${expense}"`;
    const model = "models/gemini-2.5-flash";
    const response = await genaiClient.models.generateContent({ model, contents: prompt });
    if (response && response.text) return response.text.trim();
  } catch (e) {
    console.warn("Gemini failed, fallback rule used:", e.message);
  }
  return ruleBased(expense);
}

(async () => {
  const expenseName = "cinema tickets";
  const category = await callGemini(expenseName);
  console.log("Expense:", expenseName, "=> Category:", category);
})();
