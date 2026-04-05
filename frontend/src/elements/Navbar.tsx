import { ModeToggle } from '@/components/mode-toggle'

function Navbar() {
    return (
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex gap-2 items-center">
                <img src="logo.svg" alt="Critslash Logo" className="w-7 h-7 md:w-8 md:h-8" />
                <a href="/" className="text-xl md:text-3xl">Critslash</a>
            </div>
            <ModeToggle />
        </div>
    )
}

export default Navbar
