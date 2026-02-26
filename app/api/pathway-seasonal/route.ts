import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:8081/trending-seasonal', { next: { revalidate: 0 } });
        if (!res.ok) {
            return NextResponse.json({ error: "Pathway not reachable" }, { status: 500 });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Pathway integration error" }, { status: 500 });
    }
}
