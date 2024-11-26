"use client";

import { useChat } from "@/hooks/useChat";
import { useState, useRef, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CodeBlock from "@/components/CodeBlock";
import dynamic from "next/dynamic";

const DynamicChatInput = dynamic(() => import('@/components/DynamicChatInput'), { ssr: false });

export default function Chat() {
    const { messages, sendChatMessage, isLoading } = useChat();
    const [input, setInput] = useState("");
    const [isArtifactOpen, setIsArtifactOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const [codeArtifact, setCodeArtifact] = useState(null);
    const [artifactLanguage, setArtifactLanguage] = useState("javascript");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setInput("");
        await sendChatMessage(input);
    };

    const detectLanguage = (code) => {
        const trimmedCode = code.trim();
        if (trimmedCode.startsWith("<") && trimmedCode.endsWith(">")) {
            return "html";
        }
        return "javascript";
    };

    const renderMessageContent = (content) => {
        const parts = content.split(/(```(\w*)\n[\s\S]*?```)/);
        return parts.map((part, index) => {
            if (part.startsWith("```")) {
                const match = part.match(/```(\w*)\n([\s\S]*?)```/);
                if (match) {
                    const [, lang, code] = match;
                    const language = lang || detectLanguage(code);
                    return (
                        <div key={index}>
                            <CodeBlock
                                code={code.trim()}
                                language={language}
                                isMinimized={false}
                                onToggle={() => {}}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                    setCodeArtifact(code.trim());
                                    setArtifactLanguage(language);
                                    setIsArtifactOpen(true);
                                }}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open in artifact
                            </Button>
                        </div>
                    );
                }
            }
            return part
                .split(/(\*\*.*?\*\*|`.*?`|\n)/)
                .map((subPart, subIndex) => {
                    if (subPart.startsWith("**") && subPart.endsWith("**")) {
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
                                className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
                                {subPart.slice(1, -1)}
                            </code>
                        );
                    } else if (subPart === "\n") {
                        return <br key={subIndex} />;
                    }
                    return subPart;
                });
        });
    };

    return (
        <div className="flex h-full">
            <div
                className={cn(
                    "flex flex-col transition-all duration-300 ease-in-out",
                    isArtifactOpen ? "w-1/2" : "w-full max-w-3xl mx-auto"
                )}>
                <ScrollArea className="flex-1 p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 dark:text-gray-400">
                                Start a conversation by typing a message below.
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex",
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                )}>
                                <div
                                    className={cn(
                                        "max-w-[80%] p-4 rounded-lg",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}>
                                    {renderMessageContent(message.content)}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </ScrollArea>
                <DynamicChatInput
                    handleSubmit={handleSubmit}
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                />
            </div>
            {isArtifactOpen && (
                <div className="w-1/2 border-l flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold">
                            Code Artifact ({artifactLanguage})
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsArtifactOpen(false)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close artifact</span>
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        {codeArtifact && (
                            <CodeBlock
                                code={codeArtifact}
                                language={artifactLanguage}
                                showLineNumbers={true}
                                className="mt-0"
                                isMinimized={false}
                                onToggle={() => { }}
                            />
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
