const Expense = require("../models/Expense");

// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// Create expense
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      date,
      description,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const { title, amount, category, date, description } = req.body;

    expense.title = title ?? expense.title;
    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.date = date ?? expense.date;
    expense.description = description ?? expense.description;

    const updatedExpense = await expense.save();

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update expense",
      error: error.message,
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};