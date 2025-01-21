import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";

class TextToQdrantServices {
  private embedAdapter: EmberAdapter;
  private qdrantAdapter: QdrantAdapter;
  private collectionName: string;

  constructor(
    embedAdapter: EmberAdapter,
    qdrantAdapter: QdrantAdapter,
    collectionName: string
  ) {
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
  async addText(
    id: number,
    text: string,
    payload?: Record<string, any>
  ): Promise<void> {
    const embedding = await this.embedAdapter.generateEmbeddings(text);

    await this.qdrantAdapter.insertVectors(this.collectionName, [
      {
        id,
        vector: embedding,
        payload
      }
    ]);
    console.log(`Text "${text} added to collection "${this.collectionName}"`);
  }
}

export default TextToQdrantServices;
