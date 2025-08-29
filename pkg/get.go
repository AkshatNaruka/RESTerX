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
