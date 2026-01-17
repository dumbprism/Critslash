import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button variant={"ghost"} onClick={toggleTheme} className="relative hover:cursor-pointer">
            <div className="h-8 w-8 rounded-sm scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 bg-black" />
            <div className="absolute h-8 w-8 rounded-sm scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 bg-white" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}