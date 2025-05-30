import express, { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter to only allow images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Configure upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

// Setup upload routes
export function setupUploadRoutes(app: Express): void {
  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));
  
  // Route for uploading a single file
  app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    const uploadedFile = req.file as Express.Multer.File | undefined;
    
    if (!uploadedFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Return the file path
    const filePath = `/uploads/${uploadedFile.filename}`;
    return res.status(200).json({ url: filePath });
  });
}
