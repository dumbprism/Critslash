import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Navbar from "./elements/Navbar"
import { motion, AnimatePresence } from "motion/react"

interface Film {
    film_name: string
    rating: string
    film_poster: string
}

interface GeneratedQuestion {
    id: string
    question: string
    options: string[]
}

interface QuestionAnswer {
    question: string
    answer: string
}

type ChatEntry =
    | { kind: "bot";     id: string; text: string }
    | { kind: "typing";  id: string }
    | { kind: "options"; id: string; qIndex: number; answered: boolean }
    | { kind: "user";    id: string; text: string }

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-black/30 dark:bg-white/40 block animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                />
            ))}
        </div>
    )
}

export default function Questions() {
    const location = useLocation()
    const navigate = useNavigate()
    const films = (location.state?.films as Film[]) || []

    const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null)
    const [chat, setChat] = useState<ChatEntry[]>([
        { kind: "typing", id: "intro-typing" },
    ])
    const [qa, setQA] = useState<QuestionAnswer[]>([])
    const [locked, setLocked] = useState(true)
    const bottomRef = useRef<HTMLDivElement>(null)
    const fetchedRef = useRef(false)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chat])

    // Fetch LLM-generated questions on mount
    useEffect(() => {
        if (fetchedRef.current) return
        fetchedRef.current = true

        fetch(`${import.meta.env.VITE_API_URL}/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(films),
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to generate questions")
                return res.json()
            })
            .then((data: GeneratedQuestion[]) => {
                setQuestions(data)
                // Replace the intro typing indicator with first question
                setChat([
                    { kind: "bot",     id: "bot-0",  text: data[0].question },
                    { kind: "options", id: "opts-0", qIndex: 0, answered: false },
                ])
                setLocked(false)
            })
            .catch(() => {
                setChat([{
                    kind: "bot",
                    id: "bot-error",
                    text: "Hmm, I couldn't load your questions. Try refreshing.",
                }])
            })
    }, [])

    function handleSelect(option: string, qIndex: number) {
        if (locked || !questions) return
        setLocked(true)

        const updatedQA = [...qa, { question: questions[qIndex].question, answer: option }]
        setQA(updatedQA)

        // Fade out options then remove from DOM so they don't leave a blank gap
        setChat(prev =>
            prev.map(e => e.id === `opts-${qIndex}` ? { ...e, answered: true } as ChatEntry : e)
        )
        setTimeout(() => {
            setChat(prev => prev.filter(e => e.id !== `opts-${qIndex}`))
        }, 260)

        // Append user bubble
        setTimeout(() => {
            setChat(prev => [...prev, { kind: "user", id: `user-${qIndex}`, text: option }])
        }, 150)

        const isLast = qIndex === questions.length - 1

        if (isLast) {
            setTimeout(() => {
                navigate("/generating", { state: { films, qa: updatedQA } })
            }, 500)
            return
        }

        // Typing indicator → next question
        setTimeout(() => {
            setChat(prev => [...prev, { kind: "typing", id: "typing-next" }])
        }, 500)

        setTimeout(() => {
            const next = qIndex + 1
            setChat(prev => [
                ...prev.filter(e => e.id !== "typing-next"),
                { kind: "bot",     id: `bot-${next}`,  text: questions[next].question },
                { kind: "options", id: `opts-${next}`,  qIndex: next, answered: false },
            ])
            setLocked(false)
        }, 1400)
    }

    return (
        <ThemeProvider>
            <Navbar />

            <div className="flex flex-col items-center min-h-screen pt-20 pb-10 px-4">
                <div className="w-full max-w-lg flex flex-col gap-2 pt-6">
                    <AnimatePresence initial={false}>
                        {chat.map(entry => {
                            if (entry.kind === "bot") {
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col gap-1 items-start"
                                    >
                                        <span className="text-xs text-black/40 dark:text-white/30 font-[apple-garamond-light] ml-1">
                                            CritSlash
                                        </span>
                                        <div className="bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                                            <p className="text-black/90 dark:text-white/90 font-[apple-garamond-light] text-base leading-snug">
                                                {entry.text}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            }

                            if (entry.kind === "typing") {
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col gap-1 items-start"
                                    >
                                        <span className="text-xs text-black/40 dark:text-white/30 font-[apple-garamond-light] ml-1">
                                            CritSlash
                                        </span>
                                        <div className="bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 rounded-2xl rounded-tl-sm">
                                            <TypingIndicator />
                                        </div>
                                    </motion.div>
                                )
                            }

                            if (entry.kind === "options" && questions) {
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: entry.answered ? 0 : 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1"
                                    >
                                        {questions[entry.qIndex].options.map(option => (
                                            <button
                                                key={option}
                                                disabled={entry.answered || locked}
                                                onClick={() => handleSelect(option, entry.qIndex)}
                                                className="text-left px-4 py-3 rounded-xl
                                                           border border-black/10 dark:border-white/10
                                                           bg-black/5 dark:bg-white/5
                                                           font-[apple-garamond-light] text-sm
                                                           text-black/70 dark:text-white/75
                                                           leading-snug
                                                           hover:border-[#424FFF]/70 hover:bg-[#424FFF]/8
                                                           hover:text-[#424FFF] dark:hover:text-white
                                                           transition-all duration-150 disabled:cursor-default"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </motion.div>
                                )
                            }

                            if (entry.kind === "user") {
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex justify-end"
                                    >
                                        <div className="bg-[#424FFF] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
                                            <p className="text-white font-[apple-garamond-light] text-base leading-snug">
                                                {entry.text}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            }

                            return null
                        })}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                </div>
            </div>
        </ThemeProvider>
    )
}
