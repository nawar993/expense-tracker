import React, { useState } from "react";
import { api } from "../services/api";

const AddExpense = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", { title, amount, category });
      alert("Expense added!");
      setTitle(""); setAmount(""); setCategory("");
    } catch (err) {
      console.error("Error adding expense", err);
      alert("Failed to add expense");
    }
  };

  return (
    <div>
      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AddExpense;