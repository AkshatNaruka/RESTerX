package pkg

import (
	"io/ioutil"
	"log"
	"net/http"
)

func HandlePatchRequest(url string) {
	req, err := http.NewRequest("PATCH", url, nil)
	if err != nil {
		log.Fatal(err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	log.Println(string(body))
}