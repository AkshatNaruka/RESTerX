package pkg

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

// HandlePostRequest sends a POST request to the specified URL and prints the response body
func HandlePostRequest(url string) {
	// Example payload, modify as needed
	payload := `{"key": "value"}`
	response := MakePostRequest(url, payload, map[string]string{"Content-Type": "application/json"})
	
	if response.Error != "" {
		fmt.Printf("Error: %s\n", response.Error)
		return
	}

	// Print the response body
	fmt.Printf("Status: %s\n", response.Status)
	fmt.Printf("Response Time: %v\n", response.ResponseTime)
	fmt.Println("Response Body:")
	fmt.Println(response.Body)
}

// MakePostRequest sends a POST request and returns structured response data
func MakePostRequest(url, body string, headers map[string]string) APIResponse {
	start := time.Now()
	
	// Create request
	req, err := http.NewRequest("POST", url, bytes.NewBufferString(body))
	if err != nil {
		return APIResponse{
			Error:        err.Error(),
			ResponseTime: time.Since(start),
		}
	}

	// Set headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return APIResponse{
			Error:        err.Error(),
			ResponseTime: time.Since(start),
		}
	}
	defer resp.Body.Close()

	// Read the response body
	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return APIResponse{
			StatusCode:   resp.StatusCode,
			Status:       resp.Status,
			Headers:      convertHeaders(resp.Header),
			Error:        "Error reading response body: " + err.Error(),
			ResponseTime: time.Since(start),
		}
	}

	return APIResponse{
		StatusCode:   resp.StatusCode,
		Status:       resp.Status,
		Headers:      convertHeaders(resp.Header),
		Body:         string(responseBody),
		ResponseTime: time.Since(start),
	}
}
