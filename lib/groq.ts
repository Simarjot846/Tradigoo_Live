export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GroqChatOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    timeoutMs?: number;
}

/**
 * Groq OpenAI-Compatible Chat Completion Helper
 * Primary Model: llama-3.3-70b-versatile (high quality reasoning, 128k context, ~250-300 tokens/s)
 * Fallback Model: llama-3.1-8b-instant (ultra-low latency, ~800 tokens/s)
 */
export async function generateGroqCompletion(
    messages: GroqMessage[],
    options: GroqChatOptions = {}
): Promise<{ text: string; modelUsed: string }> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        const err: any = new Error('GROQ_API_KEY is not configured');
        err.code = 'GROQ_API_KEY_MISSING';
        throw err;
    }

    const primaryModel = options.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const fallbackModel = 'llama-3.1-8b-instant';
    const timeoutMs = options.timeoutMs || 12000;

    const callApi = async (modelName: string) => {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages,
                temperature: options.temperature ?? 0.2,
                max_tokens: options.max_tokens ?? 1024,
            }),
            signal: AbortSignal.timeout(timeoutMs),
        });

        if (response.status === 429) {
            const errData = await response.json().catch(() => ({}));
            const err: any = new Error(errData?.error?.message || 'Rate limit exceeded on Groq API');
            err.status = 429;
            throw err;
        }

        if (response.status === 401) {
            const errData = await response.json().catch(() => ({}));
            const err: any = new Error(errData?.error?.message || 'Invalid Groq API Key');
            err.status = 401;
            throw err;
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const err: any = new Error(errData?.error?.message || `Groq API error HTTP ${response.status}`);
            err.status = response.status;
            throw err;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('Groq returned empty completion content');
        }

        return { text: content.trim(), modelUsed: modelName };
    };

    try {
        return await callApi(primaryModel);
    } catch (err: any) {
        // If 70B model is temporarily rate-limited, automatically fall back to 8B instant model
        if (err.status === 429 && primaryModel !== fallbackModel) {
            console.warn(`Groq ${primaryModel} 429 rate limit hit. Retrying with ${fallbackModel}...`);
            return await callApi(fallbackModel);
        }
        throw err;
    }
}
