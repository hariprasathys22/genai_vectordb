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

export const listAllCollectionsController = async(req: Request, res: Response) => {
    try{
       const result =  await qdrantControllerServices.listAllCollectionsService();
        res.status(200).send({message: "Collections listed successfully", result});
    }catch(e){
        console.log("Error while listing collections", e);
        throw new Error("Error while listing collections");
    }
}

export const listACollectionController = async(req: Request, res: Response) => {
    try{
        const collectionName = req.params.collectionName;
        const result = await qdrantControllerServices.listACollectionService(collectionName);
        res.status(200).send({message: "Collection listed successfully", result});
    }
    catch(e){
        console.log("Error while listing collection", e);
        throw new Error("Error while listing collection");
    }
}
export const retrieveAllVectors = async(req: Request, res: Response) => {
    try{
        const collectionName = req.params.collectionName;
        const result = await qdrantControllerServices.getAllVectors(collectionName);
        res.status(200).send({message: "Vectors retrieved successfully", result});
    }catch(e){
        console.log("Error while retrieving vectors", e);
        throw new Error("Error while retrieving vectors");
    }
}
export const retrieveSingleVectorController = async(req: Request, res: Response) => {
    try{
        const collectionName =  req.params.collectionName;
        const vectorId = req.params.vectorId;
        const result = await qdrantControllerServices.getAVector(collectionName, vectorId)
        res.status(200).send({message: "Vector retrieved successfully", result});
    }
    catch(e){
        console.log("Error while retrieving single vector", e);
        throw new Error("Error while retrieving single vector");
    }
}