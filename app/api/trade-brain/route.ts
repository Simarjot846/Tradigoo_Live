import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;
try {
    if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
} catch (e) {
    console.warn("Could not initialize Gemini SDK:", e);
}

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        // 1. Query Pathway Vector Store (Live Index)
        let liveContext: Array<{ text: string, metadata?: any }> = [];
        try {
            const pathwayRes = await fetch('http://localhost:8080/v1/retrieve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query, k: 3 })
            });
            if (pathwayRes.ok) {
                liveContext = await pathwayRes.json();
            }
        } catch (e: unknown) {
            console.error("Pathway not reachable, using mock context", e);
            // Fallback for UI testing if Pathway is down
            liveContext = [{ text: "Mock Wholesaler - Green Score: 400 - Price: $20" }]
        }

        // 2. Pass real-time context to Gemini for reasoning via new SDK
        const prompt = `
        You are Tradigoo's AI Trade Brain. Based on this LIVE wholesaler data fetched via Pathway Vector Search:
        ${JSON.stringify(liveContext)}
        
        Solve this buyer query prioritizing Green Scores, best pricing, and carbon saved. Output exactly 1-2 concise sentences, no markdown formatting. Query: "${query}"
        `;

        let aiResponseText = "";
        try {
            if (ai) {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                aiResponseText = response.text || "I found some great sustainable matches for you.";
            } else {
                throw new Error("Gemini SDK not initialized");
            }
        } catch (geminiError: unknown) {
            console.error("Gemini context logic error (using rule-based fallback):", geminiError);
            // Fallback for Hackathon Presentation if API key is unconfigured
            aiResponseText = `Based on Pathway RAG, ${liveContext[0]?.metadata?.product_name || 'Sustainable Goods'} from ${liveContext[0]?.metadata?.region || 'your region'} is the best choice to maximize CO2 savings.`;
        }

        return NextResponse.json({
            recommendation: aiResponseText,
            matches: liveContext
        });
    } catch (error) {
        console.error("Trade Brain Error:", error);
        return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
    }
}
