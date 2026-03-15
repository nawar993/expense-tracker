import React from "react";
import { Container } from "react-bootstrap";

export default function Terms() {
  return (
    <Container style={{ padding: "60px 20px" }}>
      <h1>Terms of Service</h1>
      <p>Last updated: March 2026</p>
      <p>
        By using Expense Tracker GmbH services, you agree to the following terms:
      </p>

      <h3>1. Account Responsibility</h3>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and password, and for all activities that occur under your account.
      </p>

      <h3>2. Use of Services</h3>
      <p>
        You may use the services only for lawful purposes and in accordance
        with these terms. You may not use our services for any unauthorized or illegal activities.
      </p>

      <h3>3. Data Accuracy</h3>
      <p>
        You are responsible for providing accurate and up-to-date information
        when using the application.
      </p>

      <h3>4. Limitation of Liability</h3>
      <p>
        Expense Tracker GmbH is not liable for any financial losses
        or errors caused by the use of our services.
      </p>

      <h3>Contact</h3>
      <p>
        For questions regarding these terms, please contact us at support@expensetracker.de
      </p>
    </Container>
  );
}