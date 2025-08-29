package pkg

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"time"
)

// MakeHTTPRequest sends an HTTP request with the specified method and returns structured response data
func MakeHTTPRequest(method, url, body string, headers map[string]string) APIResponse {
	start := time.Now()
	
	// Create request
	var req *http.Request
	var err error
	
	if body != "" {
		req, err = http.NewRequest(method, url, bytes.NewBufferString(body))
	} else {
		req, err = http.NewRequest(method, url, nil)
	}
	
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