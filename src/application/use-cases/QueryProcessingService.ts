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
  
    // 2️⃣ Search the entire collection (NOT filtered by chatId)
    console.log("Searching Qdrant for relevant information...");
    const searchResults = await this.qdrantAdapter.search(
      this.collectionname,
      queryEmbedding,
      15 // Search for the top 3 similar entries
    );
    console.log("Qdrant Search Results:", searchResults);
  
    // Filter out results with payload types "query" or "response"
    const filteredResults = searchResults.filter(
      (hit: any) =>
        hit.payload?.type !== "query" && hit.payload?.type !== "response"
    );
    console.log("Filtered Results:", filteredResults);
  
    // 🔹 Build the context from filtered results (using a score threshold and taking up to 5 entries)
    const context = filteredResults
      .filter((hit: any) => hit.score > 0.4)
      .slice(0, 15)
      .map((hit: any) => JSON.stringify(hit.payload))
      .join("\n\n");
    console.log("Context for Llama:", context);
  
    // 3️⃣ Define a system prompt that instructs Llama to use only provided context.
    // If no context is available, it should respond with a message stating that no relevant information exists.
    const systemPrompt =
      "System: You are an assistant that relies solely on the provided context. Do not search anywhere else. If no relevant context is provided, respond with 'No relevant information available'. Analyze the context and make a sentence and reply for the given question alone. Do not use any other information. dont output the content inside <think> tag";
  
    // 4️⃣ Combine the system prompt with the original query.
    const combinedQuery = `${systemPrompt}\n\nUser Query: ${query}`;
  
    // 5️⃣ Process the combined query along with the context using Llama.
    let llamaResponse = await this.llamaAdapter.processQuery(combinedQuery, context);
    console.log("Original Llama Response:", llamaResponse);
  
    // 🔹 Extract the internal thought from the response (i.e., the text between <think> and </think> tags)
    const thinkRegex = /<think>([\s\S]*?)<\/think>/;
    const match = llamaResponse.match(thinkRegex);
  
    let internalThought = "";
    let publicResponse = llamaResponse;
    if (match) {
      internalThought = match[1].trim();
      // Remove the <think> block from the response to create the public response
      publicResponse = llamaResponse.replace(thinkRegex, "").trim();
    }
    console.log("Internal Thought Process:", internalThought);
    console.log("Public Response:", publicResponse);
  
    // 6️⃣ Convert the public response into an embedding
    const responseEmbedding = await this.embedAdatper.generateEmbeddings(publicResponse);
  
    // 7️⃣ Generate unique IDs for the query & response
    const queryId = uuidv4();
    const responseId = uuidv4();
  
    // 8️⃣ Store the original query in Qdrant (without the system prompt)
    await this.qdrantAdapter.insertVectors("queryResponse", [
      {
        id: queryId,
        vector: queryEmbedding,
        payload: {
          chatId, // Store chatId but do not filter by it
          type: "query",
          text: query,
          timestamp: new Date().toISOString()
        }
      }
    ]);
    console.log("Stored Query in Qdrant.");
  
    // 9️⃣ Store the public response in Qdrant
    await this.qdrantAdapter.insertVectors("queryResponse", [
      {
        id: responseId,
        vector: responseEmbedding,
        payload: {
          chatId,
          type: "response",
          text: publicResponse,
          timestamp: new Date().toISOString()
        }
      }
    ]);
    console.log("Stored Response in Qdrant.");
  
    // 🔸 Optionally, store the internal thought separately if needed
    if (internalThought) {
      await this.qdrantAdapter.insertVectors("internalThoughts", [
        {
          id: uuidv4(),
          vector: await this.embedAdatper.generateEmbeddings(internalThought),
          payload: {
            chatId,
            type: "internal",
            text: internalThought,
            timestamp: new Date().toISOString()
          }
        }
      ]);
      console.log("Stored Internal Thought in Qdrant.");
    }
  
    // 🔟 Return the public response (without internal thinking) to the user
    return { chatId, response: publicResponse };
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
