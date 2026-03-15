import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import ExpensesChart from "../components/ExpensesChart";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import { FaWallet, FaListAlt, FaChartPie, FaStar, FaExclamationTriangle } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [highlightCategory, setHighlightCategory] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // ---- Spending Limit ----
  const [spendingLimit, setSpendingLimit] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInput, setLimitInput] = useState("");

  // ---- Previous period total ----
  const [prevTotal, setPrevTotal] = useState(0);

  const [reportType, setReportType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          api.get("/expenses"),
          api.get("/category"),
        ]);

        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentTotal = expensesRes.data
          .filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        setTotal(currentTotal);

        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear = currentYear - 1;
        }

        const lastMonthTotal = expensesRes.data
          .filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        setPrevTotal(lastMonthTotal);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // حساب فئة الأعلى صرفاً
  const topCategory = categories.reduce((top, cat) => {
    const catTotal = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    if (!top || catTotal > top.total) return { name: cat.name, total: catTotal };
    return top;
  }, null);

  const getFilteredExpenses = ({ categoryId, fromDate, toDate } = {}) => {
    let filtered = expenses;

    if (categoryId) filtered = filtered.filter(e => e.categoryId === Number(categoryId));
    if (fromDate) filtered = filtered.filter(e => new Date(e.date) >= new Date(fromDate));
    if (toDate) filtered = filtered.filter(e => new Date(e.date) <= new Date(toDate));

    const today = new Date();
    if (!categoryId && !fromDate && !toDate) {
      if (reportType === "month") {
        filtered = filtered.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
      } else if (reportType === "year") {
        filtered = filtered.filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === today.getFullYear();
        });
      } else if (reportType === "custom" && fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        filtered = filtered.filter(e => {
          const d = new Date(e.date);
          return d >= from && d <= to;
        });
      }
    }
    return filtered;
  };

  const getReportFileName = ({ fromDate, toDate } = {}) => {
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    if (reportType === "month") return `Expenses_${monthName}_${year}`;
    if (reportType === "year") return `Expenses_${year}`;
    if (reportType === "custom" && fromDate && toDate) return `Expenses_${fromDate}_to_${toDate}`;
    return `Expenses_All_Time`;
  };

  // ---- Export Excel ----
  const exportExcel = ({ categoryId, fromDate, toDate } = {}) => {
    const filtered = getFilteredExpenses({ categoryId, fromDate, toDate });

    const data = filtered.map(e => ({
      Title: e.title,
      Amount: e.amount,
      Category: categories.find(c => c.id === e.categoryId)?.name || '',
      Date: new Date(e.date).toLocaleDateString()
    }));

    const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);
    data.push({ Title: 'Total', Amount: totalFiltered, Category: '', Date: '' });

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Expenses");
    writeFile(wb, `${getReportFileName({ fromDate, toDate })}.xlsx`);
  };

  // ---- Export PDF ----
  const exportPDF = ({ categoryId, fromDate, toDate } = {}) => {
    const filtered = getFilteredExpenses({ categoryId, fromDate, toDate });
    const doc = new jsPDF();

    const tableData = filtered.map(e => {
      const category = categories.find(c => c.id === e.categoryId)?.name || '';
      return [e.title, e.amount, category, new Date(e.date).toLocaleDateString()];
    });

    const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);
    tableData.push(['Total', totalFiltered.toFixed(2), '', '']);

    autoTable(doc, {
      head: [['Title', 'Amount', 'Category', 'Date']],
      body: tableData,
      startY: 20
    });

    doc.save(`${getReportFileName({ fromDate, toDate })}.pdf`);
  };

  // ---- Handle Limit Modal ----
  const handleSaveLimit = () => {
    const value = parseFloat(limitInput);
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    setSpendingLimit(value);
    setShowLimitModal(false);
  };

  const getArrow = () => {
    if (total > prevTotal) return "↑";
    if (total < prevTotal) return "↓";
    return "";
  };

  return (
    <div className={`dashboard-page ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* ---- Header ---- */}
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <div className="dashboard-buttons">
          <div className="btn-row">
            <Button className={`dark-toggle-btn ${darkMode ? "dark" : "light"}`} onClick={() => setDarkMode(prev => !prev)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button variant="warning" onClick={() => setShowLimitModal(true)}>Set Spending Limit</Button>
          </div>
          <Form.Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={{ maxWidth: "200px", marginBottom: "10px" }}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </Form.Select>

          {reportType === "custom" && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          )}

          <div className="btn-row">
            <Button variant="success" onClick={() => exportExcel()}>Export Excel</Button>
            <Button variant="secondary" onClick={() => exportPDF()}>Export PDF</Button>
            <Button variant="info" onClick={() => navigate("/fixed-expenses")}>
              Manage Fixed Expenses
            </Button>
          </div>
        </div>
      </div>

      {/* ---- Limit Warning ---- */}
      {spendingLimit && total > spendingLimit && (
        <Card className="mb-3 p-3 limit-warning">
          <FaExclamationTriangle style={{ marginRight: "8px" }} />
          Warning: Total expenses exceeded the limit of {spendingLimit} €
        </Card>
      )}

      {/* ---- Stats Cards ---- */}
      <Row className="stats-row">
        <Col>
          <Card className="p-3 dashboard-card">
            <div className="card-icon"><FaWallet /></div>
            <h5>Total Expenses {highlightCategory && `(Filtered)`}</h5>
            <h3>
              {total.toFixed(2)} €
              <span style={{ color: total > prevTotal ? "red" : "green", fontSize: "28px", fontWeight: "bold" }}>
                {getArrow()}
              </span>
            </h3>
          </Card>
        </Col>
        <Col>
          <Card className="p-3 dashboard-card">
            <div className="card-icon"><FaListAlt /></div>
            <h5>Number of Transactions</h5>
            <h3>{highlightCategory ? expenses.filter(e => e.categoryId === highlightCategory).length : expenses.length}</h3>
          </Card>
        </Col>
        <Col>
          <Card className="p-3 dashboard-card">
            <div className="card-icon"><FaChartPie /></div>
            <h5>Average Expense</h5>
            <h3>{highlightCategory
              ? (() => { const filtered = expenses.filter(e => e.categoryId === highlightCategory); return filtered.length > 0 ? (filtered.reduce((sum,e)=>sum+e.amount,0)/filtered.length).toFixed(2) : 0; })()
              : (expenses.length > 0 ? (total / expenses.length).toFixed(2) : 0)
            }</h3>
          </Card>
        </Col>
        <Col>
          <Card className="p-3 dashboard-card">
            <div className="card-icon"><FaStar /></div>
            <h5>Top Category</h5>
            <h3>{topCategory ? topCategory.name : "-"}</h3>
          </Card>
        </Col>
      </Row>

      {/* ---- Chart ---- */}
      <Card className="chart-card">
        <ExpensesChart
          expenses={expenses}
          categories={categories}
          darkMode={darkMode}
          onSelectCategory={(categoryName) => {
            const cat = categories.find(c => c.name === categoryName);
            if (!cat) return;
            setHighlightCategory(cat.id);
            const filteredTotal = expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
            setTotal(filteredTotal);
          }}
          onNavigateCategory={(url) => navigate(url)}
        />
      </Card>

      {/* ---- Limit Modal ---- */}
      <Modal show={showLimitModal} onHide={() => setShowLimitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Spending Limit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Enter maximum total expenses (€)</Form.Label>
              <Form.Control
                type="number"
                value={limitInput}
                onChange={e => setLimitInput(e.target.value)}
                placeholder="e.g., 1000"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLimitModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveLimit}>Save Limit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
