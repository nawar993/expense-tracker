import React from "react";
import { Container } from "react-bootstrap";

export default function Privacy() {
  return (
    <Container style={{ padding: "60px 20px" }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: March 2026</p>
      <p>
        This Privacy Policy explains how Expense Tracker GmbH collects,
        uses, and protects your personal data when you use our website and services.
      </p>

      <h3>Information We Collect</h3>
      <ul>
        <li>Personal information such as name, email, and account details.</li>
        <li>Financial data you enter into our expense tracker.</li>
        <li>Usage data including pages visited and features used.</li>
      </ul>

      <h3>How We Use Your Data</h3>
      <ul>
        <li>To provide and improve our services.</li>
        <li>To communicate with you regarding your account.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h3>Data Protection</h3>
      <p>
        We implement appropriate technical and organizational measures
        to protect your data against unauthorized access or disclosure.
      </p>

      <h3>Contact Us</h3>
      <p>If you have questions regarding your privacy, please contact us at privacy@expensetracker.de</p>
    </Container>
  );
}