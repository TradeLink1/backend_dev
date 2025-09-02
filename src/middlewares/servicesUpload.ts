import multer from "multer";
import path from "path";

// Define the storage destination and filename for Multer
const storage = multer.diskStorage({
  // Specify the destination directory for uploaded files
  destination: (req, file, cb) => {
    cb(null, "public/uploads/services");
  },
  // Generate a unique filename for each uploaded file
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Create the Multer upload instance
const uploadServiceImages = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  // Filter for image files only
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports images!"));
  },
}).array("serviceImg", 4); // 'serviceImg' is the field name, and '4' is the max number of files

export default uploadServiceImages;
