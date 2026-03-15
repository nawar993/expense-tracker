import express from "express";
import { createFixedExpense, getFixedExpenses, updateFixedExpense, deleteFixedExpense, getTotalFixedExpenses } from "../controllers/fixedExpenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// كل المسارات تتطلب تسجيل دخول
router.use(protect);

router.post("/", createFixedExpense);
router.get("/", getFixedExpenses);

router.get("/total",getTotalFixedExpenses)
router.put("/:id", updateFixedExpense);
router.delete("/:id", deleteFixedExpense);

export default router;
