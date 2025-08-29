package api

import (
	"encoding/json"
	"net/http"
	"RestCLI/pkg"
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