import { Marquee, MarqueeContent, MarqueeItem } from "@/components/ui/shadcn-io/marquee"
import { useState, useEffect } from "react"

interface MoviePoster {
    title: string;
    posterPath: string | null;
}

function Marqueelement() {
    const movies = ["The Godfather",
        "Star Wars",
        "Oppenheimer",
        "Dune",
        "There will be blood",
        "Taxi Driver",
        "Eyes wide shut",
        "Pulp Fiction",
        "Bahubali",
        "Zodiac",
        "Blue Velvet",
        "Psycho",
        "Pather Panchali"]
    const [moviePosters, setMoviePosters] = useState<MoviePoster[]>([])

    useEffect(() => {
        const fetchPosters = async () => {
            // Debug: Log all environment variables
            console.log('All env vars:', import.meta.env)

            const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
            const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
            try {
                const posterPromises = movies.map(async (movie) => {
                    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie)}`
                    console.log('Fetching:', movie)

                    const response = await fetch(url)
                    const data = await response.json()

                    console.log(`Results for ${movie}:`, data.results?.length || 0)

                    if (data.results && data.results.length > 0) {
                        return {
                            title: movie,
                            posterPath: data.results[0].poster_path
                                ? `${TMDB_IMAGE_BASE}${data.results[0].poster_path}`
                                : null
                        }
                    }
                    return { title: movie, posterPath: null }
                })

                const posters = await Promise.all(posterPromises)
                console.log('Fetched posters:', posters)
                setMoviePosters(posters)
            } catch (error) {
                console.error('Error fetching movie posters:', error)
            }
        }

        fetchPosters()
    }, [])

    return (
        <div className="mt-20">
            <Marquee className="py-10">
                <MarqueeContent>
                    {moviePosters.map((movie, i) => (
                        <MarqueeItem key={i} className="px-2">
                            {movie.posterPath ? (
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="h-70 w-auto rounded-sm shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="h-70 w-44 bg-gray-200 rounded-sm flex items-center justify-center">
                                    <span className="text-gray-500 text-center px-2">{movie.title}</span>
                                </div>
                            )}
                        </MarqueeItem>
                    ))}
                </MarqueeContent>
            </Marquee>
        </div>
    )
}

export default Marqueelement