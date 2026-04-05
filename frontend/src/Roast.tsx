import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./elements/Navbar"
import { motion } from "motion/react"
import { Share2, Loader2 } from "lucide-react"

interface RoastFmt {
    title: string
    roast: string
    score: number
}

function ScoreBar({ score }: { score: number }) {
    const [displayed, setDisplayed] = useState(0)

    useEffect(() => {
        const timeout = setTimeout(() => setDisplayed(score), 600)
        return () => clearTimeout(timeout)
    }, [score])

    const color =
        score >= 70 ? "#22c55e"
        : score >= 40 ? "#424FFF"
        : "#ef4444"

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
                <span className="text-black/50 dark:text-white/50 text-xs sm:text-sm font-[apple-garamond-light] uppercase tracking-widest">
                    Taste Score
                </span>
                <motion.span
                    className="text-3xl sm:text-4xl font-bold"
                    style={{ color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    {displayed}
                    <span className="text-lg sm:text-xl text-black/30 dark:text-white/30">/100</span>
                </motion.span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${displayed}%` }}
                    transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
                />
            </div>
            <p className="text-black/40 dark:text-white/30 text-xs font-[apple-garamond-light] text-right">
                {score < 30 ? "Certified cinematic disaster"
                    : score < 50 ? "Questionable at best"
                    : score < 70 ? "Could be worse, somehow"
                    : score < 85 ? "Decent taste, shockingly"
                    : "Certified cinephile"}
            </p>
        </div>
    )
}

// Rendered at opacity:0 at top-left so the browser paints it (off-screen skips render).
function ShareCard({ roast, cardRef }: { roast: RoastFmt; cardRef: React.RefObject<HTMLDivElement | null> }) {
    const color =
        roast.score >= 70 ? "#22c55e"
        : roast.score >= 40 ? "#424FFF"
        : "#ef4444"

    const label =
        roast.score < 30 ? "Certified cinematic disaster"
        : roast.score < 50 ? "Questionable at best"
        : roast.score < 70 ? "Could be worse, somehow"
        : roast.score < 85 ? "Decent taste, shockingly"
        : "Certified cinephile"

    return (
        <div
            ref={cardRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                opacity: 0,
                pointerEvents: "none",
                zIndex: -1,
                width: "600px",
                padding: "48px",
                background: "#0e0e0e",
                color: "#ffffff",
                fontFamily: '"apple-garamond-light", Georgia, serif',
                boxSizing: "border-box",
            }}
        >
            <p style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", opacity: 0.35, marginBottom: "32px" }}>
                CritSlash
            </p>
            <h1 style={{ fontSize: "42px", lineHeight: 1.2, marginBottom: "24px", fontFamily: '"apple-garamond-light", Georgia, serif' }}>
                {roast.title}
            </h1>
            <div style={{ marginBottom: "28px" }}>
                {roast.roast.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontSize: "15px", lineHeight: 1.75, marginBottom: "12px", opacity: 0.82 }}>
                        {para}
                    </p>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.4 }}>
                    Taste Score
                </span>
                <span style={{ fontSize: "32px", fontWeight: "bold", color }}>
                    {roast.score}
                    <span style={{ fontSize: "15px", opacity: 0.3 }}>/100</span>
                </span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                <div style={{ height: "100%", width: `${roast.score}%`, background: color, borderRadius: "3px" }} />
            </div>
            <p style={{ fontSize: "11px", opacity: 0.28, textAlign: "right", marginBottom: "32px" }}>{label}</p>
            <p style={{ fontSize: "10px", opacity: 0.18, letterSpacing: "2px", textAlign: "right" }}>critslash.app</p>
        </div>
    )
}

function Roast() {
    const location = useLocation()
    const roast = (location.state?.roast as RoastFmt) ?? null
    const error = (location.state?.error as string) ?? null

    const shareCardRef = useRef<HTMLDivElement>(null)
    const [sharing, setSharing] = useState(false)

    async function handleShare() {
        if (!shareCardRef.current || !roast) return
        setSharing(true)
        const card = shareCardRef.current
        try {
            const { toPng } = await import("html-to-image")
            card.style.opacity = "1"
            const dataUrl = await toPng(card, { pixelRatio: 2 })
            card.style.opacity = "0"

            const a = document.createElement("a")
            a.href = dataUrl
            a.download = "my-critslash-roast.png"
            a.click()
        } catch (err) {
            card.style.opacity = "0"
            console.error("Share failed", err)
        } finally {
            setSharing(false)
        }
    }

    return (
        <ThemeProvider>
            <Navbar />

            {roast && <ShareCard roast={roast} cardRef={shareCardRef} />}

            <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 md:py-24">
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-base sm:text-lg text-center"
                    >
                        {error}
                    </motion.p>
                )}

                {roast && (
                    <div className="max-w-2xl w-full flex flex-col gap-6 md:gap-8">

                        {/* Title + share icon */}
                        <motion.div
                            className="flex items-start justify-center gap-3"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[apple-garamond-light] leading-tight text-center text-black/90 dark:text-white/90">
                                {roast.title}
                            </h1>
                            <button
                                onClick={handleShare}
                                disabled={sharing}
                                title="Share my roast"
                                className="mt-1 shrink-0 p-2 rounded-full
                                           border border-black/10 dark:border-white/10
                                           bg-black/5 dark:bg-white/5
                                           text-black/50 dark:text-white/50
                                           hover:border-[#424FFF]/60 hover:text-[#424FFF] dark:hover:text-white
                                           transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {sharing
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <Share2 size={16} />}
                            </button>
                        </motion.div>

                        {/* Roast card */}
                        <motion.div
                            className="border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-8 bg-black/5 dark:bg-white/5 backdrop-blur-sm flex flex-col gap-4 sm:gap-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                        >
                            {roast.roast.split("\n\n").map((para, i) => (
                                <p key={i} className="text-base sm:text-lg md:text-xl leading-relaxed text-black/80 dark:text-white/85 font-[apple-garamond-light]">
                                    {para}
                                </p>
                            ))}
                        </motion.div>

                        {/* Score bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.6 }}
                        >
                            <ScoreBar score={roast.score} />
                        </motion.div>
                    </div>
                )}
            </div>
        </ThemeProvider>
    )
}

export default Roast
