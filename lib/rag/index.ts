
import fs from 'fs';
import path from 'path';

export interface RagDocument {
    content: string;
    source: string;
    score?: number;
}

/**
 * In a production environment, this would call an embedding API (like Gemini Embedding or OpenAI)
 * For this implementation, we use a simple keyword-based scoring mechanism to simulate retrieval.
 */
export async function embedQuery(query: string): Promise<number[]> {
    // This is a placeholder for actual embedding logic.
    // In a real RAG setup, this would return a vector.
    return [0];
}

/**
 * Retrieves relevant documents from the local knowledge base.
 */
export async function retrieveDocuments(query: string, k: number = 3): Promise<RagDocument[]> {
    const dataDir = path.join(process.cwd(), 'lib', 'rag', 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.txt'));

    const documents: RagDocument[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Simulating chunking by splitting on sections (--- or headers)
        const chunks = content.split(/---|\n#{1,3}\s/).filter(c => c.trim().length > 20);

        for (const chunk of chunks) {
            let score = 0;
            const chunkLower = chunk.toLowerCase();

            // Simple keyword overlap scoring
            for (const term of queryTerms) {
                if (chunkLower.includes(term)) {
                    score += 1;
                }
            }

            if (score > 0) {
                documents.push({
                    content: chunk.trim(),
                    source: file,
                    score: score
                });
            }
        }
    }

    // Sort by score and return top-k
    return documents
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, k);
}

/**
 * Formats the retrieved documents into a structured context string.
 */
export function formatContext(documents: RagDocument[]): string {
    if (documents.length === 0) {
        return "No relevant records found in the knowledge base.";
    }

    return documents
        .map((doc, i) => `[Source: ${doc.source}]\n${doc.content}`)
        .join('\n\n---\n\n');
}
