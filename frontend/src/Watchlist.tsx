import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import Navbar from './elements/Navbar'
import { supabase, type WatchlistItem } from '@/lib/supabase'
import { useAuth } from './contexts/AuthContext'
import { motion, AnimatePresence } from 'motion/react'
import { Trash2 } from 'lucide-react'

export default function Watchlist() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [items, setItems] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [removing, setRemoving] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/signin')
        }
    }, [user, authLoading, navigate])

    useEffect(() => {
        if (!user) return
        fetchWatchlist()
    }, [user])

    async function fetchWatchlist() {
        setLoading(true)
        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })

        if (!error && data) setItems(data)
        setLoading(false)
    }

    async function removeItem(id: string) {
        setRemoving(id)
        await supabase.from('watchlist').delete().eq('id', id)
        setItems(prev => prev.filter(item => item.id !== id))
        setRemoving(null)
    }

    if (authLoading || loading) {
        return (
            <ThemeProvider>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-black/40 dark:text-white/40 font-[apple-garamond-light]">Loading...</p>
                </div>
            </ThemeProvider>
        )
    }

    return (
        <ThemeProvider>
            <Navbar />
            <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-16 md:py-24">
                <div className="w-full max-w-2xl flex flex-col gap-10">

                    <motion.div
                        className="flex flex-col gap-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-[apple-garamond-light] text-black/90 dark:text-white/90">
                            Your watchlist
                        </h1>
                        <p className="text-sm text-black/40 dark:text-white/40 font-[apple-garamond-light]">
                            {items.length === 0 ? 'Nothing saved yet.' : `${items.length} film${items.length === 1 ? '' : 's'} saved`}
                        </p>
                    </motion.div>

                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-4 items-start"
                        >
                            <p className="text-base text-black/50 dark:text-white/50 font-[apple-garamond-light]">
                                Head to recommendations to find films and save them here.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-[#424FFF] font-[apple-garamond-light] hover:underline"
                            >
                                ← Go back
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <AnimatePresence>
                                {items.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.35, delay: i * 0.05 }}
                                        className="flex gap-4 sm:gap-6 items-start border border-black/10 dark:border-white/10 rounded-2xl p-5 bg-black/5 dark:bg-white/5"
                                    >
                                        {item.film_poster && (
                                            <img
                                                src={item.film_poster}
                                                alt={item.film_title}
                                                className="w-16 sm:w-20 rounded-xl shrink-0 object-cover shadow-md"
                                            />
                                        )}
                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <h2 className="text-xl sm:text-2xl font-[apple-garamond-light] text-black/90 dark:text-white/90 leading-tight">
                                                {item.film_title}
                                            </h2>
                                            <p className="text-sm text-black/40 dark:text-white/40 font-[apple-garamond-light]">
                                                {[item.film_year, item.film_director].filter(Boolean).join(' · ')}
                                            </p>
                                            {item.film_reason && (
                                                <p className="text-sm text-black/60 dark:text-white/60 font-[apple-garamond-light] mt-1 leading-relaxed line-clamp-2">
                                                    {item.film_reason}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            disabled={removing === item.id}
                                            className="shrink-0 p-2 rounded-xl text-black/30 dark:text-white/30
                                                       hover:text-red-500 hover:bg-red-500/10
                                                       transition-all duration-150 disabled:opacity-40"
                                            aria-label="Remove from watchlist"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </ThemeProvider>
    )
}
