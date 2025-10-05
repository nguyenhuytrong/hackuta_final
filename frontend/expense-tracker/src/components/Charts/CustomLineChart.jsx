import React from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";

const CustomLineChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload; // lấy ra object gốc

      return (
        <div className="bg-white shadow-md rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-semibold text-purple-700 mb-1">
            {data.name}
          </p>
          <p className="text-sm">
            <span className="">{data.month}</span>
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-red-600">${data.amount}</span>
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        {/* Grid nhẹ */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        {/* Trục */}
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />

        {/* Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        <defs>
          {/* Gradient tím → xanh */}
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" /> {/* tím */}
            <stop offset="100%" stopColor="#5feaffff" /> {/* xanh */}
          </linearGradient>

          {/* Glow tím xanh */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor="#8b5cf6"
              floodOpacity="0.9"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="10"
              floodColor="#3b82f6"
              floodOpacity="0.7"
            />
          </filter>
        </defs>

        {/* Line chính */}
        <Line
          type="monotone"
          dataKey="amount"
          stroke="url(#lineGradient)"
          strokeWidth={3}
          dot={{
            r: 5,
            fill: "#8b5cf6",
            stroke: "#fff",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 7,
            fill: "#3b82f6",
            stroke: "#fff",
            strokeWidth: 2,
          }}
          filter="url(#glow)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
