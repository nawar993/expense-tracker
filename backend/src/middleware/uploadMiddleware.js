import multer from "multer";
import path from "path";

// إعداد تخزين الصور
const storage = multer.diskStorage({ // حفظ الملف في مجلد على القرص
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
});