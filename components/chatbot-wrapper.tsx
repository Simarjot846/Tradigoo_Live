"use client";

import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/chatbot").then((mod) => mod.Chatbot), {
    ssr: false,
    loading: () => null,
});

export function ChatbotWrapper() {
    return <Chatbot />;
}
