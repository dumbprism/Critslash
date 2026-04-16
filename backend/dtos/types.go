package types

type FilmDetails struct {
	FilmName   string `json:"film_name"`
	Rating     string `json:"rating"`
	FilmPoster string `json:"film_poster"`
}

type GeneratedQuestion struct {
	ID       string   `json:"id"`
	Question string   `json:"question"`
	Options  []string `json:"options"`
}

type QuestionAnswer struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type RoastRequest struct {
	Films []FilmDetails    `json:"films"`
	QA    []QuestionAnswer `json:"qa"`
}

type RoastFmt struct {
	Title string `json:"title"`
	Roast string `json:"roast"`
	Score int    `json:"score"`
}

type RecommendRequest struct {
	Films            []FilmDetails `json:"films"`
	Genre            string        `json:"genre"`
	Mood             string        `json:"mood"`
	Surprise         bool          `json:"surprise"`
	AlreadySuggested []string      `json:"already_suggested"`
	YearFrom         int           `json:"year_from"`
	YearTo           int           `json:"year_to"`
}

type Recommendation struct {
	Title       string `json:"title"`
	Year        string `json:"year"`
	Director    string `json:"director"`
	Description string `json:"description"`
	Reason      string `json:"reason"`
}
