import { useEffect, useState } from "react"

interface Film {
    film_name: string
    rating: string
    film_poster: string
}

function Roast() {
    const [details, setDetails] = useState<Film[]>([])

    useEffect(() => {
        fetch("http://localhost:8080/films/vincentgiga")
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok")
                }
                return res.json()
            })
            .then(data => setDetails(data))
            .catch(error => console.error("Error fetching data:", error))
    }, [])
    return (
        <>
            {
                details.map((detail) => {
                    return (
                        <div key={detail.film_name}>
                            <h1>{detail.film_name}</h1>
                        </div>
                    )
                })
            }
        </>
    )
}

export default Roast