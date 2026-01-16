import { ModeToggle } from '@/components/mode-toggle'

function Navbar() {
    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex gap-2 items-center">
                <img src="logo.svg" alt="Critslash Logo" />
                <h1 className="text-3xl">Critslash</h1>
            </div>

            <ModeToggle />
        </div>
    )
}

export default Navbar