import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import { useState , useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import InfoCard from "../../components/Cards/InfoCard";
import { IoMdCard } from "react-icons/io";
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu";
import { addThousandsSeparator } from "../../utils/helper";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";


const Home = () => { 
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null); // State to store API response data
  const [loading, setLoading] = useState(false); // State to track loading status
  const [goal, setGoal] = useState("");
  const [showMsg, setShowMsg] = useState(false);


  const fetchDashboardData = async () => {
    if (loading) return; // If already loading, do not fetch again
    setLoading(true);    // Set loading to true before API call

    try {
      const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`);
      // If API returns data
      if (response.data) {
        setDashboardData(response.data); // Store data in state
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
      // Optionally, you could navigate("/login") if you get a 401 Unauthorized
    } finally {
      setLoading(false); // Always turn off loading, whether success or error
    }
  };

  useEffect(() => {
    fetchDashboardData();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
            color="bg-green-500"
          />

          <InfoCard
            icon={<LuHandCoins/>}
            label="Total Expense"
            value={addThousandsSeparator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
        </div>


        {/* Set Goal Input */}
        <div className="mt-6 p-4 bg-white shadow rounded-xl w-full md:w-1/2 mx-auto text-center">
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              placeholder="🎯 Set your monthly goal..."
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 max-w-xs"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && goal.trim()) {
                  setShowMsg(true);
                  setTimeout(() => setShowMsg(false), 2000);
                }
              }}
            />
            <button
              onClick={() => {
                if (goal.trim()) {
                  setShowMsg(true);
                  setTimeout(() => setShowMsg(false), 2000);
                }
              }}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Set Goal
            </button>
          </div>

          {showMsg && (
            <p className="text-green-600 text-sm mt-2 animate-fade-in">
              ✅ Set goal successfully!
            </p>
          )}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/transaction")}
          />

          <FinanceOverview 
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpenses || 0}
          />

          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/expense")}
          />

          <Last30DaysExpenses
            data={dashboardData?.last30DaysExpenses?.transactions || []}
          />

          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions}
            onSeeMore={() => navigate("/income")}
          />
          
          <RecentIncomeWithChart
            data={dashboardData?.last60DaysIncome?.transactions?.slice(0,4) || []}
            totalIncome={dashboardData?.totalIncome || 0}
          />

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Home;
