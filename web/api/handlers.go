package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
	"RestCLI/pkg"
	
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// Global instances for enhanced services
var (
	collectionManager   = pkg.NewCollectionManager()
	variableResolver    = pkg.NewVariableResolver()
	codeGenerator       = pkg.NewCodeGenerator()
	mockServer          = pkg.NewMockServer("3001")
	authService         = pkg.NewAuthService()
	workspaceService    = pkg.NewWorkspaceService()
	testRunner          = pkg.NewTestRunner()
	monitorService      = pkg.NewMonitorService()
	importExportService = pkg.NewImportExportService()
	graphqlService      = pkg.NewGraphQLService()
	responseVisualizer  = pkg.NewResponseVisualizer()
	scriptingEngine     = pkg.NewScriptingEngine()
	sharingService      = pkg.NewSharingService()
	websocketService    = pkg.NewWebSocketService()
	
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow connections from any origin in development
		},
	}
)

// Authentication middleware
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for OPTIONS requests
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		claims, err := authService.ValidateToken(bearerToken[1])
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Add user info to request context
		r.Header.Set("X-User-ID", fmt.Sprintf("%d", claims.UserID))
		r.Header.Set("X-Username", claims.Username)
		r.Header.Set("X-Workspace-ID", fmt.Sprintf("%d", claims.WorkspaceID))

		next.ServeHTTP(w, r)
	})
}

// Auth handlers
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	var req pkg.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	response, err := authService.Login(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	var req pkg.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := authService.Register(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered successfully",
		"user":    user,
	})
}

func RefreshTokenHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	var req map[string]string
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	refreshToken, ok := req["refreshToken"]
	if !ok {
		http.Error(w, "Refresh token required", http.StatusBadRequest)
		return
	}

	newToken, err := authService.RefreshToken(refreshToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token": newToken,
	})
}

// Enhanced request handler
func RequestHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	workspaceID := getWorkspaceID(r)

	var request pkg.APIRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	// Initialize headers if nil
	if request.Headers == nil {
		request.Headers = make(map[string]string)
	}

	var response pkg.APIResponse

	// Resolve variables in URL and body
	request.URL = variableResolver.ResolveVariables(request.URL, "")
	request.Body = variableResolver.ResolveVariables(request.Body, "")

	// Execute request based on method
	switch strings.ToUpper(request.Method) {
	case "GET":
		response = pkg.HandleGetRequestAdvanced(request.URL, request.Headers)
	case "POST":
		response = pkg.HandlePostRequestAdvanced(request.URL, request.Headers, request.Body)
	case "PUT":
		response = pkg.HandlePutRequestAdvanced(request.URL, request.Headers, request.Body)
	case "PATCH":
		response = pkg.HandlePatchRequestAdvanced(request.URL, request.Headers, request.Body)
	case "DELETE":
		response = pkg.HandleDeleteRequestAdvanced(request.URL, request.Headers)
	case "HEAD":
		response = pkg.HandleHeadRequestAdvanced(request.URL, request.Headers)
	default:
		http.Error(w, "Unsupported HTTP method", http.StatusBadRequest)
		return
	}

	// Save to request history
	history := pkg.RequestHistory{
		UserID:       userID,
		WorkspaceID:  workspaceID,
		Method:       request.Method,
		URL:          request.URL,
		Headers:      marshalToJSON(request.Headers),
		Body:         request.Body,
		StatusCode:   response.StatusCode,
		ResponseTime: response.ResponseTime.Milliseconds(),
		Success:      response.StatusCode >= 200 && response.StatusCode < 400,
	}
	pkg.DB.Create(&history)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Workspace handlers
func WorkspacesHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	userID := getUserID(r)

	switch r.Method {
	case "GET":
		workspaces, err := workspaceService.GetUserWorkspaces(userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(workspaces)

	case "POST":
		var req pkg.CreateWorkspaceRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		workspace, err := workspaceService.CreateWorkspace(userID, req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(workspace)
	}
}

func WorkspaceHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	vars := mux.Vars(r)
	workspaceID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}

	userID := getUserID(r)

	switch r.Method {
	case "GET":
		// Get workspace details
		if !workspaceService.HasWorkspaceAccess(userID, uint(workspaceID)) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}
		
		var workspace pkg.Workspace
		if err := pkg.DB.First(&workspace, workspaceID).Error; err != nil {
			http.Error(w, "Workspace not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(workspace)

	case "PUT":
		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := workspaceService.UpdateWorkspace(uint(workspaceID), userID, updates); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Workspace updated successfully"})

	case "DELETE":
		if err := workspaceService.DeleteWorkspace(uint(workspaceID), userID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Workspace deleted successfully"})
	}
}

// Testing handlers
func TestSuitesHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	switch r.Method {
	case "GET":
		// Get all test suites for workspace
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]pkg.TestSuite{})

	case "POST":
		var suite pkg.TestSuite
		if err := json.NewDecoder(r.Body).Decode(&suite); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Save test suite logic would go here
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(suite)
	}
}

func RunTestSuiteHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var suite pkg.TestSuite
	if err := json.NewDecoder(r.Body).Decode(&suite); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Run test suite
	result := testRunner.RunTestSuite(suite)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func LoadTestHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var config pkg.LoadTestConfig
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Run load test
	result := testRunner.RunLoadTest(config)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Monitoring handlers
func MonitorsHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	userID := getUserID(r)
	workspaceID := getWorkspaceID(r)

	switch r.Method {
	case "GET":
		monitors, err := monitorService.GetWorkspaceMonitors(workspaceID, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(monitors)

	case "POST":
		var monitor pkg.APIMonitor
		if err := json.NewDecoder(r.Body).Decode(&monitor); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		createdMonitor, err := monitorService.CreateMonitor(workspaceID, userID, monitor)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(createdMonitor)
	}
}

func MonitorStatsHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	vars := mux.Vars(r)
	monitorID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid monitor ID", http.StatusBadRequest)
		return
	}

	userID := getUserID(r)

	stats, err := monitorService.GetMonitorStats(uint(monitorID), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// WebSocket handler for real-time features
func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	// Handle WebSocket connections for real-time monitoring, collaboration, etc.
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Echo message back (placeholder for real-time features)
		if err := conn.WriteMessage(messageType, message); err != nil {
			break
		}
	}
}

// CollectionsHandler handles collection-related operations
func CollectionsHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "GET":
		// Get all workspaces and collections
		workspaces := collectionManager.GetWorkspaces()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(workspaces)
	case "POST":
		// Create new collection
		var req struct {
			WorkspaceID string `json:"workspaceId"`
			Name        string `json:"name"`
			Description string `json:"description"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON request", http.StatusBadRequest)
			return
		}

		collection, err := collectionManager.CreateCollection(req.WorkspaceID, req.Name, req.Description)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(collection)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// EnvironmentsHandler handles environment operations
func EnvironmentsHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "POST":
		// Set active environment or create new environment
		var req struct {
			Action      string            `json:"action"` // "setActive" or "create"
			EnvironmentID string          `json:"environmentId"`
			Name        string            `json:"name"`
			Variables   map[string]string `json:"variables"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON request", http.StatusBadRequest)
			return
		}

		if req.Action == "setActive" {
			variableResolver.SetActiveEnvironment(req.EnvironmentID)
			w.WriteHeader(http.StatusOK)
		} else if req.Action == "create" {
			env := &pkg.Environment{
				ID:        generateID(),
				Name:      req.Name,
				Variables: req.Variables,
				Active:    false,
			}
			variableResolver.AddEnvironment(env)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(env)
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// generateID generates a simple ID
func generateID() string {
	return strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(pkg.NewVariableResolver().ResolveVariables("{{timestamp}}", ""), ":", ""), "-", ""), " ", "")
}

// CodeGenHandler handles code generation requests
func CodeGenHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Request  pkg.APIRequest `json:"request"`
		Language string         `json:"language"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	code := codeGenerator.GenerateCode(req.Request, req.Language)
	
	response := map[string]string{
		"code":     code,
		"language": req.Language,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// MockServerHandler handles mock server operations
func MockServerHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "GET":
		// Get all mock endpoints
		endpoints := mockServer.GetEndpoints()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(endpoints)
	case "POST":
		// Create new mock endpoint
		var endpoint pkg.MockEndpoint
		if err := json.NewDecoder(r.Body).Decode(&endpoint); err != nil {
			http.Error(w, "Invalid JSON request", http.StatusBadRequest)
			return
		}

		mockServer.AddEndpoint(&endpoint)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(endpoint)
	case "DELETE":
		// Delete mock endpoint
		var req struct {
			Method string `json:"method"`
			Path   string `json:"path"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON request", http.StatusBadRequest)
			return
		}

		mockServer.RemoveEndpoint(req.Method, req.Path)
		w.WriteHeader(http.StatusOK)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// DocumentationHandler generates API documentation
func DocumentationHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	format := r.URL.Query().Get("format")
	
	switch format {
	case "openapi":
		openapi := mockServer.ExportOpenAPI()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(openapi)
	default:
		// Return markdown documentation
		doc := mockServer.GenerateDocumentation()
		w.Header().Set("Content-Type", "text/markdown")
		w.Write([]byte(doc))
	}
}

// Helper functions
func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func getUserID(r *http.Request) uint {
	userIDStr := r.Header.Get("X-User-ID")
	userID, _ := strconv.ParseUint(userIDStr, 10, 32)
	return uint(userID)
}

func getWorkspaceID(r *http.Request) uint {
	workspaceIDStr := r.Header.Get("X-Workspace-ID")
	workspaceID, _ := strconv.ParseUint(workspaceIDStr, 10, 32)
	return uint(workspaceID)
}

func marshalToJSON(data interface{}) string {
	bytes, _ := json.Marshal(data)
	return string(bytes)
}

// Placeholder handlers for new features
func CollectionHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func WorkspaceMembersHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func InviteUserHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func WorkspaceStatsHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func UserProfileHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func ChangePasswordHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func TestSuiteHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func MonitorHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func UptimeReportHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func DashboardHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func RequestAnalyticsHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }
func ExportDataHandler(w http.ResponseWriter, r *http.Request) { setCORSHeaders(w) }

// Import/Export Handlers

// ImportCollectionHandler handles importing collections from various formats
func ImportCollectionHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Format string `json:"format"` // postman, openapi, curl
		Data   string `json:"data"`   // The data to import
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	var collection *pkg.Collection
	var err error

	switch strings.ToLower(req.Format) {
	case "postman":
		collection, err = importExportService.ImportPostmanCollection([]byte(req.Data))
	case "openapi":
		collection, err = importExportService.ImportFromOpenAPI([]byte(req.Data))
	case "curl":
		// For cURL, import as single request collection
		apiRequest, curlErr := importExportService.ImportFromCURL(req.Data)
		if curlErr != nil {
			err = curlErr
		} else {
			savedRequest := pkg.SavedRequest{
				ID:        fmt.Sprintf("curl_%d", time.Now().Unix()),
				Name:      "Imported from cURL",
				Method:    apiRequest.Method,
				URL:       apiRequest.URL,
				Headers:   apiRequest.Headers,
				Body:      apiRequest.Body,
				CreatedAt: time.Now(),
			}
			collection = &pkg.Collection{
				ID:          fmt.Sprintf("collection_%d", time.Now().Unix()),
				Name:        "Imported from cURL",
				Description: "Collection imported from cURL command",
				Variables:   make(map[string]string),
				Requests:    []pkg.SavedRequest{savedRequest},
				CreatedAt:   time.Now(),
			}
		}
	default:
		http.Error(w, "Unsupported format", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, fmt.Sprintf("Import failed: %v", err), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collection)
}

// ExportCollectionHandler handles exporting collections to various formats
func ExportCollectionHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Format     string          `json:"format"`     // postman, openapi
		Collection *pkg.Collection `json:"collection"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	var result interface{}
	var err error

	switch strings.ToLower(req.Format) {
	case "postman":
		result, err = importExportService.ExportToPostmanCollection(req.Collection)
	default:
		http.Error(w, "Unsupported export format", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, fmt.Sprintf("Export failed: %v", err), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GraphQL Handlers

// GraphQLHandler handles GraphQL query execution
func GraphQLHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Endpoint string                 `json:"endpoint"`
		Query    string                 `json:"query"`
		Variables map[string]interface{} `json:"variables"`
		Headers   map[string]string      `json:"headers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	gqlRequest := pkg.GraphQLRequest{
		Query:     req.Query,
		Variables: req.Variables,
	}

	response, err := graphqlService.ExecuteGraphQLQuery(req.Endpoint, gqlRequest, req.Headers)
	if err != nil {
		http.Error(w, fmt.Sprintf("GraphQL execution failed: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GraphQLIntrospectionHandler handles GraphQL schema introspection
func GraphQLIntrospectionHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Endpoint string            `json:"endpoint"`
		Headers  map[string]string `json:"headers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	introspection, err := graphqlService.IntrospectSchema(req.Endpoint, req.Headers)
	if err != nil {
		http.Error(w, fmt.Sprintf("Introspection failed: %v", err), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(introspection)
}

// GraphQLValidateHandler validates GraphQL queries
func GraphQLValidateHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	errors := graphqlService.ValidateGraphQLQuery(req.Query)
	
	response := map[string]interface{}{
		"valid":  len(errors) == 0,
		"errors": errors,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Response Analysis Handlers

// AnalyzeResponseHandler provides detailed response analysis
func AnalyzeResponseHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var response pkg.APIResponse
	if err := json.NewDecoder(r.Body).Decode(&response); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	analysis := responseVisualizer.AnalyzeResponse(&response)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysis)
}

// CompareResponsesHandler compares two API responses
func CompareResponsesHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Response1 pkg.APIResponse `json:"response1"`
		Response2 pkg.APIResponse `json:"response2"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	comparison := responseVisualizer.CompareResponses(&req.Response1, &req.Response2)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comparison)
}

// FormatResponseHandler formats response based on content type
func FormatResponseHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Body        string `json:"body"`
		ContentType string `json:"contentType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	var formatted string
	var err error

	if strings.Contains(strings.ToLower(req.ContentType), "application/json") {
		formatted, err = responseVisualizer.FormatJSONResponse(req.Body)
	} else {
		formatted = req.Body // Return as-is for other types
	}

	response := map[string]interface{}{
		"formatted": formatted,
		"error":     nil,
	}

	if err != nil {
		response["error"] = err.Error()
		response["formatted"] = req.Body // Return original on error
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Scripting Handlers

// ExecuteScriptHandler executes pre-request or post-request scripts
func ExecuteScriptHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Script  string            `json:"script"`
		Type    string            `json:"type"` // "pre-request" or "post-request"
		Context pkg.ScriptContext `json:"context"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	var result *pkg.ScriptResult
	if req.Type == "pre-request" {
		result = scriptingEngine.ExecutePreRequestScript(req.Script, &req.Context)
	} else {
		result = scriptingEngine.ExecutePostRequestScript(req.Script, &req.Context)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ValidateScriptHandler validates script syntax
func ValidateScriptHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Script string `json:"script"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	errors := scriptingEngine.ValidateScript(req.Script)

	response := map[string]interface{}{
		"valid":  len(errors) == 0,
		"errors": errors,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetScriptExamplesHandler returns script examples
func GetScriptExamplesHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	examples := scriptingEngine.GetScriptExamples()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(examples)
}

// Sharing Handlers

// CreateShareHandler creates a new shared item
func CreateShareHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == 0 {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	var req pkg.ShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	response, err := sharingService.CreateShare(&req, fmt.Sprintf("user_%d", userID))
	if err != nil {
		http.Error(w, fmt.Sprintf("Share creation failed: %v", err), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetShareHandler retrieves a shared item
func GetShareHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	shareID := vars["id"]
	password := r.URL.Query().Get("password")

	sharedItem, err := sharingService.GetShare(shareID, password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sharedItem)
}

// ListUserSharesHandler lists user's shared items
func ListUserSharesHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := getUserID(r)
	if userID == 0 {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	shares := sharingService.ListUserShares(fmt.Sprintf("user_%d", userID))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shares)
}

// WebSocket Handlers

// WebSocketConnectHandler handles WebSocket connection requests
func WebSocketConnectHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req pkg.WebSocketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	connection, err := websocketService.Connect(&req)
	if err != nil {
		http.Error(w, fmt.Sprintf("WebSocket connection failed: %v", err), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(connection)
}

// WebSocketSendHandler sends a message through WebSocket
func WebSocketSendHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ConnectionID string `json:"connectionId"`
		Message      string `json:"message"`
		MessageType  string `json:"messageType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	err := websocketService.SendMessage(req.ConnectionID, req.Message, req.MessageType)
	if err != nil {
		http.Error(w, fmt.Sprintf("Send message failed: %v", err), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Message sent successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// WebSocketConnectionHandler gets connection details
func WebSocketConnectionHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	connID := vars["id"]

	connection, err := websocketService.GetConnection(connID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(connection)
}

// WebSocketCloseHandler closes a WebSocket connection
func WebSocketCloseHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "DELETE" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	connID := vars["id"]

	err := websocketService.CloseConnection(connID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Connection closed successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// WebSocketTestHandler tests WebSocket endpoint
func WebSocketTestHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		URL     string        `json:"url"`
		Timeout time.Duration `json:"timeout"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request", http.StatusBadRequest)
		return
	}

	if req.Timeout == 0 {
		req.Timeout = 10 * time.Second
	}

	result := websocketService.TestWebSocketEndpoint(req.URL, req.Timeout)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}