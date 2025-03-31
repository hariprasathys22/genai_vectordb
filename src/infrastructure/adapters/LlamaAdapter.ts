import axios from "axios";

class LlamaAdapter {
  private apiUrl: string;
  private conversationHistory: { role: string; content: string }[] = [];
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    this.conversationHistory = [];
  }

  /**
   * Generate embeddings for a given text input using the locally hosted model.
   * @param text - The text to embed.
   * @returns The embedding as an array of numbers.
   */
  async processQuery(query: string, context: string = ""): Promise<string> {
    try {
      // 1️⃣ Add query to conversation history
      this.conversationHistory.push({ role: "user", content: query });

      // 2️⃣ Prepare system prompt with retrieved context
      const systemMessage = context
        ? `Here is some relevant information that may help:\n\n${context}\n\nNow answer the following:`
        : "Answer the following:";

      // 3️⃣ Send request to Llama API
      const response = await axios.post(
        `${this.apiUrl}v1/chat/completions`,
        {
          model: "llama3.1:latest",
          messages: [
            { role: "system", content: systemMessage },
            ...this.conversationHistory, // Maintain chat history
          ],
          temperature: 0.9,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 4️⃣ Extract assistant response
      const assistantReply =
        response.data.choices?.[0]?.message?.content ||
        "I couldn't generate a response.";

      // 5️⃣ Add Llama's response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: assistantReply,
      });

      return assistantReply;
    } catch (e) {
      console.error("Error in processQuery:", e);
      throw new Error("There was an issue processing the query with Llama.");
    }
  }
}
export default LlamaAdapter;
