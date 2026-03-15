import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Toast, ToastContainer } from "react-bootstrap";
import ExpenseForm from "../components/ExpenseForm";
import FilterBar from "../components/FilterBar";
import ExpenseTable from "../components/ExpenseTable";
import EditExpenseModal from "../components/EditExpenseModal";
import CategoryManager from "../components/CategoryManager";
import { api } from "../services/api";
import { useSearchParams } from "react-router-dom";
import "../css/Expenses.css";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [editingExpense, setEditingExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState("success");

  const [deletedExpense, setDeletedExpense] = useState(null);

  const [duplicateExpense, setDuplicateExpense] = useState(null);
  const [showDuplicateToast, setShowDuplicateToast] = useState(false);

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const monthParam = searchParams.get("month");
  const [activeCategoryName, setActiveCategoryName] = useState("");

  const styles = {
    button: { backgroundColor: "#9ca3af", borderColor: "#6b7280" },
    buttonHover: { backgroundColor: "#4b5563", borderColor: "#4b5563" },
    tableHeader: { backgroundColor: "#9ca3af", color: "#fff" },
    tableRowHover: { cursor: "pointer", backgroundColor: "#f8f9fa" },
  };

  // جلب البيانات الأساسية
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchForParams = async () => {
      if (categories.length === 0) return;
      let params = {};

      if (categoryParam) {
        const cat = categories.find(c => c.name === categoryParam);
        if (cat) {
          setFilterCategory(cat.id);
          setActiveCategoryName(cat.name);
          params.categoryId = cat.id;
        }
      }

      if (monthParam) {
        const [yearStr, monthStr] = monthParam.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        if (!isNaN(year) && !isNaN(month)) {
          const from = new Date(year, month - 1, 1).toISOString();
          const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
          params.from = from;
          params.to = to;
        }
      }

      try {
        const res = await api.get("/expenses", { params });
        setExpenses(res.data);
        setTotal(res.data.reduce((sum, e) => sum + e.amount, 0));
      } catch (err) {
        console.error(err);
      }
    };

    fetchForParams();
  }, [categories, categoryParam, monthParam]);

  const fetchData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/category"),
      ]);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
      setTotal(expensesRes.data.reduce((sum, e) => sum + e.amount, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const fetchFilteredExpenses = async (overrideParams = {}) => {
    try {
      const params = {
        ...(filterCategory && { categoryId: filterCategory }),
        ...(filterFrom && { from: filterFrom }),
        ...(filterTo && { to: filterTo }),
        ...overrideParams,
      };
      const res = await api.get("/expenses", { params });
      setExpenses(res.data);
      setTotal(res.data.reduce((sum, e) => sum + e.amount, 0));
    } catch (err) {
      console.error(err);
    }
  };

  // إضافة مصروف مع تحقق من التكرار
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) <= 0) return alert("Amount must be greater than zero");

    const duplicate = expenses.find(
      (exp) =>
        exp.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        parseFloat(exp.amount) === parseFloat(amount) &&
        parseInt(exp.categoryId) === parseInt(category)
    );

    if (duplicate) {
      setDuplicateExpense({ title, amount, categoryId: category });
      setShowDuplicateToast(true);
      return;
    }

    await addExpenseToServer({ title, amount, categoryId: category });
  };

  const addExpenseToServer = async (expenseData) => {
    try {
      const res = await api.post("/expenses", {
        ...expenseData,
        date: new Date(),
      });
      setTitle("");
      setAmount("");
      setCategory("");
      setExpenses([res.data, ...expenses]);
      setTotal([res.data, ...expenses].reduce((sum, e) => sum + e.amount, 0));
      showNotification("Expense added successfully!", "success");
      setDuplicateExpense(null);
      setShowDuplicateToast(false);
    } catch (err) {
      console.error(err);
      showNotification("Failed to add expense", "danger");
    }
  };

  // عند حذف المصروف
const handleDeleteExpense = async (expense) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
  if (!confirmDelete) return;

  try {
    await api.delete(`/expenses/${expense.id}`);
    const updatedExpenses = expenses.filter(e => e.id !== expense.id);
    setExpenses(updatedExpenses);
    setTotal(updatedExpenses.reduce((sum, e) => sum + e.amount, 0));

    // تخزين المصروف المحذوف للتراجع
    setDeletedExpense(expense);

    // إظهار Toast للتراجع
    setToastMessage("Expense deleted. Undo?");
    setToastVariant("danger");
    setShowToast(true);
  } catch (err) {
    console.error(err);
    showNotification("Failed to delete expense", "danger");
  }
};

// تراجع عن الحذف
const handleUndoDelete = async () => {
  if (!deletedExpense) return;

  try {
    const res = await api.post("/expenses", {
      title: deletedExpense.title,
      amount: deletedExpense.amount,
      categoryId: deletedExpense.categoryId,
      date: deletedExpense.date,
    });

    // إعادة المصروف للقائمة
    setExpenses([res.data, ...expenses]);
    setTotal([res.data, ...expenses].reduce((sum, e) => sum + e.amount, 0));

    // إخفاء Toast ومسح deletedExpense
    setDeletedExpense(null);
    setShowToast(false);

    showNotification("Expense restored successfully!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Failed to restore expense", "danger");
  }
};

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    if (parseFloat(editingExpense.amount) <= 0) return alert("Amount must be greater than zero");

    try {
      const res = await api.put(`/expenses/${editingExpense.id}`, {
        title: editingExpense.title,
        amount: parseFloat(editingExpense.amount),
        categoryId: parseInt(editingExpense.categoryId),
        date: editingExpense.date,
      });
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? res.data : exp));
      setTotal(expenses.map(exp => exp.id === editingExpense.id ? res.data : exp)
        .reduce((sum, e) => sum + e.amount, 0));
      setIsModalOpen(false);
      setEditingExpense(null);
      showNotification("Expense updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update expense", "danger");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="page-content">
        <div className="page-header">
          <Row className="align-items-center">
            <Col>
              <h2 className="page-title">Expenses Management</h2>
            </Col>
            <Col className="text-end">
              <Button onClick={() => setIsCategoryModalOpen(true)}>
                Manage Categories
              </Button>
            </Col>
          </Row>
        </div>

        <Card className="mb-3 p-3">
          <ExpenseForm
            title={title} setTitle={setTitle}
            amount={amount} setAmount={setAmount}
            category={category} setCategory={setCategory}
            categories={categories} handleAddExpense={handleAddExpense}
            styles={styles}
          />
        </Card>

        {activeCategoryName && (
          <div style={{
            background: "#eef3ff",
            padding: "10px 15px",
            borderRadius: "8px",
            marginBottom: "10px"
          }}>
            Showing expenses for category: <strong>{activeCategoryName}</strong>
          </div>
        )}

        <Card className="p-3">
          <FilterBar
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            filterFrom={filterFrom} setFilterFrom={setFilterFrom}
            filterTo={filterTo} setFilterTo={setFilterTo}
            categories={categories} fetchFilteredExpenses={fetchFilteredExpenses}
            styles={styles}
          />
          <ExpenseTable
            expenses={expenses}
            handleDeleteExpense={handleDeleteExpense}
            openEditModal={openEditModal}
            styles={styles}
          />
        </Card>

        <div className="total-card">
          Total Expenses: {total} €
        </div>

        <EditExpenseModal
          isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
          editingExpense={editingExpense} setEditingExpense={setEditingExpense}
          handleUpdateExpense={handleUpdateExpense} categories={categories}
        />

        <CategoryManager
          isModalOpen={isCategoryModalOpen} setIsModalOpen={setIsCategoryModalOpen}
          categories={categories} setCategories={setCategories}
        />

        <ToastContainer position="top-end" className="p-3">
  {showToast && !showDuplicateToast && deletedExpense && (
    <Toast bg={toastVariant} show={showToast} delay={8000} autohide onClose={() => setShowToast(false)}>
      <Toast.Body className="d-flex justify-content-between align-items-center text-white">
        <span>{toastMessage}</span>
        <Button variant="light" size="sm" onClick={handleUndoDelete}>
          Undo
        </Button>
      </Toast.Body>
    </Toast>
  )}

  {showDuplicateToast && duplicateExpense && (
    <Toast
      bg="warning"
      onClose={() => setShowDuplicateToast(false)}
      show={showDuplicateToast}
      autohide={false}

    >
      <Toast.Body className="d-flex justify-content-between align-items-center">
<span>This expense seems to be a duplicate! Do you want to proceed?</span>
        <div>
          <Button
            size="sm"
            variant="success"
            className="me-2"
            onClick={() => addExpenseToServer(duplicateExpense)}
          >
            Proceed
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowDuplicateToast(false)}
          >
            Cancel
          </Button>
        </div>
      </Toast.Body>
    </Toast>
  )}
</ToastContainer>

      </div>
    </>
  );
}
