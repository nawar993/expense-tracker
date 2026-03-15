import { useEffect, useState, useCallback } from "react";
import { Row, Col, Button, Modal, Form, Table } from "react-bootstrap";
import { api } from "../services/api";
import "../css/FixedExpenses.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function FixedExpenses() {
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  // نموذج الحقول
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [categories, setCategories] = useState([]);

  // ---- Fetch fixed expenses ----
  const fetchFixedExpenses = useCallback(async () => {
    try {
      const res = await api.get("/fixed-expenses");
      setFixedExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    const fetchData = async () => {
      await fetchFixedExpenses();
      await fetchCategories();
    };
    fetchData();
  }, [fetchFixedExpenses, fetchCategories]);

  // ---- Save (Add/Update) ----
  const handleSave = async () => {
    try {
      const payload = {
        name: title || "",                 // backend expects 'name'
        categoryId: Number(categoryId),
        amount: parseFloat(amount),
        dayOfMonth: Number(dayOfMonth),
        ...(editExpense 
          ? { durationMonths: Number(durationMonths) } // للـ PUT
          : { duration: Number(durationMonths) }       // للـ POST
      )
      };

      if (editExpense) {
        await api.put(`/fixed-expenses/${editExpense.id}`, payload);
      } else {
        await api.post("/fixed-expenses", payload);
      }

      if (editExpense) {
        await api.put(`/fixed-expenses/${editExpense.id}`, payload);
      } else {
        await api.post("/fixed-expenses", payload);
      }

      // تنظيف النموذج وإغلاق المودال
      setShowModal(false);
      setEditExpense(null);
      setTitle(""); setCategoryId(""); setAmount(""); setDayOfMonth(""); setDurationMonths("");
      fetchFixedExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Edit ----
  const handleEdit = (expense) => {
    setEditExpense(expense);
    setTitle(expense.name);
    setCategoryId(expense.categoryId);
    setAmount(expense.amount);
    setDayOfMonth(expense.dayOfMonth);
    setDurationMonths(expense.duration); // use 'duration' field
    setShowModal(true);
  };

  // ---- Delete ----
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this fixed expense?")) return;
    try {
      await api.delete(`/fixed-expenses/${id}`);
      fetchFixedExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Table Colors ----
  const labelColors = ["#b19cd9", "#9E7BFF", "#4d87fd", "#56A5EC", "#2ccaff"];

  return (
    <div className="fixed-expenses-page">
      <div className="page-header">
        <Row className="align-items-center">
          <Col>
            <h2 className="page-title">Fixed Expenses</h2>
          </Col>
          <Col className="text-end mb-3" >
            <Button onClick={() => setShowModal(true)}>Add New Expense</Button>
          </Col>
        </Row>
      </div>

      <div className="table-container">
        <Table className="styled-table">
          <thead>
            <tr>
              <th className="header-cell">Title</th>
              <th className="header-cell">Category</th>
              <th className="header-cell">Amount</th>
              <th className="header-cell">Day</th>
              <th className="header-cell">Duration (months)</th>
              <th className="header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fixedExpenses.map((fe, i) => (
              <tr key={fe.id} className="table-row">
                <td className="title-cell" style={{ backgroundColor: labelColors[i % labelColors.length] }}>
                  {fe.name}
                </td>
                <td className="data-cell">{fe.category?.name}</td>
                <td className="data-cell">{fe.amount}</td>
                <td className="data-cell">{fe.dayOfMonth}</td>
                <td className="data-cell">{fe.duration}</td>
                <td className="action-cell">
                  <FaEdit
                    className="action-icon edit-icon" 
                    onClick={() => handleEdit(fe)}/>
                  <FaTrash
                    className="action-icon delete-icon"
                    onClick={() => handleDelete(fe.id)}/>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ---- Modal ---- */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditExpense(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editExpense ? "Edit Fixed Expense" : "Add New Fixed Expense"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Day of Month</Form.Label>
              <Form.Control type="number" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Duration (months)</Form.Label>
              <Form.Control type="number" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditExpense(null); }}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{editExpense ? "Update" : "Add"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}