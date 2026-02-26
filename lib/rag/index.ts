
import fs from 'fs';
import path from 'path';

export interface RagDocument {
    content: string;
    source: string;
    score?: number;
}


export async function embedQuery(query: string): Promise<number[]> {

    return [0];
}


export async function retrieveDocuments(query: string, k: number = 3): Promise<RagDocument[]> {
    const dataDir = path.join(process.cwd(), 'lib', 'rag', 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.txt'));

    const documents: RagDocument[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');


        const chunks = content.split(/---|\n#{1,3}\s/).filter(c => c.trim().length > 20);

        for (const chunk of chunks) {
            let score = 0;
            const chunkLower = chunk.toLowerCase();


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


    return documents
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, k);
}


export function formatContext(documents: RagDocument[]): string {
    if (documents.length === 0) {
        return "No relevant records found in the knowledge base.";
    }

    return documents
        .map((doc, i) => `[Source: ${doc.source}]\n${doc.content}`)
        .join('\n\n---\n\n');
}
