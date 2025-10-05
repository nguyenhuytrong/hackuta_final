export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


export const addThousandsSeparator = (num) => {
  if (num == null || isNaN(num)) return "";

  const [integerPart, fractionalPart] = num.toString().split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

// Hàm chuẩn bị dữ liệu
export const prepareExpenseBarChartData = (data) => {
  if (!data) return [];
  return data
    .map((item) => ({
      title: item.name || item.category,
      date: item.date,
      amount: item.amount,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // sắp xếp tăng dần theo ngày
};


export const prepareIncomeBarChartData = (data = []) => {
  if (!data || data.length === 0) return [];

  // Map data giống Expense, giữ title, date, amount
  const chartData = data.map((item) => ({
    title: item.source || "Unknown",  // hiển thị trong tooltip
    date: item.date ? new Date(item.date) : null, // dùng để sort & trục X
    amount: item.amount || 0,
  }));

  // Sắp xếp theo ngày tăng dần
  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return chartData;
};


import moment from "moment";
export const prepareExpenseLineChartData = (data = []) => {
  // Sắp xếp theo ngày tăng dần
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Chuẩn hóa dữ liệu cho chart
  const chartData = sortedData.map((item) => ({
    month: moment(item?.date).format("Do MMM"), // ví dụ: "1st Jan"
    amount: item?.amount,
    name: item?.name,
  }));

  return chartData;
};

