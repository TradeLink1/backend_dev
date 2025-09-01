// import multer from "multer";

// // Configure storage for products
// const productStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Set the destination folder for product images
//     cb(null, "public/uploads/products");
//   },
//   filename: (req, file, cb) => {
//     // Create a unique filename for the product image
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
//     );
//   },
// });

// // Create a new multer instance for products
// export const productUpload = multer({ storage: productStorage });

import multer from "multer";

const storage = multer.diskStorage({
  destination: "./uploads/products/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const productUpload = multer({ storage });
