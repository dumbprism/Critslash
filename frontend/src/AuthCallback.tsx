import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.exchangeCodeForSession(window.location.search).then(({ error }) => {
            if (error) {
                console.error('Auth callback error:', error.message)
                navigate('/signin')
            } else {
                navigate('/recommendations')
            }
        })
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="font-[apple-garamond-light] text-black/50 dark:text-white/50">
                Signing you in…
            </p>
        </div>
    )
}
