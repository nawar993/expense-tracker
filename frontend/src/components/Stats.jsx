import { Container, Button } from "react-bootstrap";
import "../css/Stats.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Stats({ user = null, userBudget = 0 }) {
  const navigate = useNavigate();
  const [userExpenses, setUserExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");

      // جلب المصاريف المتغيرة
      api
        .get("/expenses", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUserExpenses(res.data || []))
        .catch((err) => console.error(err));

      // جلب المصاريف الثابتة
      api
        .get("/fixed-expenses", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setFixedExpenses(res.data || []))
        .catch((err) => console.error(err));

      // جلب مجموع المصاريف من الباك (variable فقط)
      api
        .get("/expenses/total", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setTotalExpenses(res.data.total || 0))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!user) {
    return (
      <section className="stats-section text-center">
        <Container>
          <p>Log in to see your stats!</p>
          <Button className="site-btn" onClick={() => navigate("/reglog")}>Login</Button>
        </Container>
      </section>
    );
  }

  // جمع المصاريف الثابتة للمجموع الكلي
  const fixedTotal = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAllExpenses = totalExpenses + fixedTotal;

  // مصاريف الشهر الحالي
  const now = new Date();
  const monthExpenses = userExpenses
    .filter((e) => {
      const date = new Date(e.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // الحساب النهائي للRemaining Budget
  const remainingBudget = Math.max(userBudget - totalAllExpenses, 0);

  const hasData = userExpenses.length + fixedExpenses.length > 0;

  return (
    <Container fluid className="stats-section">
      {hasData ? (
        <div className="stats-row">
          <div className="stat-card fixed">
            <h3>${totalAllExpenses}</h3>
            <p>Total Expenses</p>
          </div>

          <div className="stat-card variable">
            <h3>${fixedTotal}</h3>
            <p>Fixed Expenses</p>
          </div>

          <div className="stat-card this-month">
            <h3>${monthExpenses}</h3>
            <p>This Month</p>
          </div>

          <div className="stat-card remaining">
            <h3>${remainingBudget}</h3>
            <p>Remaining Budget</p>
          </div>
        </div>
      ) : (
        <div className="text-center no-data">
          <p>No expenses found. Start adding your expenses!</p>
          <Button className="site-btn" onClick={() => navigate("/expenses")}>
            Add Expenses
          </Button>
        </div>
      )}
    </Container>
  );
}