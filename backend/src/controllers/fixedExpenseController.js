import { prisma } from "../../prisma/prisma.js";

export const createFixedExpense = async (req, res) => {
  try {
    const { name, categoryId, amount, dayOfMonth, duration } = req.body;

    if (!name || !categoryId || !amount || !dayOfMonth || !duration) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        userId: req.user.id,
        name,
        categoryId : Number(categoryId),
        amount: parseFloat(amount),
        dayOfMonth: parseInt(dayOfMonth),
        duration: parseInt(duration),
      },
    });

    res.status(201).json(fixedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create fixed expense" });
  }
};

export const getFixedExpenses = async (req, res) => {
  try {
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: { userId: req.user.id },
      include : {category : true},
      orderBy: { dayOfMonth: "asc" },
    });

    res.json(fixedExpenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fixed expenses" });
  }
};

export const getTotalFixedExpenses = async (req, res) => {
  try {
    const total = await prisma.fixedExpense.aggregate({
      where: { userId: req.user.id },
      _sum: { amount: true },
    });

    res.json({ total: total._sum.amount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate total fixed expenses" });
  }
};

export const updateFixedExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, amount, dayOfMonth, durationMonths } = req.body;

    const duration = parseInt(durationMonths, 10);
    const day = parseInt(dayOfMonth, 10);
    const amt = parseFloat(amount);

    if (!name || !categoryId || isNaN(amt) || isNaN(day) || isNaN(duration)) {
      return res.status(400).json({ error: "All fields are required and must be valid numbers" });
    }

    const updated = await prisma.fixedExpense.update({
      where: { id: parseInt(id) },
      data: {
        name,
        categoryId: Number(categoryId),        
        amount: amt,
        dayOfMonth: day,
        duration: duration,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update fixed expense" });
  }
};

export const deleteFixedExpense = async (req, res) => {
  try {
    const { id } = req.params;

     const fixedExpense = await prisma.fixedExpense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!fixedExpense) {
      return res.status(404).json({ error: "Fixed expense not found" });
    }

    if (fixedExpense.userId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this expense" });
    }

    await prisma.fixedExpense.delete({ 
      where: { id: parseInt(id) } 
    });

    res.json({ message: "Fixed expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete fixed expense" });
  }
};

