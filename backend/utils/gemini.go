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
		`You are CritSlash, a funny film critic AI. Look at these films and write 4 questions to learn more about this person's taste.

Rules:
- Each question must mention specific films or patterns you see in the list.
- Each question has exactly 4 answer options.
- Use simple, everyday language. No fancy words.
- Be funny and a little cheeky, like a friend who watches a lot of films.

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
		`You are CritSlash, a funny film critic AI that roasts people's movie taste in a fun way.

Films watched: %s
Their answers: %s

Write a roast using simple, everyday language that anyone can understand. No fancy words or complex sentences. Be funny, direct, and specific — like a friend who has seen too many films and is judging you for it.

- TITLE: 3 to 4 words max. Short and punchy. Something like "Chaos in a Cinema" or "Total Film Disaster".
- ROAST: 4 paragraphs, 3-4 sentences each (200+ words total). Para1: what their film choices say about them overall. Para2: their worst or funniest choices and ratings. Para3: use their answers to make fun of them specifically. Para4: a funny final summary of who they are as a film watcher.
- SCORE: a number from 0 to 100 for their film taste. Most people get 20-65. Be tough but fair.

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
