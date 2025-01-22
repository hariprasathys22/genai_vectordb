import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";


class TextToQdrantServices{
    private embedAdapter: EmberAdapter;
    private qdrantAdapter: QdrantAdapter;
    private collectionName: string;

    constructor(
        embedAdapter: EmberAdapter,
        qdrantAdapter: QdrantAdapter,
        collectionName: string
    ){
        this.embedAdapter = embedAdapter;
        this.qdrantAdapter = qdrantAdapter;
        this.collectionName = collectionName;

    }

    /**
   * Adds a text input to Qdrant by generating its embedding and storing it.
   * @param id - Unique ID for the vector.
   * @param text - Text to convert to embeddings.
   * @param payload - Additional metadata to store.
   */
    /**
   * Adds a text input to Qdrant by generating its embedding and storing it.
   * @param embeddingEntity - The TextEmbedding entity containing input data.
   */
    async addText(id: number, text: string, payload?:  Record<string, unknown>): Promise<void> {
        console.log("Received ID:", id);
        console.log("Received Text:", text);
        console.log("Received Payload:", payload);
      
        const embedding = await this.embedAdapter.generateEmbeddings(text);
        console.log("Generated Embedding:", embedding);
        
        // Ensure valid structure for vectors
        const vectors: Array<{ id: number; vector: number[]; payload?: Record<string, unknown> }> = [
            {
              id, // Ensure this is a number
              vector: embedding, // Ensure embedding is an array of numbers
              payload: payload || {}, // Optional payload
            },
          ];
          
      
        console.log("Vector to insert:", JSON.stringify(vectors, null, 2));
      
        await this.qdrantAdapter.insertVectors(this.collectionName, vectors);
      }
      
}

export default TextToQdrantServices