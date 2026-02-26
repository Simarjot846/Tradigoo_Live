import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:8081/global-stats', { next: { revalidate: 0 } });
        if (!res.ok) {
            return NextResponse.json({ error: "Pathway not reachable" }, { status: 500 });
        }

        let data;
        const raw = await res.text();

        // Handle potentially different path formats (JSON list or NDJSON)
        try {
            data = JSON.parse(raw);
        } catch (e) {
            // If it's single object or multiple line delimited JSON
            const lines = raw.trim().split('\n');
            data = [JSON.parse(lines[lines.length - 1])];
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Pathway integration error" }, { status: 500 });
    }
}
