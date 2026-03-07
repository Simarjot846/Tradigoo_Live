
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { retrieveDocuments, formatContext } from '@/lib/rag';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();


        // Gemini requires history to start with a 'user' role.
        // We remove the  'model' welcome message if present.
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


        const retrievedDocs = await retrieveDocuments(message, 3);
        const context = formatContext(retrievedDocs);


        const systemPrompt = `You are **Tradigoo AI Assistant**.

Rules:

1. **Answer only using the provided context.**
   If the answer is not in the context, reply: **"Information not available in records."**

2. **Greetings / general messages:**
   If the user says things like **hello, hi, namaste, who are you**, reply normally without needing context.
   Example:
   "Namaste! Main Tradigoo AI Assistant hoon. Main Tradigoo platform se related queries mein help kar sakta hoon."

3. **Tradigoo-related questions:**
   Only answer using the **given context**.
   If context is missing, reply: **"Information not available in records."**

4. **Do not guess or create information. Keep responses short and clear.**

${context}`;


        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });


        const fullMessage = `User: ${message}`;


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
