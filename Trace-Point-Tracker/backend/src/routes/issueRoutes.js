import express from "express";
import { body } from "express-validator";
import protect from "../middleware/auth.js";
import {
  getIssues,
  getStats,
  assistIssue,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
} from "../controllers/issueController.js";

const router = express.Router();

router.use(protect);

const issueValidation = [
  body("title").optional().trim().isLength({ min: 1, max: 120 }).withMessage("Title is required (max 120 chars)"),
  body("status").optional().isIn(["open", "in_progress", "closed"]).withMessage("Invalid status"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  body("category")
    .optional()
    .isIn(["bug", "feature", "improvement", "docs", "support"])
    .withMessage("Invalid category"),
  body("summary").optional().isLength({ max: 280 }).withMessage("Summary cannot exceed 280 characters"),
  body("suggestions").optional().isArray({ max: 8 }).withMessage("Suggestions must be a short list"),
  body("suggestions.*").optional().isString().isLength({ max: 240 }).withMessage("Each suggestion is too long"),
];

router.get("/", getIssues);
router.get("/stats", getStats);
router.post("/assist", assistIssue);
router.get("/:id", getIssue);
router.post(
  "/",
  [body("title").trim().notEmpty().withMessage("Title is required"), ...issueValidation],
  createIssue
);
router.put("/:id", issueValidation, updateIssue);
router.delete("/:id", deleteIssue);

export default router;
