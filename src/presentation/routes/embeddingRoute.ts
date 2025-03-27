import express from "express";
import { ExcelEmbeddingController, TextEmbeddingController } from "../controllers/TextController";
import multer from "multer";

const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/addEmbedding/:collectionName", TextEmbeddingController)
router.post("/uploadExcel/:collectionName", upload.single("excelFile"), ExcelEmbeddingController)

export default router;