import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import "../css/reglog.css";
import { api } from "../services/api"
import { useNavigate } from "react-router-dom";

export default function RegLog() {
  const navigate = useNavigate();

  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.loginEmail.value;
    const password = e.target.loginPassword.value;
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await api.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);

      localStorage.setItem("toastMessage", "Logged in successfully!");
      
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed");
    } finally {
    setLoginLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const email = e.target.signupEmail.value;
    const password = e.target.signupPassword.value;
    setSignupError("");
    setSignupLoading(true);

    try {
      await api.post("/users/register", { firstName, lastName, email, password });
      setToastMessage("User created successfully! You can now login");
      setShowToast(true);
      e.target.reset();
    } catch (err) {
      setSignupError(err.response?.data?.error || "Sign up failed");
    } finally {
    setSignupLoading(false);
    }
  };

  return (
    <div className="reglog-page">

      {/* Navbar */}
      <AppNavbar />

      {/* Forms Container */}
      <Container className="reglog-container">
        <Row className="justify-content-center align-items-start">

          {/* Login Form */}
          <Col md={4}>
            <Card className="auth-card login-card">
              <Card.Body className="d-flex flex-column justify-content-between h-100">
                <h3 className="text-center mb-4">Login</h3>
                <Form id="login-form" className="flex-grow-1" onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter your email" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter your password" />
                  </Form.Group>

                  {loginError && <p className="text-danger mt-2">{loginError}</p>}

                  <Button type="submit" className="w-100 gradient-btn mt-auto" disabled={loginLoading}>
                    {loginLoading ? "Logging in..." : "Login"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sign Up Form */}
          <Col md={4}>
            <Card className="auth-card signup-card">
              <Card.Body className="d-flex flex-column justify-content-between h-100">
                <h3 className="text-center mb-4">Sign Up</h3>
                <Form id="signup-form" className="flex-grow-1" onSubmit={handleSignUp}>
                  <Row>
                    <div className="d-flex gap-2">
                      <Form.Group className="flex-grow-1" controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" placeholder="First Name" />
                      </Form.Group>
                    
                    
                      <Form.Group className="flex-grow-1" controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" placeholder="Last Name" />
                      </Form.Group>
                    </div>
                  </Row>

                  <Form.Group className="mb-3" controlId="signupEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter your email" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="signupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter your password" />
                  </Form.Group>

                  {signupError && <p className="text-danger mt-2">{signupError}</p>}

                  <Button type="submit" className="w-100 gradient-btn mt-auto" disabled={signupLoading}>
                    {signupLoading ? "Signing up..." : "Sign Up"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide bg="success">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

    </div>
  );
}