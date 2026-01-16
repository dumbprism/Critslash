package main

import (
	"roast/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/films/:usrnm", handlers.GetDetails)
	router.Run()
}
