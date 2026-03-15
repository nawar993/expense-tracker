import { prisma } from "../../prisma/prisma.js";

export const createExpense = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Invalid or missing token " });
    }

    const { title, amount, categoryId, date } = req.body;

    if (!title || !amount || !categoryId) {
      return res.status(400).json({ error: "Fields are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "The amount must be greater than zero." });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        categoryId: Number(categoryId),
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
      },
      include: { category: true }, // مشان يرجعلي بيانات الفئة ولما اضيف يظهر الاسم بدون تحديث
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating expense" });
  }
};

// جلب مصاريف المستخدم (مع فلترة اختيارية حسب الفئة)
// وتاريخ بداية ونهاية وتحديد حد ادنى واقصى للمبلغ
export const getExpenses = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Invalid or missing token " });
    }

    const { categoryId, from, to, minAmount, maxAmount } = req.query;

    const filters = {
      userId: req.user.id,
    };

    // فلترة حسب الفئة
    if (categoryId && categoryId !== "") {
      filters.categoryId = Number(categoryId);
    }

    // فلترة حسب التاريخ
    if (from || to) {
      filters.date = {};
      if (from) { filters.date.gte = new Date(from); }
      if (to) { filters.date.lte = new Date(to); }
    }

    // فلترة حسب المبلغ
    if (minAmount || maxAmount) {
      filters.amount = {};
      if (minAmount) filters.amount.gte = parseFloat(minAmount);
      if (maxAmount) filters.amount.lte = parseFloat(maxAmount);
    }

    const expenses = await prisma.expense.findMany({
      where: filters,
      orderBy: { date: "desc" },
      include: { category: true },
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching expenses" });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing expense ID" });

    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!expense || expense.userId !== req.user.id) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching expense" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, categoryId, date } = req.body;

    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!expense || expense.userId !== req.user.id) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const updated = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        title: title ?? expense.title,
        amount: amount !== undefined ? parseFloat(amount) : expense.amount,
        categoryId:
          categoryId !== undefined
            ? Number(categoryId)
            : expense.categoryId,
        date: date ? new Date(date) : expense.date,
      },
      include: { category: true }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating expense" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Expense ID is required" });

    const expense = await prisma.expense.findUnique({
      where: { id: Number(id) },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.userId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this expense." });
    }

    await prisma.expense.delete({
      where: { id: Number(id) },
    });

    res.json({ expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting expense" });
  }
};

export const getTotalExpenses = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Invalid or lost token" });
    }

    const total = await prisma.expense.aggregate({
      where: { userId: req.user.id },
      _sum: { amount: true },
    });

    res.json({ total: total._sum.amount || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while calculating the total expenses" });
  }
};

export const getTotalByCategory = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Invalid or lost token" });
    }

    const { from, to } = req.query; 

    // بناء شرط التاريخ إذا موجود
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const totals = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: { 
        userId: req.user.id,
        ...(from || to ? { date: dateFilter } : {}),
      },
      _sum: { amount: true },
    });

   // لإحضار اسم الفئة لكل categoryId
    const result = await Promise.all(
      totals.map(async t => {
        const category = await prisma.category.findUnique({
          where: { id: t.categoryId }
        });
        return {
          categoryId: t.categoryId,
          categoryName: category?.name || null,
          totalAmount: t._sum.amount || 0
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while calculating the total expenses by category." });
  }
};
