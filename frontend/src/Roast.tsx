import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./elements/Navbar"
import { motion } from "motion/react"

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
                <span className="text-black/50 dark:text-white/50 text-sm font-[apple-garamond-light] uppercase tracking-widest">
                    Taste Score
                </span>
                <motion.span
                    className="text-4xl font-bold"
                    style={{ color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    {displayed}
                    <span className="text-xl text-black/30 dark:text-white/30">/100</span>
                </motion.span>
            </div>

            {/* Track */}
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
                {score < 30
                    ? "Certified cinematic disaster"
                    : score < 50
                    ? "Questionable at best"
                    : score < 70
                    ? "Could be worse, somehow"
                    : score < 85
                    ? "Decent taste, shockingly"
                    : "Certified cinephile"}
            </p>
        </div>
    )
}

function Roast() {
    const location = useLocation()
    const roast = (location.state?.roast as RoastFmt) ?? null
    const error = (location.state?.error as string) ?? null

    return (
        <ThemeProvider>
            <Navbar />

            <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-lg text-center"
                    >
                        {error}
                    </motion.p>
                )}

                {roast && (
                    <div className="max-w-2xl w-full flex flex-col gap-8">
                        {/* Title */}
                        <motion.h1
                            className="text-5xl md:text-6xl font-[apple-garamond-light] leading-tight text-center
                                       text-black/90 dark:text-white/90"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                        >
                            {roast.title}
                        </motion.h1>

                        {/* Roast card */}
                        <motion.div
                            className="border border-black/10 dark:border-white/10
                                       rounded-2xl p-8
                                       bg-black/5 dark:bg-white/5
                                       backdrop-blur-sm flex flex-col gap-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                        >
                            {roast.roast.split("\n\n").map((para, i) => (
                                <p key={i} className="text-lg md:text-xl leading-relaxed
                                                      text-black/80 dark:text-white/85
                                                      font-[apple-garamond-light]">
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
