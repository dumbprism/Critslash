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

type ChatEntry =
    | { kind: "bot";     id: string; text: string }
    | { kind: "typing";  id: string }
    | { kind: "options"; id: string; qIndex: number; answered: boolean }
    | { kind: "user";    id: string; text: string }

const QUESTIONS = [
    {
        id: "pick_method",
        question: "How do you usually pick your next watch?",
        options: [
            "Letterboxd lists & deep rabbit holes",
            "Whatever the algorithm throws at me",
            "A friend recommended it",
            "Pure, unhinged vibes",
        ],
    },
    {
        id: "rating_philosophy",
        question: "What's your film rating philosophy?",
        options: [
            "Half stars and detailed logs",
            "5 stars or straight to the bin",
            "I barely rate anything",
            "Stars plus a full essay, every time",
        ],
    },
    {
        id: "viewing_preference",
        question: "Cinema hall or home screen?",
        options: [
            "Cinema is a sacred ritual",
            "Couch, snacks, comfort always",
            "Laptop in bed, subtitles on",
            "Wherever — I just watch",
        ],
    },
    {
        id: "red_flag",
        question: "Biggest red flag in a film for you?",
        options: [
            "CGI-everything blockbusters",
            "Cheap jump-scare horror",
            "Anything over 2.5 hours",
            "Films that over-explain their message",
        ],
    },
]

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map(i => (
                <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-black/30 dark:bg-white/40 block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    )
}

export default function Questions() {
    const location = useLocation()
    const navigate = useNavigate()
    const films = (location.state?.films as Film[]) || []

    const [chat, setChat] = useState<ChatEntry[]>([
        { kind: "bot",     id: "bot-0",  text: QUESTIONS[0].question },
        { kind: "options", id: "opts-0", qIndex: 0, answered: false },
    ])
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [locked, setLocked] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chat])

    function handleSelect(option: string, qIndex: number) {
        if (locked) return
        setLocked(true)

        const q = QUESTIONS[qIndex]
        const updatedAnswers = { ...answers, [q.id]: option }
        setAnswers(updatedAnswers)

        setChat(prev =>
            prev.map(e => e.id === `opts-${qIndex}` ? { ...e, answered: true } as ChatEntry : e)
        )

        setTimeout(() => {
            setChat(prev => [...prev, { kind: "user", id: `user-${qIndex}`, text: option }])
        }, 150)

        const isLast = qIndex === QUESTIONS.length - 1

        if (isLast) {
            setTimeout(() => {
                navigate("/generating", { state: { films, answers: updatedAnswers } })
            }, 500)
            return
        }

        setTimeout(() => {
            setChat(prev => [...prev, { kind: "typing", id: "typing-next" }])
        }, 500)

        setTimeout(() => {
            const next = qIndex + 1
            setChat(prev => [
                ...prev.filter(e => e.id !== "typing-next"),
                { kind: "bot",     id: `bot-${next}`,  text: QUESTIONS[next].question },
                { kind: "options", id: `opts-${next}`,  qIndex: next, answered: false },
            ])
            setLocked(false)
        }, 1400)
    }

    return (
        <ThemeProvider>
            <Navbar />

            <div className="flex flex-col items-center min-h-screen pt-20 pb-10 px-4">
                <div className="w-full max-w-lg flex flex-col gap-3 pt-6">
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

                            if (entry.kind === "options") {
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: entry.answered ? 0 : 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="grid grid-cols-2 gap-2 pl-1"
                                    >
                                        {QUESTIONS[entry.qIndex].options.map(option => (
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
