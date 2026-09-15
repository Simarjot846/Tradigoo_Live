"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Chatbot = dynamic(() => import("@/components/chatbot").then((mod) => mod.Chatbot), {
    ssr: false,
    loading: () => null,
});

export function ChatbotWrapper() {
    const pathname = usePathname();

    // Do not show floating chatbot on authentication pages to avoid covering login/signup buttons
    if (pathname.startsWith('/auth')) {
        return null;
    }

    return <Chatbot />;
}
