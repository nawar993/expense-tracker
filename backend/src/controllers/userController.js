import { prisma } from "../../prisma/prisma.js"; // رابط Prisma Client للتعامل مع القاعدة
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

export async function createUser(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            firstName, 
            lastName, 
            email, 
            password : hashedPassword,
        },
    });

    const { password: _, ...userData } = user;
    res.status(201).json(userData);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "User creation failed" });
  }
}

// تسجيل الدخول
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!user || !isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({
      id : user.id,
      email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userData } = user;
    res.status(200).json({
      message: "Login successful",
      token,
      user: userData 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "login failed" });
  }
}

// جلب مستخدم واحد بالـ id
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

// جلب كل المستخدمين
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany();
    
    const usersData = users.map(({ password, ...u }) => u);
    res.json(usersData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// جلب المستخدم الحالي
export async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true, 
        budget : true
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

//  Update current user
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: "The email is being used by another user" });
      }
    }

    // بناء object التحديث
    const updateData = {
      firstName,
      lastName,
      email,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (avatar) {
      updateData.avatar = avatar;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    const { password: _, ...userData } = updatedUser;
    res.status(200).json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { budget } = req.body;
    if (budget === undefined) return res.status(400).json({ error: "Budget is required" });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { budget: parseFloat(budget) },
    });

    const { password: _, ...userData } = updatedUser;
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update budget" });
  }
};
