// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import embeddingRoute from './presentation/routes/EmbeddingRoute'


const app = express();
const PORT = process.env.PORT ?? 5000;
app.use(express.json());
app.use("/api", embeddingRoute)
dotenv.config();
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
