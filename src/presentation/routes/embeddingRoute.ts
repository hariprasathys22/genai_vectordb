import express from "express";
import { TextEmbeddingController } from "../controllers/TextController";

const router = express.Router()

router.post("/addEmbedding", TextEmbeddingController)

export default router;