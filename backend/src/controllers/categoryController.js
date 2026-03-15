import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = await prisma.category.create({
        data: { 
            name,
            userId : req.user.id, // ربط بالمستخدم يلي انشأها
        },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
        where : { 
          OR: [
            { userId: null },        // الفئات العامة
            { userId: req.user.id }  // فئات المستخدم
          ] 
        },
        orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export async function updateCategory(req, res) {
  try {
    const { id } = req.params; 
    const { name } = req.body; 

    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (existingCategory.userId !== req.user.id) {
      return res.status(403).json({ error: "You cannot update this category" });
    }

    if (existingCategory.userId === null) {
      return res.status(403).json({ error: "Cannot edit default category" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "حدث خطأ أثناء تعديل الفئة" });
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteExpenses } = req.body; 

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.userId === null) {
      return res.status(403).json({ message: "Cannot delete default category" });
    }

    if (category.userId !== req.user.id) {
      return res.status(403).json({ message: "You cannot delete this category" });
    }

    const expenses = await prisma.expense.findMany({
      where: { 
        categoryId: category.id,
        userId: req.user.id
      }
    });

    const otherCategory = await prisma.category.findFirst({
      where: { name: "Other" },
    });
    if (!otherCategory) return res.status(500).json({ message: "Default 'Other' category not found" });

    if (expenses.length > 0) {
      if (deleteExpenses) {
        await prisma.expense.deleteMany({
          where: { categoryId: category.id },
        });
      } else {
        await prisma.expense.updateMany({
          where: { categoryId: category.id },
          data: { categoryId: otherCategory.id },
        });
      }
    }

    // بعد تحديث/حذف المصاريف، يمكن حذف الفئة
    await prisma.category.delete({
      where: { id: category.id },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};