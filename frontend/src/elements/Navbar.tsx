import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ModeToggle } from '@/components/mode-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { Bookmark, LogOut, ChevronDown } from 'lucide-react'

function UserMenu() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
    const name = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || '') as string
    const initials = name.slice(0, 1).toUpperCase()

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity"
                aria-label="User menu"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-[#424FFF] flex items-center justify-center text-white text-xs font-[apple-garamond-light]">
                        {initials}
                    </div>
                )}
                <ChevronDown size={13} className="text-black/40 dark:text-white/40" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
                        <p className="text-xs text-black/40 dark:text-white/40 font-[apple-garamond-light] truncate">{name}</p>
                    </div>
                    <button
                        onClick={() => { setOpen(false); navigate('/watchlist') }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-[apple-garamond-light]
                                   text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5
                                   transition-colors text-left"
                    >
                        <Bookmark size={14} />
                        Watchlist
                    </button>
                    <button
                        onClick={async () => { setOpen(false); await signOut() }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm font-[apple-garamond-light]
                                   text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5
                                   transition-colors text-left"
                    >
                        <LogOut size={14} />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    )
}

function Navbar() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex gap-2 items-center">
                <img src="logo.svg" alt="Critslash Logo" className="w-7 h-7 md:w-8 md:h-8" />
                <Link to="/" className="text-xl md:text-3xl">Critslash</Link>
            </div>
            <div className="flex items-center gap-3">
                {!loading && (
                    user ? (
                        <UserMenu />
                    ) : (
                        <button
                            onClick={() => navigate('/signin')}
                            className="text-sm font-[apple-garamond-light] text-black/50 dark:text-white/50
                                       hover:text-black dark:hover:text-white transition-colors"
                        >
                            Sign in
                        </button>
                    )
                )}
                <ModeToggle />
            </div>
        </div>
    )
}

export default Navbar
