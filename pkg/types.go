package pkg

import (
	"net/http"
	"time"
)

// APIResponse represents the structured response from an API call
type APIResponse struct {
	StatusCode   int               `json:"statusCode"`
	Status       string            `json:"status"`
	Headers      map[string]string `json:"headers"`
	Body         string            `json:"body"`
	ResponseTime time.Duration     `json:"responseTime"`
	Error        string            `json:"error,omitempty"`
}

// APIRequest represents the request parameters
type APIRequest struct {
	Method  string            `json:"method"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

// convertHeaders converts http.Header to map[string]string
func convertHeaders(headers http.Header) map[string]string {
	result := make(map[string]string)
	for key, values := range headers {
		if len(values) > 0 {
			result[key] = values[0] // Take the first value if multiple exist
		}
	}
	return result
}