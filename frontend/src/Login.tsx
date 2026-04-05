import { ThemeProvider } from "./components/theme-provider"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import Navbar from "./elements/Navbar"
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom"
import { TextGenerateEffect } from "./components/ui/text-generate-effect";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

function Login() {
    const navigate = useNavigate();
    const [showInput, setShowInput] = useState(false);
    const [storeUsername, setUsername] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
        setError(null)
    }

    async function handleSubmit() {
        if (!storeUsername.trim()) {
            setError("Please enter a username")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`http://localhost:8080/films/${storeUsername}`)

            if (!response.ok) {
                if (response.status === 404) throw new Error("Username not found")
                throw new Error("Failed to fetch user details. Please try again.")
            }

            const data = await response.json()

            if (!data || (Array.isArray(data) && data.length === 0)) {
                throw new Error("Username not found")
            }

            navigate('/loading', { state: { films: data } })

        } catch (error) {
            setError(error instanceof Error ? error.message : "Username not found")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => setShowInput(true), 8000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <ThemeProvider>
                <Navbar />
            </ThemeProvider>

            <div className="mt-10 md:mt-20 px-4">
                <Link to={"/"}>
                    <ArrowLeft className="ml-4 sm:ml-8 md:ml-20 pb-2.5" />
                </Link>

                <div className="Login-dialog flex flex-col justify-center items-center text-xl md:text-2xl font-[apple-garamond-light] px-4">
                    <TextGenerateEffect words="Well, to get started, I need to have a walkthrough of your Letterboxd account" className="max-w-sm md:max-w-md text-center" delay={0} />
                    <TextGenerateEffect words="I'm just going to check your latest watches and start my analysis." className="max-w-sm md:max-w-md text-center" delay={3} />
                    <TextGenerateEffect words="Please provide your Letterboxd username for that" className="max-w-sm md:max-w-md text-center" delay={6} />
                </div>

                <AnimatePresence>
                    {showInput && (
                        <motion.div
                            className="username flex flex-col justify-center items-center pt-10 px-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                                <div className="flex items-center gap-2 w-full">
                                    <Input
                                        type="text"
                                        placeholder="Enter your username"
                                        className={`flex-1 ${error ? 'border-red-500 border-2 focus-visible:ring-red-500' : ''}`}
                                        value={storeUsername}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="border-[#424FFF] border-2 shrink-0"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="animate-spin">⏳</span>
                                        ) : (
                                            <ArrowRight />
                                        )}
                                    </Button>
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm font-medium">{error}</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}

export default Login
