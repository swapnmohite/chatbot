import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import { Copy } from "./Chat"; // Assuming we move the Copy component to a shared locat

export default function CodeArtifact({ code, language }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-between items-center p-2 bg-gray-700">
                <span className="text-sm text-gray-300">{language}</span>
                <button
                    onClick={handleCopy}
                    className="p-1 bg-gray-600 text-white rounded hover:bg-gray-500 focus:outline-none transition-transform transform active:scale-110">
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                }}>
                {code}
            </SyntaxHighlighter>
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
