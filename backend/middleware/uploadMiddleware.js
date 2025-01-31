import multer from "multer";

/**
 * Configures storage options for file uploads using multer.
 * - `destination`: Specifies the upload directory ('uploads/').
 * - `filename`: Names the uploaded file with a timestamp prefix to avoid overwriting.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";

    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("✅ Created 'uploads/' directory in middleware");
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    console.log("Generated filename:", fileName);
    cb(null, fileName);
  },
});

/**
 * File filter to validate uploaded file types.
 * - Allows only plain text files (`.txt`).
 * - Rejects invalid file types with an appropriate error.
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["text/plain"]; // List of acceptable MIME types
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only TXT files are allowed.")); // reject the file
  }
};

/**
 * Middleware for handling file uploads.
 * - Uses multer for handling multipart form data.
 * - Configured with storage options and file filtering.
 */
export const upload = multer({ storage, fileFilter });
