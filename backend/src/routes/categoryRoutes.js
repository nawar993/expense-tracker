import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", protect, createCategory);
router.get("/", protect, getCategories);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;