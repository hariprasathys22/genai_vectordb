import { QdrantClient } from "@qdrant/js-client-rest";

class QdrantAdapter {
  private client: QdrantClient;

  constructor(apiHost: string, apiPort: number) {
    this.client = new QdrantClient({
      host: apiHost,
      port: apiPort
    });
  }
  /**
   * Create a collection in Qdrant.
   * @param collectionName - Name of the collection.
   * @param vectorSize - Dimensionality of the vectors.
   */
  async createCollection(
    collectionName: string,
    vectorSize: number
  ): Promise<void> {
    await this.client.createCollection(collectionName, {
      vectors: {
        size: vectorSize,
        distance: "Cosine"
      }
    });
    console.log(`Collection '${collectionName}' created successfully.`);
  }
  /**
   * Insert vectors into a collection.
   * @param collectionName - Name of the collection.
   * @param vectors - Array of objects with id, vector, and optional payload.
   */
  async insertVectors(
    collectionName: string,
    vectors: Array<{ id: number; vector: number[]; payload?: Record<string, unknown> }>
  ): Promise<void> {
    try {
      // Validate data structure
      vectors.forEach((point) => {
        if (typeof point.id !== "number") {
          throw new Error(`Invalid vector: Missing or invalid 'id' field.`);
        }
        if (!Array.isArray(point.vector)) {
          throw new Error(`Invalid vector: Missing or invalid 'vector' field.`);
        }
      });
  
      // Upsert points into Qdrant
      await this.client.upsert(collectionName, { points: vectors });
      console.log(`Inserted ${vectors.length} vectors into '${collectionName}'.`);
    } catch (error) {
      console.error("Error inserting vectors into Qdrant:", error);
      throw error; // Rethrow the error for upstream handling
    }
  }
}
export default QdrantAdapter;
