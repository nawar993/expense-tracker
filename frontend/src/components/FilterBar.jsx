// فلترة حسب الفئة والتاريخ
import { Row, Col, Form, Button } from "react-bootstrap";

export default function FilterBar({
  filterCategory,
  setFilterCategory,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo,
  categories,
  fetchFilteredExpenses,
  styles = {}  // default styles إذا لم يتم تمريرها
}) {
  // نحدد default للزر إذا لم يرسل أحد styles
  const buttonStyle = styles.button || { backgroundColor: "#007bff", borderColor: "#007bff" };

  return (
    <Row className="filter-bar">
      <Col md={3}>
        <Form.Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </Form.Select>
      </Col>
      <Col md={3}>
        <Form.Control type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} placeholder="From Date" />
      </Col>
      <Col md={3}>
        <Form.Control type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} placeholder="To Date" />
      </Col>
      <Col md={3} className="d-flex gap-2">
        <Button style={buttonStyle} onClick={fetchFilteredExpenses}>Apply</Button>
        <Button variant="secondary" onClick={() => { 
          setFilterCategory(""); 
          setFilterFrom(""); 
          setFilterTo(""); 
          fetchFilteredExpenses({
            categoryId: undefined,
            from: undefined,
            to: undefined
          });
        }}>Reset</Button>
      </Col>
    </Row>
  );
}