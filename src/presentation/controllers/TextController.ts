import { Request, Response } from "express";
import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";
import TextToQdrantServices from "../../application/use-cases/TextToQdrantServices";
import TextEmbedding from "../../domain/entities/TextEmbedding";
import { uuidGenerate } from "../../utilities/uuidGenerate";

const TRANSFORMER_URL =
  process.env.TRANSFORMER_URL ?? "http://localhost:11434/";
const HOST = process.env.HOST ?? "localhost";
const QDRANT_PORT = Number(process.env.QDRANT_PORT) || 6333;
const embedAdapter = new EmberAdapter(TRANSFORMER_URL);
const qdrantAdapter = new QdrantAdapter(HOST, QDRANT_PORT);


export const TextEmbeddingController = async (req: Request, res: Response) => {
  const collectionName = req.params.collectionName;
  const textToQdrantServices = new TextToQdrantServices(
    embedAdapter,
    qdrantAdapter,
    collectionName
  );
  const { text, payload } = req.body;
  let content_id = uuidGenerate();
  payload["id"] = content_id;
  payload["text"] = text;
  try {
    await textToQdrantServices.addText(content_id, text, payload);
    res.status(200).send({ message: `Text "${text} added successfully` });
  } catch (e) {
    console.log("there is a error while storing in db", e);
    throw new Error("Something went wrong");
  }
};
interface MulterRequest extends Request {
  file: Express.Multer.File;
}
export const ExcelEmbeddingController = async (req: Request, res: Response) => {
  const collectionName = req.params.collectionName;
  const multerReq = req as MulterRequest;
  const file = multerReq.file;
    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }
  const textToQdrantServices = new TextToQdrantServices(
    embedAdapter,
    qdrantAdapter,
    collectionName
  );
  const uploadExcelService = await textToQdrantServices.processExcelBuffer(file.buffer);
  res.status(200).send({ message: "Excel file uploaded successfully", data:  uploadExcelService})

}
