import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import Navbar from './elements/Navbar'
import { supabase } from '@/lib/supabase'
import { motion } from 'motion/react'

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
    )
}

function GitHubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
    )
}

export default function Auth() {
    const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    async function signIn(provider: 'google' | 'github') {
        setLoadingProvider(provider)
        setError(null)
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoadingProvider(null)
        }
    }

    return (
        <ThemeProvider>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm flex flex-col gap-8"
                >
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl sm:text-4xl font-[apple-garamond-light] text-black/90 dark:text-white/90">
                            Sign in
                        </h1>
                        <p className="text-sm text-black/40 dark:text-white/40 font-[apple-garamond-light]">
                            Save film recommendations to your watchlist across sessions.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => signIn('google')}
                            disabled={loadingProvider !== null}
                            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl
                                       border border-black/10 dark:border-white/10
                                       bg-white dark:bg-white/5
                                       text-black/80 dark:text-white/80
                                       font-[apple-garamond-light] text-base
                                       hover:bg-black/5 dark:hover:bg-white/10
                                       transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <GoogleIcon />
                            {loadingProvider === 'google' ? 'Redirecting...' : 'Continue with Google'}
                        </button>

                        <button
                            onClick={() => signIn('github')}
                            disabled={loadingProvider !== null}
                            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl
                                       border border-black/10 dark:border-white/10
                                       bg-white dark:bg-white/5
                                       text-black/80 dark:text-white/80
                                       font-[apple-garamond-light] text-base
                                       hover:bg-black/5 dark:hover:bg-white/10
                                       transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <GitHubIcon />
                            {loadingProvider === 'github' ? 'Redirecting...' : 'Continue with GitHub'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-[apple-garamond-light]">{error}</p>
                    )}

                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-black/40 dark:text-white/40 font-[apple-garamond-light] hover:text-black/70 dark:hover:text-white/70 transition-colors self-start"
                    >
                        ← Go back
                    </button>
                </motion.div>
            </div>
        </ThemeProvider>
    )
}
