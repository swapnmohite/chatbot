import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function CodeBlock({ code }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-1 rounded-lg my-2">
            <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800">
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none transition-transform transform active:scale-110 active:animate-pulse">
                    <Copy className="w-5 h-5" />
                </button>
                <SyntaxHighlighter
                    className="font-serif scrollbar-hide overflow-visible"
                    language="javascript"
                    style={vscDarkPlus}
                    customStyle={{
                        padding: "1rem",
                        fontSize: "0.875rem",
                        backgroundColor: "transparent",
                    }}>
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}

export const Copy = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-copy">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);
