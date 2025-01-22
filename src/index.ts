// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import embeddingRoute from './presentation/routes/embeddingRoute'
import queryRoute from './presentation/routes/queryRoute'
import qdrantRoute from './presentation/routes/qdrantRoute'
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;
app.use(cors());
app.use(express.json());

app.use("/api", embeddingRoute)
app.use("/api", queryRoute)
app.use("/api/collection",qdrantRoute)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
