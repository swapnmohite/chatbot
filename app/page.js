// components/Chat.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import CodeBlock from "./codeblock";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/chat?question=${encodeURIComponent(input)}`,
                {
                    method: "GET",
                }
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let assistantMessage = { role: "assistant", content: "" };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                assistantMessage.content += chunk;

                setMessages((prevMessages) => [
                    ...prevMessages.slice(0, -1),
                    { ...assistantMessage },
                ]);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (content) => {
        const parts = content.split(/(```[\s\S]*?```)/);
        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                //remove the first word after the ```

                const code = part.slice(3, -3).trim();
                const codeWithoutFirstWord = code.replace(/^\s*\S+\s*/, "");
                return <CodeBlock key={index} code={codeWithoutFirstWord} />;
            } else {
                return part
                    .split(/(\*\*.*?\*\*|`.*?`|\n)/)
                    .map((subPart, subIndex) => {
                        if (
                            subPart.startsWith("**") &&
                            subPart.endsWith("**")
                        ) {
                            return (
                                <strong key={subIndex}>
                                    {subPart.slice(2, -2)}
                                </strong>
                            );
                        } else if (
                            subPart.startsWith("`") &&
                            subPart.endsWith("`")
                        ) {
                            return (
                                <code
                                    key={subIndex}
                                    className="bg-gray-700 text-white px-1 rounded">
                                    {subPart.slice(1, -1)}
                                </code>
                            );
                        } else if (subPart === "\n") {
                            return <br key={subIndex} />;
                        } else {
                            return subPart;
                        }
                    });
            }
        });
    };
    return (
        <div className="flex justify-center items-center h-screen   bg-zinc-900 ">
            <div className="flex flex-col h-screen  w-3/5 overflow-hidden  ">
                <div className="flex-1 overflow-y-auto p-4 m-1 space-y-4 scrollbar-hide ">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}>
                            <div
                                className={`max-w-2xl p-4 rounded-lg ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-800 text-gray-300"
                                }`}>
                                {renderMessageContent(message.content)}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="p-4  w-full">
                    <div className="flex items-center space-x-2 rounded-lg">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}>
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
