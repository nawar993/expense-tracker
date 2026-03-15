import { Form, Row, Col, Button } from "react-bootstrap";

export default function ExpenseForm({ title, setTitle, amount, setAmount, category, setCategory, categories, handleAddExpense, styles }) {
  return (
    <Form onSubmit={handleAddExpense}>
      <Row className="g-3 mb-3">
        {/* Title */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} required />
          </Form.Group>
        </Col>

        {/* Amount */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
          </Form.Group>
        </Col>

        {/* Category */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Add Button */}
        <Col md={3} className="d-flex align-items-end">
          <Button type="submit" style={styles.button} className="w-100"
            onMouseOver={e => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseOut={e => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}>
            Add
          </Button>
        </Col>
      </Row>
    </Form>
  );
}