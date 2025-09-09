package pkg

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

// HandleGetRequest sends a GET request to the specified URL and prints the response body
func HandleGetRequest(url string) {
	response := MakeGetRequest(url)
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

// HandleGetRequestAdvanced sends a GET request with headers and returns structured response
func HandleGetRequestAdvanced(url string, headers map[string]string) APIResponse {
	start := time.Now()
	
	// Create HTTP client
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	
	// Create request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return APIResponse{
			Error: err.Error(),
		}
	}
	
	// Add headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	
	// Send request
	resp, err := client.Do(req)
	if err != nil {
		return APIResponse{
			Error:        err.Error(),
			ResponseTime: time.Since(start),
		}
	}
	defer resp.Body.Close()
	
	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return APIResponse{
			StatusCode:   resp.StatusCode,
			Status:       resp.Status,
			Headers:      convertHeaders(resp.Header),
			Error:        err.Error(),
			ResponseTime: time.Since(start),
		}
	}
	
	return APIResponse{
		StatusCode:   resp.StatusCode,
		Status:       resp.Status,
		Headers:      convertHeaders(resp.Header),
		Body:         string(body),
		ResponseTime: time.Since(start),
	}
}

// MakeGetRequest sends a GET request and returns structured response data
func MakeGetRequest(url string) APIResponse {
	start := time.Now()
	
	// Send the GET request
	resp, err := http.Get(url)
	if err != nil {
		return APIResponse{
			Error:        err.Error(),
			ResponseTime: time.Since(start),
		}
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
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
		Body:         string(body),
		ResponseTime: time.Since(start),
	}
}
