import { ThemeProvider } from "./components/theme-provider"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import Navbar from "./elements/Navbar"
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom"
import { TextGenerateEffect } from "./components/ui/text-generate-effect";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
function Login() {
    const [showInput, setShowInput] = useState(false);
    const [storeUsername, setUsername] = useState("")
    const [storeDetails, setDetails] = useState<any>(null)  // Changed to accept any data type
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
        setError(null)  // Clear error when user types
    }

    async function handleSubmit() {
        if (!storeUsername.trim()) {
            setError("Please enter a username")
            return
        }

        setIsLoading(true)
        setError(null)
        console.log(`Fetching: http://localhost:8080/films/${storeUsername}`)

        try {
            const response = await fetch(`http://localhost:8080/films/${storeUsername}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("User not found. Please ensure you have typed the correct username.")
                }
                throw new Error("Failed to fetch user details. Please try again.")
            }

            const data = await response.json()

            // Check if data is null or empty
            if (!data || (Array.isArray(data) && data.length === 0)) {
                throw new Error("No data found for this user. The username might not exist or has no films.")
            }

            setDetails(data)
            setError(null)
            console.log("Status OK - Data received:", data)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "User not found. Please ensure you have typed the correct username."
            setError(errorMessage)
            console.error("Error fetching details:", error)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        if (storeDetails && storeDetails.length > 0) {
            console.log("storeDetails:", storeDetails)
        }
    }, [storeDetails])

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInput(true);
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <ThemeProvider>
                <Navbar />
            </ThemeProvider>

            <div className="mt-20">
                <Link to={"/"}>
                    <ArrowLeft className="ml-142 pb-2.5" />
                </Link>

                <div className="Login-dialog flex flex-col justify-center items-center text-2xl font-[apple-garamond-light]">
                    <TextGenerateEffect words="Well, to get started, I need to have a walkthrough of your Letterboxd account" className="w-90" delay={0} />
                    <TextGenerateEffect words="I'm just going to check your latest watches and start my analysis." className="w-90" delay={3} />
                    <TextGenerateEffect words="Please provide your Letterboxd username for that" className="w-90" delay={6} />
                </div>

                <AnimatePresence>
                    {showInput && (
                        <motion.div
                            className="username flex flex-col justify-center items-center ml-80 pt-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter your username"
                                        className="w-48"
                                        value={storeUsername}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="border-[#424FFF] border-2"
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
                                    <Alert variant={"destructive"}>
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
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