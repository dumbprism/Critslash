package handlers

import (
	"net/http"
	types "roast/dtos"
	"roast/utils"

	"github.com/gin-gonic/gin"
)

func RecommendHandler(ctx *gin.Context) {
	var req types.RecommendRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	rec, err := utils.GenerateRecommendation(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, rec)
}
