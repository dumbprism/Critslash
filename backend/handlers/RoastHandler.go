package handlers

import (
	"net/http"
	types "roast/dtos"
	"roast/utils"

	"github.com/gin-gonic/gin"
)

func RoastHandler(ctx *gin.Context) {
	var req types.RoastRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if len(req.Films) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "no films provided"})
		return
	}

	roast, err := utils.GenerateRoast(req.Films, req.Answers)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, roast)
}
