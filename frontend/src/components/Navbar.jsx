import React, {useState} from "react";
import { Navbar, Nav, Container, Button, NavDropdown, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import "../css/navbar.css";

export default function AppNavbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToastMessage("Logged out successfully!");
    setShowToast(true);

    setTimeout(() => {
      navigate("/");
    }, 1500); //بعد ثانية ونص
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <>
      <Navbar expand="lg" className="main-navbar">
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="logo">ExpenseTracker</Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">

              {/* Always visible */}
              <Nav.Link as={Link} to="/">Home</Nav.Link>

              {token ? (
                <>
                  <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link href="/expenses">Expenses</Nav.Link>
                  <Nav.Link href="/fixed-expenses">Fixed Expenses</Nav.Link>

                  {/* Profile Dropdown */}
                  <NavDropdown title="👤" id="profile-dropdown" align="end">
                    <NavDropdown.Item onClick={goToProfile}>Profile</NavDropdown.Item>
                  </NavDropdown>

                  <Button
                    className="logout-btn ms-2" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  className="login-btn"  as={Link} to="/reglog">
                  Login
                </Button>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}