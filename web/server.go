package web

import (
	"fmt"
	"log"
	"net/http"
	"RestCLI/web/api"
)

// StartWebServer starts the web server on the specified port
func StartWebServer(port string) {
	// Serve static files
	fs := http.FileServer(http.Dir("web/static/"))
	http.Handle("/", fs)

	// API endpoints
	http.HandleFunc("/api/request", api.RequestHandler)
	http.HandleFunc("/api/collections", api.CollectionsHandler)
	http.HandleFunc("/api/environments", api.EnvironmentsHandler)
	http.HandleFunc("/api/codegen", api.CodeGenHandler)

	fmt.Printf("🚀 RESTerX Web Server starting on http://localhost:%s\n", port)
	fmt.Println("📡 Open your browser and navigate to the URL above")
	
	log.Fatal(http.ListenAndServe(":"+port, nil))
}