import axios from "axios";

class LlamaAdapter {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Generate embeddings for a given text input using the locally hosted model.
   * @param text - The text to embed.
   * @returns The embedding as an array of numbers.
   */
  async processQuery(query: string, context: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}v1/chat/completions`, {
        model: "llama3.1:latest",
        messages: [
            {"role": "system", "content": context},
          {
            role: "user",
            content: query
          }
        ],
      });
      return response.data.choices[0]["message"]["content"]
    } catch (e) {
      console.log(e);
      throw new Error("There is a issue finding in db");
    }
  }
}
export default LlamaAdapter;
