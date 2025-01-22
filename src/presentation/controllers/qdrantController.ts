import { Request, Response } from "express";
import QdrantServices from "../../application/use-cases/QdrantServices";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";
const HOST = process.env.HOST ?? "localhost";
const QDRANT_PORT = Number(process.env.QDRANT_PORT) || 6333;
const qdrantAdapter = new QdrantAdapter(HOST, QDRANT_PORT)
const qdrantControllerServices = new QdrantServices(qdrantAdapter);

export const createCollectionController = async(req: Request, res:Response) =>{
    const {collectionName} = req.body;
    try{
        await qdrantControllerServices.createCollectionService(collectionName);
        res.status(200).send({message: `${collectionName} saved Successfully`})
    }catch(e){
        console.log("Error while saving collection", e);
        throw new Error("Error while saving collection");
    }
 }