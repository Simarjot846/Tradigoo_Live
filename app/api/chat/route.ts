
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { retrieveDocuments, formatContext } from '@/lib/rag';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // Gemini requires history to start with a 'user' role.
        let validHistory = history || [];
        if (validHistory.length > 0 && (validHistory[0].role === 'model' || validHistory[0].role === 'assistant')) {
            validHistory = validHistory.slice(1);
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                reply: "I am currently running in demo mode because my AI Brain (GEMINI_API_KEY) is missing. Please add the API key to your .env.local file to unlock my full potential! 🧠✨"
            });
        }

        // 1. RAG Retrieval - Get relevant documents
        const retrievedDocs = await retrieveDocuments(message, 3);
        const context = formatContext(retrievedDocs);

        // 2. Construct Grounded System Prompt
        const systemPrompt = `You are an AI assistant for Tradigoo. Only answer using the provided context. If the answer is not in context, say 'Information not available in records.'

Context:
${context}`;

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });

        // 3. Send enriched prompt
        const fullMessage = `User: ${message}`;

        // We use the system prompt as the first message or instruction
        // For Gemini 1.5+, instruction is better set via systemInstruction in getGenerativeModel
        // But to keep it simple and consistent with existing structure:
        const enrichedPrompt = `${systemPrompt}\n\n${fullMessage}`;

        const result = await chat.sendMessage(enrichedPrompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error('RAG Chat API Error:', error.message || error);

        return NextResponse.json({
            reply: `System Error: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
