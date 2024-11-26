import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

const fetchMessages = async () => {
    // In a real application, you might want to fetch initial messages from an API
    // For now, we'll return an empty array
    return [];
};

const sendMessage = async (message) => {
    const response = await fetch(
        `/api/chat?question=${encodeURIComponent(message)}`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
        stream: reader,
        decoder: decoder,
    };
};

export function useChat() {
    const queryClient = useQueryClient();
    const [streamingMessage, setStreamingMessage] = useState("");

    const { data: messages = [] } = useQuery({
        queryKey: ["messages"],
        queryFn: fetchMessages,
    });

    const mutation = useMutation({
        mutationFn: sendMessage,
        onMutate: (message) => {
            // Optimistically update the UI
            const userMessage = { role: "user", content: message };
            queryClient.setQueryData(["messages"], (old) => [
                ...old,
                userMessage,
            ]);
            setStreamingMessage("");
        },
        onSuccess: async ({ stream, decoder }) => {
            let accumulatedMessage = "";

            while (true) {
                const { done, value } = await stream.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedMessage += chunk;
                setStreamingMessage(accumulatedMessage);
            }

            // Add the complete assistant message to the messages array
            const assistantMessage = {
                role: "assistant",
                content: accumulatedMessage,
            };
            queryClient.setQueryData(["messages"], (old) => [
                ...old,
                assistantMessage,
            ]);
            setStreamingMessage("");
        },
    });

    const sendChatMessage = useCallback(
        (message) => {
            mutation.mutate(message);
        },
        [mutation]
    );

    // Combine the stored messages with the currently streaming message
    const allMessages = [
        ...messages,
        ...(streamingMessage
            ? [{ role: "assistant", content: streamingMessage }]
            : []),
    ];

    return {
        messages: allMessages,
        sendChatMessage,
        isLoading: mutation.isPending,
    };
}
