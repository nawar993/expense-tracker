import { useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { api } from "../services/api";
import "../css/categoryManager.css"

export default function CategoryManager({ isModalOpen, setIsModalOpen, categories, setCategories }) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await api.post("/category", { name: newCategory });
      setCategories([...categories, res.data]);
      setNewCategory("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add category");
    }
  };

  // فتح وضع التعديل
  const startEditing = (cat) => setEditingCategory(cat);

  const saveEditing = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    try {
      const res = await api.put(`/category/${editingCategory.id}`, { name: editingCategory.name });
      setCategories(categories.map(cat => cat.id === res.data.id ? res.data : cat));
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update category");
    }
  };

  const openDeleteConfirm = (cat) => {
    setCategoryToDelete(cat);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async (deleteExpensesToo) => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/category/${categoryToDelete.id}`, {
        data: { deleteExpenses: deleteExpensesToo }
      });
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cannot delete this category. It may have expenses.");
    } finally {
      setCategoryToDelete(null);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Categories</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* إضافة فئة جديدة */}
          <Form className="mb-3" onSubmit={e => { e.preventDefault(); handleAddCategory(); }}>
            <Form.Group className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
              <Button className="category-btn add" onClick={handleAddCategory}>Add</Button>
            </Form.Group>
          </Form>

          {/* جدول الفئات */}
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    {editingCategory?.id === cat.id ? (
                      <Form.Control
                        type="text"
                        value={editingCategory.name}
                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                    ) : cat.name}
                  </td>
                  <td className="d-flex gap-2">
                    {editingCategory?.id === cat.id ? (
                      <>
                        <Button size="sm" className="category-btn save" onClick={saveEditing}>Save</Button>
                        <Button size="sm" className="category-btn cancel" onClick={() => setEditingCategory(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" className="category-btn edit" onClick={() => startEditing(cat)}>Edit</Button>
                        <Button size="sm" className="category-btn delete" onClick={() => openDeleteConfirm(cat)}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center">No categories yet</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button className="category-btn close" onClick={() => setIsModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal للحذف */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This category <strong>{categoryToDelete?.name}</strong> may have expenses.
          What do you want to do?
        </Modal.Body>
        <Modal.Footer>
          <Button className="category-btn cancel" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button className="category-btn edit" onClick={() => handleConfirmDelete(false)}>Delete Category Only</Button>
          <Button className="category-btn delete" onClick={() => handleConfirmDelete(true)}>Delete Category & Expenses</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}