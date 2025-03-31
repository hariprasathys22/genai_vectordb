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
  
    // 1️⃣ Convert query into an embedding
    const queryEmbedding = await this.embedAdatper.generateEmbeddings(query);
    // console.log("Generated Query Embedding:", queryEmbedding);
  
    // 2️⃣ Search the entire collection (NOT filtered by chatId)
    console.log("Searching Qdrant for relevant information...");
    const searchResults = await this.qdrantAdapter.search(
      this.collectionname,
      queryEmbedding,
      3 // Search for the top 5 similar entries
    );
    console.log("Qdrant Search Results:", searchResults);
  
    // Filter out results with payload types "query" or "response"
    const filteredResults = searchResults.filter(
      (hit: any) =>
        hit.payload?.type !== "query" && hit.payload?.type !== "response"
    );
    console.log("Filtered Results:", filteredResults);
  
    // 🔹 Build the context from filtered results
    const context = filteredResults
      // Adjusted score threshold to 0.7
      .filter((hit: any) => hit.score > 0.4)
      .slice(0, 5)
      .map((hit: any) => JSON.stringify(hit.payload))
      .join("\n\n");
  
    console.log("Context for Llama:", context);
  
    // 3️⃣ Define a system prompt that instructs Llama to use only provided context.
    // If no context is available, it should respond with a message stating that no relevant information exists.
    const systemPrompt = "System: You are an assistant that relies solely on the provided context. Do not search anywhere else. If no relevant context is provided, respond with 'No relevant information available'.";
    
    // 4️⃣ Combine the system prompt with the original query.
    // This combined query is used only for processing with Llama.
    const combinedQuery = `${systemPrompt}\n\nUser Query: ${query}`;
  
    // 5️⃣ Process the combined query along with the context using Llama.
    const llamaResponse = await this.llamaAdapter.processQuery(combinedQuery, context);
    // console.log("Llama Response:", llamaResponse);
  
    // 6️⃣ Convert Llama response into an embedding
    const responseEmbedding = await this.embedAdatper.generateEmbeddings(llamaResponse);
    // console.log("Generated Response Embedding:", responseEmbedding);
  
    // 7️⃣ Generate unique IDs for query & response
    const queryId = uuidv4();
    const responseId = uuidv4();
  
    // 8️⃣ Store the original **query** in Qdrant (without the system prompt)
    await this.qdrantAdapter.insertVectors("queryResponse", [
      {
        id: queryId,
        vector: queryEmbedding,
        payload: {
          chatId, // Store chatId but NOT filter by it
          type: "query",
          text: query,
          timestamp: new Date().toISOString()
        }
      }
    ]);
    console.log("Stored Query in Qdrant.");
  
    // 9️⃣ Store the **response** in Qdrant
    await this.qdrantAdapter.insertVectors("queryResponse", [
      {
        id: responseId,
        vector: responseEmbedding,
        payload: {
          chatId,
          type: "response",
          text: llamaResponse,
          timestamp: new Date().toISOString()
        }
      }
    ]);
    console.log("Stored Response in Qdrant.");
  
    // 10️⃣ Return the new response
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
          timestamp: new Date().toISOString()
        }
      }
    ]);
    return { chat };
  }
}

export default QueryProcessingService;
