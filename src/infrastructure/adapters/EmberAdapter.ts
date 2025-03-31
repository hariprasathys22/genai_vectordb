import axios from "axios";

class EmberAdapter {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Generate embeddings for a given text input using the locally hosted model.
   * @param text - The text to embed.
   * @returns The embedding as an array of numbers.
   */

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
        const response = await axios.post(
            `${this.apiUrl}api/embeddings`,{
                "model": "nomic-embed-text",
                "prompt": text
            }
        )
      
        
        return response.data.embedding
    } catch (e) {
      console.log(e);
      throw new Error("There is a issue generating embedding");
    }
  }
}

export default EmberAdapter;