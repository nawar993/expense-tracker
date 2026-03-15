import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getTotalExpenses,
  getTotalByCategory
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);

//حساب مجموع المصاريف لكل مستخدم
router.get("/total", protect, getTotalExpenses);

// حساب مجموع المصاريف حسب الفئة مع امكانية فلترة التاريخ
router.get("/total-by-category", protect, getTotalByCategory);


router.get("/:id", protect, getExpenseById);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

export default router;