import React, { useState, useRef, useEffect } from "react";
import { Copy, Check, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const CodeBlock = ({
    code,
    language = "javascript",
    showLineNumbers = true,
    className = "",
    isMinimized = false,
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
    }, [showPreview, code, language]);

    const handleCopy = () => {
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
            <div className="flex justify-between items-center p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="mr-2">
                    {isMinimized ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronUp className="h-4 w-4" />
                    )}
                </Button>
                <div className="flex gap-2">
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
                                    onClick={handleCopy}>
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
            </div>
            {!isMinimized && (
                <>
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

export default CodeBlock;
