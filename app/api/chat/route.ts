import { NextResponse } from 'next/server';
import { retrieveDocuments, formatContext } from '@/lib/rag';
import { generateGroqCompletion, GroqMessage } from '@/lib/groq';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!message || typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ reply: "Please ask a question about Tradigoo, orders, escrow, or products." }, { status: 400 });
        }

        const userQuery = message.trim();

        // 1. Retrieve Knowledge Base Context
        const retrievedDocs = await retrieveDocuments(userQuery, 4);
        const context = formatContext(retrievedDocs);

        // 2. Structured, Natural System Prompt
        const systemPrompt = `You are **Tradigoo AI Assistant**, the dedicated customer support assistant for the Tradigoo B2B Wholesale Commerce Platform.

YOUR GOAL:
Provide accurate, helpful, and concise answers to retailers and wholesalers using Tradigoo.

CORE PLATFORM KNOWLEDGE:
- **What is Tradigoo:** A B2B wholesale marketplace connecting verified retailers and suppliers across India with escrow payment protection.
- **Escrow System:** Retailer payments are held safely on Tradigoo until goods are delivered (OTP-verified) and inspected. Wholesalers receive payment once the inspection window closes without dispute.
- **Order & Delivery:** Orders are fulfilled with courier tracking and QR-code verification upon pickup and delivery.
- **Dispute Resolution:** If damaged or incorrect goods arrive, retailers can raise a dispute during the inspection period by recording a live unboxing video directly on the platform for AI & manual review.
- **Currency:** Always format prices in Indian Rupees (₹).

INSTRUCTIONS:
1. **Direct Questions & Support:** Answer using the provided Knowledge Base Context. If a question is about platform policies, explain clearly using bullet points where helpful.
2. **General / 'How to use' queries:** Explain the key user flow (Browse Marketplace -> Place Order -> Secure Escrow Payment -> Track Delivery -> OTP Confirmation & Inspection).
3. **Greetings:** If the user just says "hello", "hi", "namaste", or similar greetings, respond warmly and ask what they need help with today.
4. **Unknown Topics:** If the question is completely unrelated to Tradigoo, commerce, or agriculture/products, politely state that you specialize in Tradigoo B2B trading.

KNOWLEDGE BASE CONTEXT:
${context}`;

        // 3. Multi-turn History Assembly
        const groqMessages: GroqMessage[] = [
            { role: 'system', content: systemPrompt },
        ];

        if (Array.isArray(history)) {
            for (const item of history) {
                const text = item.text || item.content || (item.parts && item.parts[0]?.text);
                if (text && typeof text === 'string' && text.trim()) {
                    const role = (item.role === 'model' || item.role === 'assistant') ? 'assistant' : 'user';
                    groqMessages.push({ role, content: text.trim() });
                }
            }
        }

        groqMessages.push({ role: 'user', content: userQuery });

        // 4. Generation via Groq API
        const groqApiKey = process.env.GROQ_API_KEY;

        if (groqApiKey && groqApiKey.trim()) {
            try {
                const { text, modelUsed } = await generateGroqCompletion(groqMessages, {
                    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                    temperature: 0.3,
                    max_tokens: 1024,
                });

                return NextResponse.json({
                    reply: text,
                    provider: 'groq',
                    model: modelUsed,
                    sources: retrievedDocs.map(d => d.source)
                });
            } catch (groqError: any) {
                console.error("Groq API Call Error:", groqError);

                if (groqError.status === 429) {
                    return NextResponse.json({
                        reply: "⏳ I am currently handling high request volume (Groq rate limit reached). Please try asking again in a few seconds!",
                        provider: 'groq',
                        rateLimited: true
                    });
                }

                if (groqError.status === 401) {
                    return NextResponse.json({
                        reply: "⚠️ Groq API key is invalid or unauthorized. Please verify your GROQ_API_KEY in .env.local.",
                        provider: 'groq',
                        error: 'Unauthorized'
                    });
                }

                // Fallback to Gemini if Groq encountered a network error
                if (process.env.GEMINI_API_KEY) {
                    console.warn("Attempting backup generation with Gemini...");
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                    const chat = model.startChat({
                        generationConfig: { maxOutputTokens: 1024 }
                    });
                    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userQuery}`);
                    return NextResponse.json({
                        reply: result.response.text(),
                        provider: 'gemini-fallback',
                        sources: retrievedDocs.map(d => d.source)
                    });
                }

                return NextResponse.json({
                    reply: `Sorry, an error occurred with the AI service: ${groqError.message || 'Service unavailable'}. Please try again.`
                }, { status: 502 });
            }
        }

        // 5. Fallback if GROQ_API_KEY is not configured yet
        if (process.env.GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const chat = model.startChat({
                generationConfig: { maxOutputTokens: 1024 }
            });
            const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userQuery}`);
            return NextResponse.json({
                reply: result.response.text(),
                provider: 'gemini',
                sources: retrievedDocs.map(d => d.source),
            });
        }

        return NextResponse.json({
            reply: "Please configure your GROQ_API_KEY in .env.local to enable real-time Groq AI assistance! ⚡"
        });

    } catch (error: any) {
        console.error('RAG Chat API Error:', error.message || error);
        return NextResponse.json({
            reply: "Something went wrong processing your question. Please try again in a moment."
        }, { status: 500 });
    }
}
