import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./elements/Navbar"
import { motion, AnimatePresence } from "motion/react"
import { Shuffle, RefreshCw, Bookmark, BookmarkCheck } from "lucide-react"
import { useAuth } from "./contexts/AuthContext"
import { supabase } from "@/lib/supabase"

interface Film {
    film_name: string
    rating: string
    film_poster: string
}

interface Recommendation {
    title: string
    year: string
    director: string
    description: string
    reason: string
}

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Documentary", "Animation", "Fantasy", "Mystery", "Crime"]

const MOODS = [
    "Want to laugh",
    "Need a good cry",
    "Something scary",
    "Mind-bending",
    "Feel-good",
    "Deep & thoughtful",
    "Pure fun",
    "Something different",
]

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full border font-[apple-garamond-light] text-sm transition-all duration-150
                ${selected
                    ? "border-[#424FFF] bg-[#424FFF]/15 text-[#424FFF] dark:text-white"
                    : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:border-[#424FFF]/50 hover:text-[#424FFF] dark:hover:text-white"
                }`}
        >
            {label}
        </button>
    )
}

export default function Recommendations() {
    const location = useLocation()
    const navigate = useNavigate()
    const films = (location.state?.films as Film[]) || []
    const { user } = useAuth()

    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [selectedMoods,  setSelectedMoods]  = useState<string[]>([])
    const [loading,   setLoading]   = useState(false)
    const [result,    setResult]    = useState<Recommendation | null>(null)
    const [poster,    setPoster]    = useState<string | null>(null)
    const [error,     setError]     = useState<string | null>(null)
    const [surprise,  setSurprise]  = useState(false)
    const [alreadySuggested, setAlreadySuggested] = useState<string[]>([])
    const [saved,     setSaved]     = useState(false)
    const [saving,    setSaving]    = useState(false)
    const [saveMsg,   setSaveMsg]   = useState<string | null>(null)

    // Reset saved state when a new recommendation loads
    useEffect(() => {
        setSaved(false)
        setSaveMsg(null)
    }, [result?.title])

    async function fetchPoster(title: string, year: string): Promise<string | null> {
        try {
            const key = import.meta.env.VITE_TMDB_API_KEY
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(title)}&year=${year}`
            const res = await fetch(url)
            const data = await res.json()
            const path = data.results?.[0]?.poster_path
            return path ? `https://image.tmdb.org/t/p/w500${path}` : null
        } catch {
            return null
        }
    }

    async function fetchRecommendation(isSurprise: boolean) {
        setLoading(true)
        setResult(null)
        setPoster(null)
        setError(null)
        setSurprise(isSurprise)

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    films,
                    genre:             isSurprise ? "" : selectedGenres.join(", "),
                    mood:              isSurprise ? "" : selectedMoods.join(", "),
                    surprise:          isSurprise,
                    already_suggested: alreadySuggested,
                }),
            })
            if (!res.ok) throw new Error("Failed to get recommendation")
            const data: Recommendation = await res.json()
            setAlreadySuggested(prev => [...prev, data.title])
            setResult(data)
            const posterUrl = await fetchPoster(data.title, data.year)
            setPoster(posterUrl)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function saveToWatchlist() {
        if (!user) {
            navigate('/signin')
            return
        }
        if (!result || saved) return

        setSaving(true)
        const { error } = await supabase.from('watchlist').upsert({
            user_id: user.id,
            film_title: result.title,
            film_year: result.year || null,
            film_director: result.director || null,
            film_description: result.description || null,
            film_reason: result.reason || null,
            film_poster: poster || null,
        }, { onConflict: 'user_id,film_title' })

        if (error) {
            setSaveMsg('Failed to save. Try again.')
        } else {
            setSaved(true)
            setSaveMsg(null)
        }
        setSaving(false)
    }

    function tryAnother() {
        fetchRecommendation(surprise)
    }

    return (
        <ThemeProvider>
            <Navbar />

            <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-16 md:py-24">
                <div className="w-full max-w-2xl flex flex-col gap-10">

                    {/* Header */}
                    <motion.div
                        className="flex flex-col gap-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-[apple-garamond-light] text-black/90 dark:text-white/90">
                            What do you want to watch?
                        </h1>
                        <p className="text-sm text-black/40 dark:text-white/40 font-[apple-garamond-light]">
                            Pick a genre, a mood, or just hit Surprise me.
                        </p>
                    </motion.div>

                    {/* Genre */}
                    <motion.div
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        <p className="text-xs uppercase tracking-widest text-black/40 dark:text-white/30 font-[apple-garamond-light]">
                            Genre
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(g => (
                                <Chip
                                    key={g}
                                    label={g}
                                    selected={selectedGenres.includes(g)}
                                    onClick={() => setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Mood */}
                    <motion.div
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <p className="text-xs uppercase tracking-widest text-black/40 dark:text-white/30 font-[apple-garamond-light]">
                            Mood
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {MOODS.map(m => (
                                <Chip
                                    key={m}
                                    label={m}
                                    selected={selectedMoods.includes(m)}
                                    onClick={() => setSelectedMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-3"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <button
                            onClick={() => fetchRecommendation(false)}
                            disabled={loading}
                            className="flex-1 py-3 rounded-2xl border border-[#424FFF] text-[#424FFF]
                                       font-[apple-garamond-light] text-base
                                       hover:bg-[#424FFF]/10 transition-all duration-200
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading && !surprise ? "Finding your film..." : "Find my film"}
                        </button>

                        <button
                            onClick={() => fetchRecommendation(true)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
                                       bg-[#424FFF] text-white
                                       font-[apple-garamond-light] text-base
                                       hover:bg-[#3640CC] transition-all duration-200
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Shuffle size={15} />
                            {loading && surprise ? "Picking..." : "Surprise me"}
                        </button>
                    </motion.div>

                    {/* Result */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.p
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-sm"
                            >
                                {error}
                            </motion.p>
                        )}

                        {result && !loading && (
                            <motion.div
                                key={result.title}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="flex flex-col gap-5 border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-8 bg-black/5 dark:bg-white/5"
                            >
                                {/* Poster + title row */}
                                <div className="flex gap-4 sm:gap-6 items-start">
                                    {poster && (
                                        <img
                                            src={poster}
                                            alt={result.title}
                                            className="w-24 sm:w-32 rounded-xl shrink-0 object-cover shadow-md"
                                        />
                                    )}
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <h2 className="text-2xl sm:text-3xl font-[apple-garamond-light] text-black/90 dark:text-white/90 leading-tight">
                                            {result.title}
                                        </h2>
                                        <p className="text-sm text-black/40 dark:text-white/40 font-[apple-garamond-light]">
                                            {result.year}{result.director ? ` · ${result.director}` : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Why for you */}
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs uppercase tracking-widest text-black/30 dark:text-white/30 font-[apple-garamond-light]">
                                        Why for you
                                    </p>
                                    <p className="text-base sm:text-lg font-[apple-garamond-light] text-black/80 dark:text-white/85 leading-relaxed">
                                        {result.reason}
                                    </p>
                                </div>

                                {/* Plot */}
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs uppercase tracking-widest text-black/30 dark:text-white/30 font-[apple-garamond-light]">
                                        What it's about
                                    </p>
                                    <p className="text-base sm:text-lg font-[apple-garamond-light] text-black/70 dark:text-white/70 leading-relaxed">
                                        {result.description}
                                    </p>
                                </div>

                                {/* Bottom row: Try another + Save to watchlist */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={tryAnother}
                                        disabled={loading}
                                        className="flex items-center gap-2 text-sm text-black/40 dark:text-white/40
                                                   hover:text-[#424FFF] dark:hover:text-white font-[apple-garamond-light]
                                                   transition-colors duration-150 disabled:opacity-40"
                                    >
                                        <RefreshCw size={13} />
                                        Try another
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {saveMsg && (
                                            <span className="text-xs text-red-500 font-[apple-garamond-light]">{saveMsg}</span>
                                        )}
                                        <button
                                            onClick={saveToWatchlist}
                                            disabled={saving || saved}
                                            className={`flex items-center gap-2 text-sm font-[apple-garamond-light]
                                                        transition-colors duration-150 disabled:cursor-not-allowed
                                                        ${saved
                                                            ? "text-[#424FFF] dark:text-[#6b77ff]"
                                                            : "text-black/40 dark:text-white/40 hover:text-[#424FFF] dark:hover:text-white"
                                                        }`}
                                        >
                                            {saved
                                                ? <><BookmarkCheck size={14} /> Saved</>
                                                : <><Bookmark size={14} /> {user ? (saving ? 'Saving...' : 'Save to watchlist') : 'Sign in to save'}</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </ThemeProvider>
    )
}
