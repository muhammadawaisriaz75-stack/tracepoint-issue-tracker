import { validationResult } from "express-validator";
import Issue from "../models/Issue.js";
import { AiAssistError, suggestIssueTriage } from "../services/aiAssist.js";

export const getIssues = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [total, open, inProgress, closed, high] = await Promise.all([
      Issue.countDocuments({ user: userId }),
      Issue.countDocuments({ user: userId, status: "open" }),
      Issue.countDocuments({ user: userId, status: "in_progress" }),
      Issue.countDocuments({ user: userId, status: "closed" }),
      Issue.countDocuments({ user: userId, priority: "high", status: { $ne: "closed" } }),
    ]);

    res.json({ total, open, inProgress, closed, high });
  } catch (error) {
    next(error);
  }
};

export const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, user: req.user._id });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, summary, category, suggestions, status, priority, dueDate } = req.body;

    const issue = await Issue.create({
      user: req.user._id,
      title,
      description,
      summary,
      category,
      suggestions: Array.isArray(suggestions) ? suggestions : [],
      status,
      priority,
      dueDate: dueDate || null,
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const issue = await Issue.findOne({ _id: req.params.id, user: req.user._id });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const { title, description, summary, category, suggestions, status, priority, dueDate } = req.body;

    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.summary = summary ?? issue.summary;
    issue.category = category ?? issue.category;
    if (Array.isArray(suggestions)) {
      issue.suggestions = suggestions;
    }
    issue.status = status ?? issue.status;
    issue.priority = priority ?? issue.priority;
    if (dueDate !== undefined) {
      issue.dueDate = dueDate || null;
    }

    const updated = await issue.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ message: "Issue deleted", _id: issue._id });
  } catch (error) {
    next(error);
  }
};

export const assistIssue = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();

    if (!title && !description) {
      return res.status(400).json({ message: "Add a title or description first" });
    }

    const suggestion = await suggestIssueTriage({ title, description });
    res.json(suggestion);
  } catch (error) {
    if (error instanceof AiAssistError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
