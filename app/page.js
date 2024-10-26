"use client";

import React, { useState, useRef, useEffect } from "react";
import {Send, X, Copy, Check, ExternalLink, Eye} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const CodeBlock = ({
    code,
    language = "javascript",
    showLineNumbers = true,
    className = "",
    isMinimized = true,
    onToggle,
}) => {
    const [copied, setCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const codeRef = useRef(null);
    const isHTML =
        language === "html" ||
        (code.trim().startsWith("<") && code.trim().endsWith(">"));

    useEffect(() => {
        if (codeRef.current && !showPreview) {
            hljs.configure({
                ignoreUnescapedHTML: true,
                languages: [
                    "javascript",
                    "html",
                    "css",
                    "python",
                    "java",
                    "xml",
                ],
            });
            hljs.highlightElement(codeRef.current);
        }
    }, [showPreview]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn(
                "relative mt-2 rounded-lg overflow-hidden",
                "border border-zinc-200 dark:border-zinc-800",
                className
            )}>
            {!isMinimized && (
                <>
                    <div className="flex justify-end gap-2 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        {isHTML && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setShowPreview(!showPreview)
                                            }>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {showPreview
                                                ? "Show Code"
                                                : "Show Preview"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={copyToClipboard}>
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{copied ? "Copied!" : "Copy code"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    {showPreview && isHTML ? (
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                            <div
                                dangerouslySetInnerHTML={{ __html: code }}
                                className="preview-container"
                            />
                        </div>
                    ) : (
                        <pre
                            className={cn(
                                "p-4 overflow-x-auto",
                                "text-sm font-mono"
                            )}>
                            <code
                                ref={codeRef}
                                className={`language-${language}`}>
                                {code}
                            </code>
                        </pre>
                    )}
                </>
            )}
        </div>
    );
};

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [codeArtifact, setCodeArtifact] = useState(null);
    const [artifactLanguage, setArtifactLanguage] = useState("javascript");
    const [isArtifactOpen, setIsArtifactOpen] = useState(false);
    const [isArtifactMinimized, setIsArtifactMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        hljs.highlightAll();
    }, [codeArtifact]);

    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

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

            const assistantMessage = { role: "assistant", content: "" };
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

                const codeMatch = assistantMessage.content.match(
                    /```(\w*)\n([\s\S]*?)```/
                );
                if (codeMatch && !codeArtifact) {
                    const [, lang, code] = codeMatch;
                    setArtifactLanguage(lang || detectLanguage(code));
                    setCodeArtifact(code.trim());
                    setIsArtifactOpen(true);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
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
                                isMinimized={true}
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
                                    setIsArtifactMinimized(false);
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
        <div className="flex flex-col bg-background">
            <div
                className={cn(
                    "flex flex-1 transition-all duration-300 ease-in-out",
                    isArtifactOpen ? "w-full" : "w-full max-w-3xl mx-auto"
                )}>
                <div
                    className={cn(
                        "flex flex-col w-full",
                        isArtifactOpen ? "max-w-[50%]" : "max-w-full"
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
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 border-t">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1"
                                placeholder="Type your message..."
                                disabled={isLoading}
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}>
                                            <Send className="h-4 w-4" />
                                            <span className="sr-only">
                                                Send message
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Send message</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </form>
                </div>
                {isArtifactOpen && (
                    <div className="w-[50%] border-l flex flex-col">
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