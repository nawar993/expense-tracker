import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import "../css/profile.css";
import { api } from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [budget, setBudget] = useState(""); // <-- حقل الميزانية

  // تحميل بيانات المستخدم عند فتح الصفحة
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser(res.data);
          setBudget(res.data.budget || "");
        })
        .catch((err) => console.error(err));
    }
  }, []);

  // عند اختيار صورة
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // حفظ التحديثات
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("firstName", e.target.firstName.value);
    formData.append("lastName", e.target.lastName.value);
    formData.append("email", e.target.email.value);

    if (password) formData.append("password", password);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await api.put("/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
      setPassword("");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  // تحديث الميزانية
  const handleBudgetSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.put(
        "/users/budget",
        { budget: parseFloat(budget) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      alert("Budget updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update budget.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <AppNavbar />

      <Container className="mt-4">
        <Row className="justify-content-center">

          {/* Avatar Card */}
          <Col md={4} className="mb-4">
            <Card className="profile-card text-center">
              <Card.Body>
                <Image
                  src={
                    avatarPreview ||
                    (user.avatar
                      ? `http://localhost:5000${user.avatar}`
                      : "https://via.placeholder.com/120")
                  }
                  roundedCircle
                  width={120}
                  height={120}
                  className="mb-3"
                />
                <div className="mb-3">
                  <label htmlFor="avatarUpload" className="btn gradient-btn">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </div>

                <h4>{user.firstName} {user.lastName}</h4>
                <p>{user.email}</p>
              </Card.Body>
            </Card>
          </Col>

          {/* Account Settings */}
          <Col md={6}>
            <Card className="profile-card">
              <Card.Body>
                <h5 className="mb-3">Account Settings</h5>
                <Form onSubmit={handleSave}>

                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" defaultValue={user.firstName} />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" defaultValue={user.lastName} />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" defaultValue={user.email} />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Change Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 gradient-btn mb-3">
                    Save Changes
                  </Button>

                  {/* Budget Input */}
                  <Form.Group className="mb-3" controlId="budget">
                    <Form.Label>Monthly Budget</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter monthly budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    type="button"
                    className="w-100 gradient-btn"
                    onClick={handleBudgetSave}
                  >
                    Save Budget
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
