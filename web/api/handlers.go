package api

import (
	"encoding/json"
	"net/http"
	"RestCLI/pkg"
	"strings"
)

// Global instances for collections and variables
var (
	collectionManager = pkg.NewCollectionManager()
	variableResolver  = pkg.NewVariableResolver()
	codeGenerator     = pkg.NewCodeGenerator()
	mockServer        = pkg.NewMockServer("3001") // Mock server on port 3001
)

// RequestHandler handles the API request endpoint
func RequestHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

	switch request.Method {
	case "GET":
		response = pkg.MakeGetRequest(request.URL)
	case "POST":
		response = pkg.MakePostRequest(request.URL, request.Body, request.Headers)
	case "PUT":
		response = pkg.MakePutRequest(request.URL, request.Body, request.Headers)
	case "PATCH":
		response = pkg.MakePatchRequest(request.URL, request.Body, request.Headers)
	case "DELETE":
		response = pkg.MakeDeleteRequest(request.URL, request.Headers)
	case "HEAD":
		response = pkg.MakeHeadRequest(request.URL, request.Headers)
	default:
		http.Error(w, "Unsupported HTTP method", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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