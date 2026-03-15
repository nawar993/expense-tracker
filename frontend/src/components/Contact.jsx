import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import "../css/reglog.css";
import { api } from "../services/api";

export default function Contact() {
  const [formStatus, setFormStatus] = useState(""); // رسالة نجاح/فشل
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("");
    setFormError("");

    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;

    if (!name || !email || !message) {
      setFormError("Please fill all fields.");
      return;
    }

    try {
      // مثال: ارسال البيانات ل endpoint وهمي للتواصل
      await api.post("/contact", { name, email, message });
      setFormStatus("Your message has been sent successfully!");
      e.target.reset(); // مسح الفورم
    } catch (err) {
      setFormError("Failed to send message. Please try again.",err);
    }
  };

  return (
    <div className="reglog-page">
      <AppNavbar />

      <Container className="reglog-container">
        <Row className="justify-content-center align-items-start">
          <Col md={8} lg={6}>
            <Card className="auth-card contact-card">
              <Card.Body className="d-flex flex-column justify-content-between h-100">
                <h3 className="text-center mb-4">Contact Us</h3>
                
                <Form className="flex-grow-1" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Your Name" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Your Email" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="message">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={5} placeholder="Write your message..." />
                  </Form.Group>

                  {formError && <p className="text-danger mt-2">{formError}</p>}
                  {formStatus && <p className="text-success mt-2">{formStatus}</p>}

                  <Button type="submit" className="w-100 gradient-btn mt-auto">
                    Send Message
                  </Button>
                </Form>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}