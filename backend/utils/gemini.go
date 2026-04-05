package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	types "roast/dtos"

	"google.golang.org/genai"
)

const model = "gemini-2.5-flash"
const maxFilms = 10

var client *genai.Client

func InitGemini() error {
	api := os.Getenv("GEMINI_API_KEY")
	if api == "" {
		return fmt.Errorf("GEMINI_API_KEY not set")
	}
	ctx := context.Background()
	c, err := genai.NewClient(ctx, &genai.ClientConfig{APIKey: api})
	if err != nil {
		return err
	}
	client = c
	return nil
}

func ensureClient() error {
	if client == nil {
		return InitGemini()
	}
	return nil
}

// filmList caps and formats the film list to keep token usage low.
func filmList(films []types.FilmDetails) string {
	if len(films) > maxFilms {
		films = films[:maxFilms]
	}
	var sb strings.Builder
	for _, f := range films {
		sb.WriteString(fmt.Sprintf("- %s (%s)\n", f.FilmName, f.Rating))
	}
	return sb.String()
}

func call(prompt string) (string, error) {
	ctx := context.Background()
	result, err := client.Models.GenerateContent(
		ctx, model, genai.Text(prompt),
		&genai.GenerateContentConfig{ResponseMIMEType: "application/json"},
	)
	if err != nil {
		return "", fmt.Errorf("gemini: %w", err)
	}
	raw := strings.TrimSpace(result.Text())
	return stripFences(raw), nil
}

func GenerateQuestions(films []types.FilmDetails) ([]types.GeneratedQuestion, error) {
	if err := ensureClient(); err != nil {
		return nil, err
	}

	prompt := fmt.Sprintf(
		`Film critic AI. Given these films, write 4 probing questions about the viewer's taste.
Each question must reference specific films/patterns from the list. 4 options each. Witty, slightly judgmental tone.
Films: %s
Return JSON array only: [{"id":"q1","question":"...","options":["...","...","...","..."]},...] (4 items)`,
		filmList(films))

	raw, err := call(prompt)
	if err != nil {
		return nil, err
	}

	var questions []types.GeneratedQuestion
	if err := json.Unmarshal([]byte(raw), &questions); err != nil {
		return nil, fmt.Errorf("parse questions: %w", err)
	}
	return questions, nil
}

func GenerateRoast(films []types.FilmDetails, qa []types.QuestionAnswer) (*types.RoastFmt, error) {
	if err := ensureClient(); err != nil {
		return nil, err
	}

	var qaSB strings.Builder
	for _, item := range qa {
		qaSB.WriteString(fmt.Sprintf("Q: %s | A: %s\n", item.Question, item.Answer))
	}

	prompt := fmt.Sprintf(
		`You are CritSlash, a savage film critic roast comedian. Destroy this person's taste.

Films (recent): %s
Their answers: %s
Write a roast with:
- TITLE: punchy headline, max 10 words, specific to them
- ROAST: 4 paragraphs x 3-4 sentences (200+ words). Para1: overall pattern. Para2: worst choices+ratings. Para3: use their answers against them. Para4: final verdict.
- SCORE: 0-100 integer (most land 20-65, be harsh)

JSON only: {"title":"...","roast":"p1\n\np2\n\np3\n\np4","score":42}`,
		filmList(films), qaSB.String())

	raw, err := call(prompt)
	if err != nil {
		return nil, err
	}

	var roast types.RoastFmt
	if err := json.Unmarshal([]byte(raw), &roast); err != nil {
		return nil, fmt.Errorf("parse roast: %w", err)
	}
	return &roast, nil
}

func stripFences(s string) string {
	if !strings.HasPrefix(s, "```") {
		return s
	}
	lines := strings.Split(s, "\n")
	end := len(lines) - 1
	for end > 0 && strings.TrimSpace(lines[end]) == "```" {
		end--
	}
	return strings.Join(lines[1:end+1], "\n")
}
