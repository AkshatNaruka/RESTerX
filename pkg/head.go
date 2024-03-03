package pkg

import (
	"log"
	"net/http"
)

func HandleHeadRequest(url string) {
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		log.Fatal(err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	log.Println("Response status:", resp.Status)
}