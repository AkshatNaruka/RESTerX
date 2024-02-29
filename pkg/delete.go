package pkg

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

// HandleDeleteRequest sends a DELETE request to the specified URL and prints the response body
func HandleDeleteRequest(url string) {
	// Send the DELETE request
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		fmt.Printf("Error creating DELETE request: %s\n", err)
		return
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending DELETE request: %s\n", err)
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
