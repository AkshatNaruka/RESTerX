package web

import (
	"fmt"
	"log"
	"net/http"
	"RestCLI/pkg"
	"RestCLI/web/api"
	
	"github.com/gorilla/mux"
)

// StartWebServer starts the enhanced web server on the specified port
func StartWebServer(port string) {
	// Initialize database
	dbPath := "resterx.db"
	if err := pkg.InitDatabase(dbPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create router with enhanced API endpoints
	r := mux.NewRouter()

	// Serve static files
	fs := http.FileServer(http.Dir("web/static/"))
	r.PathPrefix("/").Handler(fs).Methods("GET")

	// API routes with auth middleware
	apiRouter := r.PathPrefix("/api").Subrouter()
	
	// Public endpoints (no auth required)
	apiRouter.HandleFunc("/auth/login", api.LoginHandler).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/auth/register", api.RegisterHandler).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/auth/refresh", api.RefreshTokenHandler).Methods("POST", "OPTIONS")
	
	// Protected endpoints (auth required)
	protected := apiRouter.PathPrefix("").Subrouter()
	protected.Use(api.AuthMiddleware)
	
	// Enhanced API endpoints
	protected.HandleFunc("/request", api.RequestHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/collections", api.CollectionsHandler).Methods("GET", "POST", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/collections/{id}", api.CollectionHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/environments", api.EnvironmentsHandler).Methods("GET", "POST", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/codegen", api.CodeGenHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/mock", api.MockServerHandler).Methods("GET", "POST", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/docs", api.DocumentationHandler).Methods("GET", "POST", "OPTIONS")
	
	// Workspace management
	protected.HandleFunc("/workspaces", api.WorkspacesHandler).Methods("GET", "POST", "OPTIONS")
	protected.HandleFunc("/workspaces/{id}", api.WorkspaceHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/workspaces/{id}/members", api.WorkspaceMembersHandler).Methods("GET", "POST", "DELETE", "OPTIONS")
	protected.HandleFunc("/workspaces/{id}/invite", api.InviteUserHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/workspaces/{id}/stats", api.WorkspaceStatsHandler).Methods("GET", "OPTIONS")
	
	// User management
	protected.HandleFunc("/users/profile", api.UserProfileHandler).Methods("GET", "PUT", "OPTIONS")
	protected.HandleFunc("/users/password", api.ChangePasswordHandler).Methods("PUT", "OPTIONS")
	
	// Testing system
	protected.HandleFunc("/tests/suites", api.TestSuitesHandler).Methods("GET", "POST", "OPTIONS")
	protected.HandleFunc("/tests/suites/{id}", api.TestSuiteHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/tests/suites/{id}/run", api.RunTestSuiteHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/tests/load", api.LoadTestHandler).Methods("POST", "OPTIONS")
	
	// Monitoring system
	protected.HandleFunc("/monitors", api.MonitorsHandler).Methods("GET", "POST", "OPTIONS")
	protected.HandleFunc("/monitors/{id}", api.MonitorHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")
	protected.HandleFunc("/monitors/{id}/stats", api.MonitorStatsHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/monitors/{id}/report", api.UptimeReportHandler).Methods("GET", "OPTIONS")
	
	// Analytics and reporting
	protected.HandleFunc("/analytics/dashboard", api.DashboardHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/analytics/requests", api.RequestAnalyticsHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/analytics/export", api.ExportDataHandler).Methods("GET", "OPTIONS")
	
	// WebSocket for real-time features
	protected.HandleFunc("/ws", api.WebSocketHandler)

	// CORS middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	})

	fmt.Printf("🚀 RESTerX Enterprise Web Server starting on http://localhost:%s\n", port)
	fmt.Println("📡 Enhanced with authentication, workspaces, monitoring, and testing")
	fmt.Println("📊 Features: Team collaboration, API monitoring, performance testing, analytics")
	fmt.Println("🎯 Open your browser and navigate to the URL above")
	
	log.Fatal(http.ListenAndServe(":"+port, r))
}