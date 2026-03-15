import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createUser, getAllUsers, loginUser, getCurrentUser, updateUser, updateBudget } from "../controllers/userController.js"
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.get("/", protect, getAllUsers);
router.post("/login", loginUser);

router.get("/me", protect, getCurrentUser);

router.put("/me", protect, upload.single("avatar"), updateUser);

router.put("/budget", protect, updateBudget);

export default router;