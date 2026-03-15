import React from "react";
import "../css/styleTable.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ExpenseTable({ expenses, handleDeleteExpense, openEditModal }) {
  const labelColors = ["#b19cd9", "#9E7BFF", "#4d87fd", "#56A5EC", "#2ccaff"];

  return (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            <th className="header-cell">Title</th>
            <th className="header-cell">Amount</th>
            <th className="header-cell">Category</th>
            <th className="header-cell">Date</th>
            <th className="header-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, i) => (
            <tr key={exp.id} className="table-row">
              <td
                className="title-cell"
                style={{ backgroundColor: labelColors[i % labelColors.length] }}
              >
                {exp.title}
              </td>
              <td className="data-cell">{exp.amount} €</td>
              <td className="data-cell">{exp.category?.name || exp.category}</td>
              <td className="data-cell">{new Date(exp.date).toLocaleDateString()}</td>
              <td className="action-cell">
                <FaEdit
                  className="action-icon edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(exp);
                  }}
                />
                <FaTrash
                  className="action-icon delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteExpense(exp);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}