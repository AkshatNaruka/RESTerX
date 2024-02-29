package pkg

import (
	"fmt"
	"io/ioutil"
	"net/http"

)

// HandleGetRequest sends a GET request to the specified URL and prints the response body
func HandleGetRequest(url string) {
	// Send the GET request
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("Error sending GET request: %s\n", err)
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
