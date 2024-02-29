package pkg

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"bytes"
)

// HandlePostRequest sends a POST request to the specified URL and prints the response body
func HandlePostRequest(url string) {
	// Example payload, modify as needed
	payload := []byte(`{"key": "value"}`)

	// Send the POST request
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		fmt.Printf("Error sending POST request: %s\n", err)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %s\n", err)
		return
	}

	// Print the response body
	fmt.Println("Response Body:")
	fmt.Println(string(body))
}
