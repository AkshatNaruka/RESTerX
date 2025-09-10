package pkg

// HandlePatchRequest sends a PATCH request to the specified URL and prints the response
func HandlePatchRequest(url string) {
	response := MakeHTTPRequest("PATCH", url, "", map[string]string{})
	printResponse(response)
}

// HandlePatchRequestAdvanced sends a PATCH request with custom headers and body
func HandlePatchRequestAdvanced(url string, headers map[string]string, body string) APIResponse {
	return MakeHTTPRequest("PATCH", url, body, headers)
}

// MakePatchRequest sends a PATCH request and returns structured response data
func MakePatchRequest(url, body string, headers map[string]string) APIResponse {
	return MakeHTTPRequest("PATCH", url, body, headers)
}