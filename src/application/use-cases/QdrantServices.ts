import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";


class QdrantServices {
    private qdrantAdapter: QdrantAdapter;

    constructor(qdrantAdapter: QdrantAdapter) {
        this.qdrantAdapter = qdrantAdapter;
    }

    /**
     * Create a collection in Qdrant.
     * @param collectionName - Name of the collection.
     * @param vectorSize - Dimensionality of the vectors.
     */

    async createCollectionService(collectionName: string):Promise<void>{
        try{
            await this.qdrantAdapter.createCollection(collectionName);
        }catch(e){
            console.log("Error while creating collection", e);
            throw new Error("Error while creating collection");
        }
    }
    async deleteCollectionService(collectionName: string):Promise<void>{
        try{
            await this.qdrantAdapter.deleteCollection(collectionName);
        }
        catch(e){
            console.log("Error while deleting collection", e);
            throw new Error("Error while deleting collection");
        }
    }
    async listAllCollectionsService():Promise<any>{
        try{
            return await this.qdrantAdapter.listAllCollections();
        }catch(e){
            console.log("Error while listing collections", e);
            throw new Error("Error while listing collections");
        }
    }

}

export default QdrantServices;