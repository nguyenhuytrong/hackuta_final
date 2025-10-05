import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { toast } from "react-hot-toast";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import Modal from "../../components/Modal";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";





const Expense = () => {
  useUserAuth(); // kiểm tra auth

  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);


  const fetchExpenseDetails = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );

      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  
const handleAddExpense = async (expense) => {
  const { name, amount, date, icon } = expense;

  // Log debug để xem dữ liệu trước khi gửi
  console.log("Submitting expense:", { name, amount, date, icon });

  // Validation Checks
  if (!name.trim()) {
    toast.error("Name is required.");
    return;
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    toast.error("Amount should be a valid number greater than 0.");
    return;
  }

  if (!date) {
    toast.error("Date is required.");
    return;
  }

  try {
    const response = await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
      name,
      amount,
      date,
      icon,
    });

    console.log("Response from backend:", response.data); // Log response

    if (response.data) {
      toast.success("Expense added successfully!");
      setOpenAddExpenseModal(false);
      fetchExpenseDetails();
    }
  } catch (error) {
    console.error("Add expense error:", error.response || error);
    toast.error(
      error.response?.data?.message || "Something went wrong while adding expense."
    );
  }
};


  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: 'blob', // quan trọng để nhận dữ liệu dạng blob
      });
      // Tạo URL tạm thời để tải file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link
        .href = url;
      link.setAttribute('download', 'expense_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again.");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense details deleted successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to delete expense. Please try again.");
    }
  };


  useEffect(() => {
    fetchExpenseDetails();
    return () => {}
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <ExpenseOverview
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadExpenseDetails}
          />     

        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} onClose={() => setOpenAddExpenseModal(false)} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={() => {
              deleteExpense(openDeleteAlert.data);  // Xoá thật
              setOpenDeleteAlert({ show: false, data: null }); // Đóng modal sau khi xoá
            }}
            onClose={() => setOpenDeleteAlert({ show: false, data: null })} // Cancel
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
