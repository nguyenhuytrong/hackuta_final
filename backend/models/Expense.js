// models/Expense.js
const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    icon: { type: String },

    name: { type: String, required: true },        // ví dụ: "coffee", "cinema ticket"

    category: { type: String, required: true },    // Travel, Food & Drink, Services, ...

    amount: { type: Number, required: true },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🧩 Tạo index giúp tìm kiếm nhanh theo category
ExpenseSchema.index({ category: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
