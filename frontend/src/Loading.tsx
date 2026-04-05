import { MultiStepLoader } from "./components/ui/multi-step-loader";
import { useState, useMemo, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "./elements/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { Marquee, MarqueeContent, MarqueeItem } from "@/components/ui/shadcn-io/marquee";

interface Film {
    film_name: string;
    rating: string;
    film_poster: string;
}

function Loading() {
    const location = useLocation();
    const navigate = useNavigate();
    const allFilms = (location.state?.films as Film[]) || [];

    const filmsWithPosters = useMemo(() => {
        return allFilms.filter(film =>
            film.film_poster &&
            film.film_poster.trim() !== '' &&
            film.film_poster !== 'null' &&
            film.film_poster !== 'undefined'
        );
    }, [allFilms]);

    const randomFilm = useMemo(() => {
        if (filmsWithPosters.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * filmsWithPosters.length);
        return filmsWithPosters[randomIndex];
    }, [filmsWithPosters]);

    const loadingStates = [
        { text: "Scanning your Letterboxd..." },
        { text: "Cataloguing your questionable choices" },
        { text: randomFilm ? `Oh no... I see ${randomFilm.film_name}` : "Inspecting the damage" },
        { text: "Almost ready to judge you" },
        { text: "Preparing your questionnaire..." },
    ];

    const [loading] = useState(true);

    useEffect(() => {
        const totalDuration = loadingStates.length * 2000;
        const timer = setTimeout(() => {
            navigate('/questions', { state: { films: allFilms } });
        }, totalDuration);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen">
            <div className="relative z-110">
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <Navbar />
                </ThemeProvider>
            </div>

            <MultiStepLoader
                loadingStates={loadingStates}
                loading={loading}
                duration={2000}
                loop={false}
            />

            {filmsWithPosters.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 pb-4 pointer-events-none z-140">
                    <Marquee className="py-10">
                        <MarqueeContent>
                            {filmsWithPosters.map((film, index) => (
                                <MarqueeItem key={index} className="px-3">
                                    <div className="relative group pointer-events-auto">
                                        <img
                                            src={film.film_poster}
                                            alt={film.film_name}
                                            className="h-48 w-auto rounded-lg shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-xs text-white font-medium truncate">{film.film_name}</p>
                                            <p className="text-xs text-yellow-400">{film.rating}</p>
                                        </div>
                                    </div>
                                </MarqueeItem>
                            ))}
                        </MarqueeContent>
                    </Marquee>
                </div>
            )}
        </div>
    )
}

export default Loading
