"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send } from "lucide-react";

export default function DynamicChatInput({ handleSubmit, input, setInput, isLoading }) {
    return (
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
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="submit" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send message</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Send message</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </form>
    );
}
