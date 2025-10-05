const xlsx = require("xlsx");
const Expense = require("../models/Expense");

// 7 fixed categories
const categories = [
  "Travel",
  "Entertainment",
  "Food & Drink",
  "Clothes",
  "Appliances",
  "Services",
  "Other",
];

// Optional simple rule-based fallback
function ruleBased(expenseName) {
  const text = expenseName.toLowerCase();
  if (/cinema|movie|concert|show|theater/.test(text)) return "Entertainment";
  if (/flight|hotel|taxi|train|bus/.test(text)) return "Travel";
  if (/restaurant|coffee|pizza|drink|meal|food/.test(text)) return "Food & Drink";
  if (/shirt|pants|shoes|clothes|jacket/.test(text)) return "Clothes";
  if (/fridge|tv|microwave|appliance/.test(text)) return "Appliances";
  if (/cleaning|repair|service|subscription/.test(text)) return "Services";
  return "Other";
}

// Gemini API setup
let useGenAi = false;
let genaiClient = null;
try {
  const { GoogleGenAI } = require("@google/genai");
  if (process.env.GEMINI_API_KEY) {
    genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    useGenAi = true;
    console.log("Using @google/genai SDK for Gemini calls");
  }
} catch (e) {
  console.log("@google/genai SDK not available; using fallback only");
}

async function callGemini(expenseName) {
  if (useGenAi && genaiClient) {
    try {
      const prompt = `There are 7 categories: ${categories.join(", ")}. 
Which category does the following expense belong to? Only respond with the category name.
Expense: "${expenseName}"`;

      const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
      const response = await genaiClient.models.generateContent({
        model,
        contents: prompt,
      });

      if (response && typeof response.text === "string") {
        const cat = response.text.trim();
        if (categories.includes(cat)) return cat;
      }
    } catch (err) {
      console.warn("⚠️ Gemini API failed. Fallback category used:", err.message || err);
    }
  }
  // fallback
  return ruleBased(expenseName);
}

// Add Expense
exports.addExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, name, amount, date } = req.body;
    if (!name || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const category = await callGemini(name);

    const newExpense = new Expense({
      userId,
      icon,
      name,
      category,
      amount,
      date: new Date(date),
    });

    await newExpense.save();
    res.status(200).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Expenses
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Download Excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    const data = expenses.map((item) => ({
      Name: item.name,
      Category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expenses");

    const filePath = "expense_details.xlsx";
    xlsx.writeFile(wb, filePath);

    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
