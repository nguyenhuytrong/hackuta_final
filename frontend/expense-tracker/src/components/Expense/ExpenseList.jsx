import React from "react";
import moment from "moment";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

const CATEGORIES = [
  "Travel",
  "Entertainment",
  "Food & Drink",
  "Clothes",
  "Appliances",
  "Services",
  "Other",
];

const ExpenseList = ({ transactions, onDelete, onDownload }) => {
  // Nhóm transactions theo category
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: transactions.filter((t) => t.category === cat),
  }));

  return (
    <div className="card p-6 rounded-xl shadow bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-medium">Expenses</h5>
        <button
          className="flex items-center gap-2 px-2 py-1 rounded bg-gray-400 text-sm text-white hover:bg-gray-500 transition-colors"
          onClick={onDownload}
        >
          <LuDownload className="text-base" />
          Download
        </button>
      </div>

      {/* Transaction List theo category */}
      {grouped.map(({ category, items }) => (
        <div key={category} className="mb-6">
          <h6 className="text-md font-semibold mb-2">{category}</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.length > 0 ? (
              items.map((expense) => (
                <TransactionInfoCard
                  key={expense._id}
                  title={expense.name}
                  icon={expense.icon}
                  date={moment(expense.date).format("MMM D, YYYY")}
                  amount={expense.amount}
                  type="expense"
                  onDelete={() => onDelete(expense._id)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm">No expenses in this category.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
