package pkg

// HandlePatchRequest sends a PATCH request to the specified URL and prints the response
func HandlePatchRequest(url string) {
	response := MakeHTTPRequest("PATCH", url, "", map[string]string{})
	printResponse(response)
}

// MakePatchRequest sends a PATCH request and returns structured response data
func MakePatchRequest(url, body string, headers map[string]string) APIResponse {
	return MakeHTTPRequest("PATCH", url, body, headers)
}