import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import LlamaAdapter from "../../infrastructure/adapters/LlamaAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";
import { v4 as uuidv4 } from "uuid";

class QueryProcessingService {
  private llamaAdapter: LlamaAdapter;
  private qdrantAdapter: QdrantAdapter;
  private collectionname: string;
  private embedAdatper: EmberAdapter;

  constructor(
    llamaAdapter: LlamaAdapter,
    qdrantAdapter: QdrantAdapter,
    collectionname: string,
    embedAdapter: EmberAdapter
  ) {
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

  async processingQueryAndSearch(query: string, chatId?: string): Promise<any> {
    console.log("Received Query:", query);

    if (!chatId) {
      chatId = uuidv4();
      console.log("New Chat Created: ", chatId);
    } else {
      console.log("Using Existing Chat: ", chatId);
    }

    // 1️⃣ Convert query into an embedding
    const queryEmbedding = await this.embedAdatper.generateEmbeddings(query);
    console.log("Generated Query Embedding:", queryEmbedding);

    // 2️⃣ Search the entire collection (NOT filtered by chatId)
    console.log("Searching Qdrant for relevant information...");
    const searchResults = await this.qdrantAdapter.search(
      this.collectionname,
      queryEmbedding,
      3 // Search for the top 3 similar entries
    );
    console.log("Qdrant Search Results:", searchResults);
    const filteredResults = searchResults.filter(
      (hit: any) =>
        hit.payload?.type !== "query" && hit.payload?.type !== "response"
    );
    // 🔹 Pass context from Qdrant search results to Llama
    const context = filteredResults
      .filter(
        (hit: any) =>
          "text" in hit.payload &&
          hit.score > 0.75 &&
          hit.payload?.type !== "query"
      )
      .slice(0, 3) // ✅ Limit to 3 best matches
      .map((hit: any) => hit.payload.text)
      .join("\n\n"); // ✅ Better formatting

    console.log("Context for Llama:", context);

    const llamaResponse = await this.llamaAdapter.processQuery(query, context);
    console.log("Llama Response:", llamaResponse);

    // 5️⃣ Convert response into an embedding
    const responseEmbedding = await this.embedAdatper.generateEmbeddings(
      llamaResponse
    );
    console.log("Generated Response Embedding:", responseEmbedding);

    // 6️⃣ Generate unique IDs for query & response
    const queryId = uuidv4();
    const responseId = uuidv4();

    // 7️⃣ Store the **query** in Qdrant (without chatId filtering)
    await this.qdrantAdapter.insertVectors("queryResponse", [
      {
        id: queryId,
        vector: queryEmbedding,
        payload: {
          chatId, // ✅ Store chatId but NOT filter by it
          type: "query",
          text: query,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
    console.log("Stored Query in Qdrant.");

    // 8️⃣ Store the **response** in Qdrant
    await this.qdrantAdapter.insertVectors("queryResponse", [
      {
        id: responseId,
        vector: responseEmbedding,
        payload: {
          chatId,
          type: "response",
          text: llamaResponse,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
    console.log("Stored Response in Qdrant.");

    // 9️⃣ Return the new response
    return { chatId, response: llamaResponse };
  }

  async CreateChat(
    chatId: string,
    chatName: string,
    collectionName: string
  ): Promise<any> {
    const chatEmbedding = await this.embedAdatper.generateEmbeddings(chatName);
    const chat = await this.qdrantAdapter.insertVectors(collectionName, [
      {
        id: chatId,
        vector: chatEmbedding,
        payload: {
          chatId,
          chatName,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
    return { chat };
  }
}

export default QueryProcessingService;
