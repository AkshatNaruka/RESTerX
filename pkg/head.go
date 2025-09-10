package pkg

import (
	"fmt"
)

// HandleHeadRequest sends a HEAD request to the specified URL and prints the response
func HandleHeadRequest(url string) {
	response := MakeHTTPRequest("HEAD", url, "", map[string]string{})
	
	if response.Error != "" {
		fmt.Printf("Error: %s\n", response.Error)
		return
	}

	fmt.Printf("Status: %s\n", response.Status)
	fmt.Printf("Response Time: %v\n", response.ResponseTime)
	fmt.Println("Headers:")
	for key, value := range response.Headers {
		fmt.Printf("%s: %s\n", key, value)
	}
}

// HandleHeadRequestAdvanced sends a HEAD request with custom headers
func HandleHeadRequestAdvanced(url string, headers map[string]string) APIResponse {
	return MakeHTTPRequest("HEAD", url, "", headers)
}

// MakeHeadRequest sends a HEAD request and returns structured response data
func MakeHeadRequest(url string, headers map[string]string) APIResponse {
	return MakeHTTPRequest("HEAD", url, "", headers)
}