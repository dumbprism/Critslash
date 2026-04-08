import { useState, useEffect, useRef } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "./elements/Navbar"
import { MultiStepLoader } from "./components/ui/multi-step-loader"
import { useLocation, useNavigate } from "react-router-dom"

interface Film {
    film_name: string
    rating: string
    film_poster: string
}

interface RoastFmt {
    title: string
    roast: string
    score: number
}

const loadingStates = [
    { text: "Compiling your cinematic crimes..." },
    { text: "Cross-referencing your answers..." },
    { text: "Sharpening the blade..." },
    { text: "Writing your verdict..." },
    { text: "Adding the finishing burns..." },
]

export default function Generating() {
    const location = useLocation()
    const navigate = useNavigate()
    const films = (location.state?.films as Film[]) || []
    const qa    = (location.state?.qa    as { question: string; answer: string }[]) || []

    const [loading] = useState(true)
    const roastResultRef  = useRef<RoastFmt | null>(null)
    const roastErrorRef   = useRef<string | null>(null)
    const timerDoneRef    = useRef(false)
    const apiFetchedRef   = useRef(false)
    const hasNavigatedRef = useRef(false)

    function tryNavigate() {
        if (!timerDoneRef.current || !apiFetchedRef.current) return
        if (hasNavigatedRef.current) return
        hasNavigatedRef.current = true
        if (roastErrorRef.current) {
            navigate("/roast", { state: { error: roastErrorRef.current, films } })
        } else {
            navigate("/roast", { state: { roast: roastResultRef.current, films } })
        }
    }

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/roast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ films, qa }),
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to generate roast")
                return res.json()
            })
            .then((data: RoastFmt) => { roastResultRef.current = data })
            .catch(err => { roastErrorRef.current = err.message || "Something went wrong" })
            .finally(() => {
                apiFetchedRef.current = true
                tryNavigate()
            })

        const totalDuration = loadingStates.length * 2000
        const timer = setTimeout(() => {
            timerDoneRef.current = true
            tryNavigate()
        }, totalDuration)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen">
            <div className="relative z-110">
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <Navbar />
                </ThemeProvider>
            </div>

            <MultiStepLoader
                loadingStates={loadingStates}
                loading={loading}
                duration={2000}
                loop={false}
            />
        </div>
    )
}
