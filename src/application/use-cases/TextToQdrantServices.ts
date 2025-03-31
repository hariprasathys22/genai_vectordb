import EmberAdapter from "../../infrastructure/adapters/EmberAdapter";
import QdrantAdapter from "../../infrastructure/adapters/QdrantAdapter";
import XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import pdf from "pdf-parse";
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
    id: string,
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
  /**
   * Process an Excel file buffer and return the JSON data.
   * @param buffer - The file buffer from multer.
   * @returns An array of JSON objects representing the first sheet.
   */
  async processExcelBuffer(buffer: Buffer): Promise<any[]> {
    const workBook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workBook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
    return jsonData;
  }
  /**
   * Processes the Excel file buffer, uploads each record to Qdrant by embedding its payload,
   * and returns the converted JSON.
   * @param buffer - The file buffer.
   * @returns The original JSON data.
   */
  async processAndUploadExcelBuffer(buffer: Buffer): Promise<any[]> {
    const jsonData = await this.processExcelBuffer(buffer);
    for (const row of jsonData) {
      const uniqueId = uuidv4();
      const payload = row;
      const textToEmbed = JSON.stringify(row);
      console.log("Payload to embed:", textToEmbed);

      await this.addText(uniqueId, textToEmbed, payload);
    }
    return jsonData;
  }
 
/**
 * Extracts text for each page from the PDF file buffer.
 * @param buffer - The PDF file buffer.
 * @returns An array of strings, where each string is the text of one page.
 */
async processPdfBuffer(buffer: Buffer): Promise<string[]> {
  // Array to store each page's text.
  let pages: string[] = [];

  // Create an options object and explicitly type it as any to bypass TS restrictions.
  const options: any = {
    pagerender: async (pageData: any): Promise<string> => {
      // Use pageData.getTextContent() to extract text content from this page.
      const textContent = await pageData.getTextContent();
      // Join all text items into one string.
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      // Save the page text.
      pages.push(pageText);
      // Return the page text.
      return pageText;
    }
  };

  // Process the PDF buffer with the custom options.
  await pdf(buffer, options);

  // Return the array of page texts.
  return pages;
}

/**
 * Processes the PDF file buffer, extracts text from each page,
 * generates embeddings for each page, and uploads each page to Qdrant.
 * @param buffer - The PDF file buffer.
 * @returns An array of page texts that were processed and uploaded.
 */
async processAndUploadPdfBuffer(buffer: Buffer): Promise<string[]> {
  // 1️⃣ Extract pages of text from the PDF.
  const pages = await this.processPdfBuffer(buffer);

  const uploadedPages: string[] = [];
  
  // 2️⃣ Process each page.
  for (let i = 0; i < pages.length; i++) {
    const pageText = pages[i].trim();
    
    // Only proceed if there's text on the page.
    if (pageText.length > 0) {
      // Generate a unique id for this page.
      const uniqueId = uuidv4();
      
      // 3️⃣ Upload the page text using the addText method.
      // The payload includes the page text, a source marker, and the page number.
      await this.addText(uniqueId, pageText, { text: pageText, source: "pdf", page: i + 1 });
      
      uploadedPages.push(pageText);
    }
  }

  // 4️⃣ Return the array of processed page texts.
  return uploadedPages;
}

}

export default TextToQdrantServices;
