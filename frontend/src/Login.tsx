import { ThemeProvider } from "./components/theme-provider"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import Navbar from "./elements/Navbar"
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom"
import { TextGenerateEffect } from "./components/ui/text-generate-effect";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

function Login() {
    const [showInput, setShowInput] = useState(false);

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
                            <div className="flex items-center gap-2 ">
                                <Input type="text" placeholder="Enter your username" className="w-48" />
                                <Button type="submit" variant="outline" className="border-[#424FFF] border-2">
                                    <ArrowRight />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>


        </>
    )
}

export default Login