import { Container, Row, Col, Button, Card, Toast, ToastContainer } from "react-bootstrap";
import "../css/Home.css";
import AppNavbar from "../components/Navbar";
import Stats from "../components/Stats";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api"; // افترض أن عندك خدمة API جاهزة

export default function Home() {
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [user, setUser] = useState(null);
  const [userExpenses, setUserExpenses] = useState([]);
  const [userBudget, setUserBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تحقق إذا هناك رسالة toast مخزنة من Login
    const message = localStorage.getItem("toastMessage");
    if (message) {
      setToastMessage(message);
      setShowToast(true);
      localStorage.removeItem("toastMessage"); // امسحها بعد العرض
    }
  }, []);

  // تحميل بيانات المستخدم عند الدخول
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); // مستخدم غير مسجل
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);

        // جلب مصاريف وميزانية المستخدم
        const expensesRes = await api.get("/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserExpenses(expensesRes.data || []);

        const budgetRes = await api.get("/expenses/total", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserBudget(budgetRes.data?.amount || 0);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleStart = () => {
    if (user) navigate("/expenses");
    else navigate("/reglog");
  };

  // Fade-in animation للكروت
  useEffect(() => {
    const sections = document.querySelectorAll(".fade-in-section");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="home-page">
      <AppNavbar />

      {/* HERO */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="hero-title">
                Take Control of Your <span>Expenses</span>
              </h1>
              <p className="hero-text">
                Track daily spending, manage recurring bills,
                and generate financial reports instantly.
              </p>

              <div className="hero-buttons">
                <Button className="hero-btn" onClick={handleStart}>Start Managing</Button>
                <Button href="#features" className="hero-btn-outline">View Features</Button>
              </div>

              <ul className="hero-points">
                <li>✔ Track daily expenses easily</li>
                <li>✔ Manage recurring monthly bills</li>
                <li>✔ Export reports to Excel & PDF</li>
              </ul>
            </Col>

            <Col md={6} className="text-center">
              <div className="hero-dashboard-card">
                <img
                  src="/img/dashboard-mockup.png"
                  alt="Dashboard Preview"
                  className="hero-dashboard-image"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <Container>
          <h2 className="section-title text-center">Powerful Features</h2>
          <Row>
            <Col md={4} className="fade-in-section">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon" style={{color:"#b19cd9"}}>📊</div>
                  <h5>Expense Tracking</h5>
                  <p>Record and manage your daily expenses easily.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="fade-in-section">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon" style={{color:"#9E7BFF"}}>📅</div>
                  <h5>Fixed Expenses</h5>
                  <p>Track recurring monthly expenses clearly.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="fade-in-section">
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon" style={{color:"#4d87fd"}}>📄</div>
                  <h5>Reports</h5>
                  <p>Export professional reports to Excel or PDF.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* STATS */}
      <Stats user={user} userExpenses={userExpenses} userBudget={userBudget} />


      {/* CTA */}
      <section className="cta-section text-center">
        <Container>
          <h2>Start Tracking Your Expenses Today</h2>
          <Button className="cta-btn" onClick={handleStart}>Get Started</Button>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          {/* القسم الأول - العنوان */}
          <div className="footer-section">
            <h5>Expense Tracker GmbH</h5>
            <p>123 Straße, Berlin, Germany</p>
          </div>

          {/* القسم الثاني - السياسات */}
          <div className="footer-section">
            <a href="/privacy" className="footer-link">Privacy Policy</a> | 
            <a href="/terms" className="footer-link">Terms of Service</a>
          </div>

          {/* القسم الثالث - روابط سريعة */}
          <div className="footer-section">
            <a href="/" className="footer-link">Home</a> | 
            <a href="#features" className="footer-link">Features</a> | 
            <a href="/contact" className="footer-link">Contact</a>
          </div>
        </div>
      </footer>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

    </div>
  );
}
