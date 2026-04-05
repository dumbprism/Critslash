package types

type FilmDetails struct {
	FilmName   string `json:"film_name"`
	Rating     string `json:"rating"`
	FilmPoster string `json:"film_poster"`
}

type RoastRequest struct {
	Films   []FilmDetails     `json:"films"`
	Answers map[string]string `json:"answers"`
}

type RoastFmt struct {
	Title string `json:"title"`
	Roast string `json:"roast"`
	Score int    `json:"score"`
}
