package pkg

// HandleDeleteRequest sends a DELETE request to the specified URL and prints the response body
func HandleDeleteRequest(url string) {
	response := MakeHTTPRequest("DELETE", url, "", map[string]string{})
	printResponse(response)
}

// HandleDeleteRequestAdvanced sends a DELETE request with custom headers
func HandleDeleteRequestAdvanced(url string, headers map[string]string) APIResponse {
	return MakeHTTPRequest("DELETE", url, "", headers)
}

// MakeDeleteRequest sends a DELETE request and returns structured response data
func MakeDeleteRequest(url string, headers map[string]string) APIResponse {
	return MakeHTTPRequest("DELETE", url, "", headers)
}
