"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    X,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const CodeBlock = ({
    code,
    language = "javascript",
    showLineNumbers = true,
    className = "",
    isMinimized = true,
    onToggle,
}) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        hljs.highlightAll();
    }, [code, onToggle]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("relative mt-2 rounded-md border", className)}>
            <div className="flex items-center justify-between px-4 py-2 border-b">
                {/* <Button variant="ghost" size="icon" onClick={onToggle}>
                    {isMinimized ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronUp className="h-4 w-4" />
                    )}
                </Button> */}
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                    {copied ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {!isMinimized && (
                <pre className="p-4 overflow-x-auto">
                    <code className={`language-javascript`}>{code}</code>
                </pre>
            )}
        </div>
    );
};

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [codeArtifact, setCodeArtifact] = useState(null);
    const [isArtifactOpen, setIsArtifactOpen] = useState(false);
    const [isArtifactMinimized, setIsArtifactMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        hljs.highlightAll();
    }, [codeArtifact, setCodeArtifact]);

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

                const codeMatch =
                    assistantMessage.content.match(/```[\s\S]*?```/);
                if (codeMatch && !codeArtifact) {
                    const code = codeMatch[0].slice(3, -3).trim();
                    const codeWithoutFirstWord = code.replace(/^\s*\S+\s*/, "");
                    setCodeArtifact(codeWithoutFirstWord);
                    setIsArtifactOpen(true);
                }
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
            if (part.startsWith("```") || part.endsWith("```")) {
                const code = part.slice(3, -3).trim();
                const codeWithoutFirstWord = code.replace(/^\s*\S+\s*/, "");
                return (
                    <div key={index}>
                        <CodeBlock
                            code={codeWithoutFirstWord}
                            isMinimized={true}
                            onToggle={() => {}}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                                setCodeArtifact(codeWithoutFirstWord);
                                setIsArtifactOpen(true);
                                setIsArtifactMinimized(false);
                            }}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in artifact
                        </Button>
                    </div>
                );
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
                                    className="bg-gray-200 dark:bg-gray-800 px-1 rounded">
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
        <div className="flex justify-center h-screen bg-background">
            <div
                className={cn(
                    "flex transition-all duration-300 ease-in-out",
                    isArtifactOpen ? "w-full" : "w-1/2"
                )}>
                <div
                    className={cn(
                        "flex flex-col",
                        isArtifactOpen ? "w-1/2" : "w-full"
                    )}>
                    <ScrollArea className="flex-1 p-4 space-y-4">
                        {messages.map((message, index) => (
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
                        ))}
                        <div ref={messagesEndRef} />
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1"
                                placeholder="Type your message..."
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
                {isArtifactOpen && (
                    <div className="w-1/2 border-l flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                Code Artifact
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsArtifactOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            {codeArtifact && (
                                <CodeBlock
                                    code={codeArtifact}
                                    showLineNumbers={true}
                                    className="mt-0"
                                    isMinimized={isArtifactMinimized}
                                    onToggle={() =>
                                        setIsArtifactMinimized(
                                            !isArtifactMinimized
                                        )
                                    }
                                />
                            )}
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    );
}
