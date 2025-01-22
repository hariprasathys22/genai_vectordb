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
  async createCollection(collectionName: string): Promise<void> {
    await this.client.createCollection(collectionName, {
      vectors: {
        size: 768,
        distance: "Cosine"
      }
    });
    console.log(`Collection '${collectionName}' created successfully.`);
  }

  /**
   * List all collections in Qdrant.
   * @returns List of collections.
   * */

  async listAllCollections(): Promise<any> {
    const result = await this.client.getCollections();
    return result.collections;
  }
  /**
   * List a collection in Qdrant.
   * @param collectionName - Name of the collection.
   * @returns Collection details.
   */
  async listCollection(collectionName: string): Promise<any> {
    const result = await this.client.getCollection(collectionName);
    return result;
  }

  /**
   * Insert vectors into a collection.
   * @param collectionName - Name of the collection.
   * @param vectors - Array of objects with id, vector, and optional payload.
   */

  async insertVectors(
    collectionName: string,
    vectors: Array<{
      id: string;
      vector: number[];
      payload?: Record<string, unknown>;
    }>
  ): Promise<void> {
    console.log("Vectors being inserted:", JSON.stringify(vectors, null, 2));
    try {
      vectors.forEach((point) => {
        if (typeof point.id !== "string") {
          throw new Error(`Invalid vector: Missing or invalid 'id' field.`);
        }
        if (!Array.isArray(point.vector)) {
          throw new Error(`Invalid vector: Missing or invalid 'vector' field.`);
        }
      });

      // Upsert points into Qdrant
      await this.client.upsert(collectionName, { points: vectors });
      console.log(
        `Inserted ${vectors.length} vectors into '${collectionName}'.`
      );
    } catch (error) {
      console.error("Error inserting vectors into Qdrant:", error);
      throw error;
    }
  }

  /**
   * Search for similar vectors in a collection.
   * @param collectionName - Name of the collection.
   * @param queryVector - Vector to search for.
   * @param limit - Number of results to return.
   */

  async search(
    collectionName: string,
    queryVector: number[],
    limit: number = 10
  ): Promise<any> {
    const result = await this.client.search(collectionName, {
      vector: queryVector,
      limit: limit
    });
    return result;
  }
  /**
   * Delete a collection.
   * @param collectionName - Name of the collection to delete.
   */
  async deleteCollection(collectionName: string): Promise<void> {
    await this.client.deleteCollection(collectionName);
    console.log(`Collection '${collectionName}' deleted successfully.`);
  }

  /**
   * Retrieve all vector points from a collection.
   * @param collectionName - Name of the collection.
   * @returns All vector points in the collection.
   */
  async retrieveVectorPoints(collectionName: string): Promise<any>{
    const result = await this.client.scroll(collectionName);
    return result;
  }

  async retrieveSinglePoint(collectionName: string, id: string): Promise<any>{
    const result = await this.client.retrieve(collectionName, { ids: [id] });
    return result;
  }


}
export default QdrantAdapter;
