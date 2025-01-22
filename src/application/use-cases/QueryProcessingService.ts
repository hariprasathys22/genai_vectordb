import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import LlamaAdapter from "../../infrastructure/adapters/LlamaAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";

class QueryProcessingService{
    private llamaAdapter: LlamaAdapter;
    private qdrantAdapter: QdrantAdapter;
    private collectionname: string;
    private embedAdatper: EmberAdapter;

    constructor(llamaAdapter: LlamaAdapter, qdrantAdapter: QdrantAdapter, collectionname: string, embedAdapter: EmberAdapter){
        this.llamaAdapter = llamaAdapter;
        this.qdrantAdapter = qdrantAdapter;
        this.collectionname = collectionname;
        this.embedAdatper = embedAdapter;
    }

     /**
   * Process a query using Llama and search for results in Qdrant.
   * @param query - The user query.
   * @returns Search results from Qdrant.
   */

    async processingQueryAndSearch(query: string, limit?: number):Promise<any>{
        const embedding = await this.embedAdatper.generateEmbeddings(query);
        
        const results = await this.qdrantAdapter.search(this.collectionname, embedding, limit)

        const context = results.filter((hit: any) => "text" in hit.payload).map((hit: any) => hit.payload.text || "").join(";");

        const response = await this.llamaAdapter.processQuery(query, context);

        return response;
    }
}

export default QueryProcessingService;