import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import fixedExpenseRoutes from "./routes/fixedExpenseRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/users", userRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/category", categoryRoutes)

app.use("/api/fixed-expenses", fixedExpenseRoutes)

app.use("/uploads", express.static("uploads"));
export default app;