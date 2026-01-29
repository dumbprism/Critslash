package handlers

import (
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

type FilmDetails struct {
	FilmName   string `json:"film_name"`
	Rating     string `json:"rating"`
	FilmPoster string `json:"film_poster"`
}

func GetDetails(ctx *gin.Context) {
	username := ctx.Param("usrnm")
	BASE_URL := os.Getenv("BASE_URL")
	url := BASE_URL + username + "/rss/"

	// Fetch RSS feed
	resp, err := http.Get(url)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feed"})
		return
	}
	defer resp.Body.Close()

	// Read response
	body, _ := io.ReadAll(resp.Body)

	// Parse XML inline
	var data struct {
		Channel struct {
			Items []struct {
				Title       string `xml:"title"`
				Description string `xml:"description"`
				FilmTitle   string `xml:"filmTitle"`
				Rating      string `xml:"memberRating"`
			} `xml:"item"`
		} `xml:"channel"`
	}
	xml.Unmarshal(body, &data)

	// Extract films
	var films []FilmDetails
	for _, item := range data.Channel.Items {
		// Extract film name and rating from title
		filmName, rating := parseTitle(item.Title)

		// Use FilmTitle if available (cleaner)
		if item.FilmTitle != "" {
			filmName = item.FilmTitle
		}

		// Use memberRating if available
		if item.Rating != "" {
			rating = item.Rating + "/5.0"
		}

		// Extract poster from description
		poster := extractPoster(item.Description)

		if filmName != "" {
			films = append(films, FilmDetails{
				FilmName:   filmName,
				Rating:     rating,
				FilmPoster: poster,
			})
		}
	}

	// Return JSON
	ctx.JSON(http.StatusOK, films)
}

// parseTitle extracts film name and rating from title like "Raging Bull, 1980 - ★★★★★"
func parseTitle(title string) (string, string) {
	// Split by " - " to separate name and rating
	parts := strings.Split(title, " - ")

	filmName := parts[0]
	rating := "Not Rated"

	if len(parts) > 1 {
		// Count stars
		stars := strings.Count(parts[1], "★")
		if stars > 0 {
			rating = fmt.Sprintf("%d stars", stars)
		}
	}

	// Remove year from film name
	if idx := strings.LastIndex(filmName, ", "); idx != -1 {
		filmName = filmName[:idx]
	}

	return filmName, rating
}

// extractPoster extracts image URL from description HTML
func extractPoster(description string) string {
	// Regex to find image src
	re := regexp.MustCompile(`<img src="([^"]+)"`)
	matches := re.FindStringSubmatch(description)

	if len(matches) > 1 {
		return matches[1]
	}

	return ""
}
