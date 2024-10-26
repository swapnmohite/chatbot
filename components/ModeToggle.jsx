'use client'
const { TooltipTrigger } = require("@radix-ui/react-tooltip");
const { Tooltip } = require("@radix-ui/react-tooltip");
const { TooltipProvider } = require("@radix-ui/react-tooltip");
const { Button } = require("./ui/button");
const { Sun } = require("lucide-react");
const { Moon } = require("lucide-react");
const { TooltipContent } = require("@radix-ui/react-tooltip");

const ModeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="relative">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle theme</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};