import express from "express";
import { ExcelEmbeddingController, PdfEmbeddingController, TextEmbeddingController } from "../controllers/TextController";
import multer from "multer";

const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/addEmbedding/:collectionName", TextEmbeddingController)
router.post("/uploadExcel/:collectionName", upload.single("excelFile"), ExcelEmbeddingController)
router.post("/uploadPdf/:collectionName", upload.single("pdfFile"), PdfEmbeddingController)

export default router;