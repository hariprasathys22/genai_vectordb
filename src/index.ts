// src/index.ts
import express from "express";
import dotenv from "dotenv";
import embeddingRoute from "./presentation/routes/embeddingRoute";
import QdrantAdapter from "./infrastructure/adapters/QdrantAdapter";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT ?? 5000;
// const HOST = process.env.HOST ?? "localhost";
// const QDRANT_PORT = Number(process.env.QDRANT_PORT) || 6333;
// const qdrantAdapter = new QdrantAdapter(
//   HOST, QDRANT_PORT
// );
// qdrantAdapter.createCollection("Text_management", 1000);

app.use("/api", embeddingRoute);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
