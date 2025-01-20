class TextEmbedding{
    id: number;
    text: string;
    embedding: number[];
    payload?: object;

    constructor(id: number, text: string, embedding: number[], payload?: object){
        this.id = id;
        this.text = text;
        this.embedding = embedding;
        this.payload = payload;
    }
}


export default TextEmbedding;