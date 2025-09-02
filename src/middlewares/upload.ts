import multer from "multer";
import path from "path";
import { Request } from "express";

// Get the absolute path to the root of your project
const __dirname = path.resolve();

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Correct the path to be relative to the public directory
    cb(null, path.join(__dirname, "public/uploads/logos"));
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export default upload;
