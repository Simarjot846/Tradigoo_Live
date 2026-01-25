'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="bg-red-900 text-white p-6 flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                <pre className="bg-black/30 p-4 rounded text-xs mb-6 max-w-full overflow-auto">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                </pre>
                <Button onClick={() => reset()} className="bg-white text-red-900 hover:bg-gray-200">
                    Try again
                </Button>
            </body>
        </html>
    );
}
