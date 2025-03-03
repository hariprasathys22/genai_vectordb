import {Request, Response} from "express";
import LlamaAdapter from "../../infrastructure/adapters/LlamaAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";
import QueryProcessingService from "../../application/use-cases/QueryProcessingService";
import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import { v4 as uuidv4 } from 'uuid';

const TRANSFORMER_URL =
  process.env.TRANSFORMER_URL ?? "http://localhost:11434/";
const HOST = process.env.HOST ?? "localhost";
const QDRANT_PORT = Number(process.env.QDRANT_PORT) || 6333;
const emberAdapter = new EmberAdapter(TRANSFORMER_URL);
const llamaAdapter = new LlamaAdapter(TRANSFORMER_URL);
const qdrantAdapter = new QdrantAdapter(HOST, QDRANT_PORT);



export const QueryController = async(req: Request, res: Response) =>{
    const collectionName = req.params.collectionName;
    const queryProcessing = new QueryProcessingService(llamaAdapter, qdrantAdapter, collectionName, emberAdapter);
    const {query, chatId } = req.body;
    try{
        const results = await queryProcessing.processingQueryAndSearch(query, chatId);
        res.status(200).send({ chatId: results.chatId, response: results.response });
    }catch(e){
        console.log("there is a error while storing in db", e);
        throw new Error("Something went wrong");
    }
}
export const chatHistoryController = async(req: Request, res: Response) => {
    const collectionName = "chatHistory";
    const queryProcessing = new QueryProcessingService(llamaAdapter, qdrantAdapter, collectionName, emberAdapter);
    const chatId = uuidv4();
    const { chatName } = req.body;
    try{
        const results = await queryProcessing.CreateChat(chatId,chatName, collectionName);
        res.status(200).send({ chatId: results.chatId, response: results.chatName,  });
    }catch(e){
        console.log("there is a error while storing in db", e);
        throw new Error("Something went wrong");
    }
}

