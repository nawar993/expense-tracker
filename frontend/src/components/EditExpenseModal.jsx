import { Modal, Button, Form } from "react-bootstrap";

export default function EditExpenseModal({ isModalOpen, setIsModalOpen, editingExpense, setEditingExpense, handleUpdateExpense, categories }) {
  return (
    <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Expense</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" value={editingExpense?.title || ""} onChange={e => setEditingExpense({...editingExpense, title: e.target.value})} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" value={editingExpense?.amount || ""} onChange={e => setEditingExpense({...editingExpense, amount: e.target.value})} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select value={editingExpense?.categoryId || ""} onChange={e => setEditingExpense({...editingExpense, categoryId: e.target.value})}>
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={editingExpense?.date ? new Date(editingExpense.date).toISOString().split("T")[0] : ""}
              onChange={e => setEditingExpense({ ...editingExpense, date: e.target.value })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleUpdateExpense}>Save</Button>
        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}