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

func GenerateRoast(films []types.FilmDetails, answers map[string]string) (*types.RoastFmt, error) {
	if client == nil {
		if err := InitGemini(); err != nil {
			return nil, err
		}
	}

	var filmSB strings.Builder
	for _, film := range films {
		filmSB.WriteString(fmt.Sprintf("- %s (Rating: %s)\n", film.FilmName, film.Rating))
	}

	var answerSB strings.Builder
	for q, a := range answers {
		answerSB.WriteString(fmt.Sprintf("- %s → \"%s\"\n", q, a))
	}

	prompt := fmt.Sprintf(`You are CritSlash — a ruthless, razor-tongued film critic AI built specifically to destroy people's egos through their movie taste.
You are the Gordon Ramsay of film criticism: encyclopedic knowledge, zero tolerance for mediocrity, and a gift for the devastatingly specific insult.
You do not summarise. You do not pad. Every sentence lands. Think of a roast comedian who watched 10,000 films and kept score on everyone.

Here is what you know about this person:

FILMS THEY RECENTLY WATCHED:
%s
ANSWERS THEY GAVE:
%s

Write a LONG, thorough roast using BOTH their films AND their answers. Follow these rules exactly:

TITLE: One punchy, devastating headline (max 10 words). Specific to this person. No generics.

ROAST: Write 4 full paragraphs. Each paragraph must be 3-4 sentences. Total word count must exceed 200 words.
- Paragraph 1: Open with a big-swing observation about the overall pattern in their watch history. Name specific films.
- Paragraph 2: Dig into their worst or most embarrassing choices. Be precise and merciless. Quote their ratings against them.
- Paragraph 3: Weave in their survey answers. Show how their answers confirm what their film choices already revealed about them. Be specific and personal.
- Paragraph 4: Close with a final verdict that sums up their entire cinematic identity in the most unflattering terms possible, but leave them laughing.

SCORE: An integer 0-100. 0 is catastrophic, 100 is a cinephile god. Most people land 20-65. Factor in both films and answers. Be harsh but fair.

Return ONLY a JSON object: { "title": "...", "roast": "...", "score": 42 }
The "roast" field must contain all 4 paragraphs separated by a blank line (\n\n). No markdown. No extra keys.`,
		filmSB.String(), answerSB.String())

	ctx := context.Background()
	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
		genai.Text(prompt),
		&genai.GenerateContentConfig{
			ResponseMIMEType: "application/json",
		},
	)
	if err != nil {
		return nil, fmt.Errorf("gemini error: %w", err)
	}

	raw := strings.TrimSpace(result.Text())

	// Strip accidental markdown fences just in case
	if strings.HasPrefix(raw, "```") {
		lines := strings.Split(raw, "\n")
		end := len(lines) - 1
		for end > 0 && strings.TrimSpace(lines[end]) == "```" {
			end--
		}
		raw = strings.Join(lines[1:end+1], "\n")
	}

	var roast types.RoastFmt
	if err := json.Unmarshal([]byte(raw), &roast); err != nil {
		return nil, fmt.Errorf("failed to parse gemini response: %w\nraw: %s", err, raw)
	}

	return &roast, nil
}
