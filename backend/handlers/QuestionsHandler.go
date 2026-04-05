package handlers

import (
	"net/http"
	types "roast/dtos"
	"roast/utils"

	"github.com/gin-gonic/gin"
)

func QuestionsHandler(ctx *gin.Context) {
	var films []types.FilmDetails

	if err := ctx.ShouldBindJSON(&films); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if len(films) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "no films provided"})
		return
	}

	questions, err := utils.GenerateQuestions(films)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, questions)
}
