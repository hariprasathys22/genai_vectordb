import { Request, Response } from "express";
import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";
import TextToQdrantServices from "../../application/use-cases/TextToQdrantServices";
import TextEmbedding from "../../domain/entities/TextEmbedding";

const TRANSFORMER_URL =
  process.env.TRANSFORMER_URL ?? "http://localhost:11434/";
const HOST = process.env.HOST ?? "localhost";
const QDRANT_PORT = Number(process.env.QDRANT_PORT) || 6333;
const embedAdapter = new EmberAdapter(TRANSFORMER_URL);
const qdrantAdapter = new QdrantAdapter(HOST, QDRANT_PORT);
const textToQdrantServices = new TextToQdrantServices(
  embedAdapter,
  qdrantAdapter,
  "Text_management"
);

export const TextEmbeddingController = async (req: Request, res: Response) => {
  const { id, text, payload } = req.body;
  payload["text"] = text;
  try {
    await textToQdrantServices.addText(id, text, payload);
    res.status(200).send({ message: `Text "${text} added successfully` });
  } catch (e) {
    console.log("there is a error while storing in db", e);
    throw new Error("Something went wrong");
  }
};
