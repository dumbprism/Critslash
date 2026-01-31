import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./elements/Navbar"

function Roast() {
    const location = useLocation()
    const [roast, setRoast] = useState<string>("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const roastData = location.state?.roast
        const errorData = location.state?.error

        if (errorData) {
            setError(errorData)
        } else if (roastData) {
            setRoast(roastData.roast || JSON.stringify(roastData))
        }
    }, [location.state])
    return (
        <>
            <ThemeProvider defaultTheme="dark">
                <Navbar />
            </ThemeProvider>

            <div className="roast-container p-8">
                {error && <p className="text-red-500">{error}</p>}
                {roast && <div className="roast-content">{roast}</div>}
            </div>
        </>
    )
}

export default Roast