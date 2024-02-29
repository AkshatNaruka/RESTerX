package pkg

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
)

// HandleUpdateRequest sends an UPDATE request to the specified URL and prints the response body
func HandleUpdateRequest(url string) {
	// Example payload, modify as needed
	payload := []byte(`{"key": "updated_value"}`)

	// Send the UPDATE request
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(payload))
	if err != nil {
		fmt.Printf("Error creating UPDATE request: %s\n", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending UPDATE request: %s\n", err)
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
