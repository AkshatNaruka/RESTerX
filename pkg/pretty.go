package pkg

import (
	"encoding/json"
	"fmt"
)

func pretty_print() {
	jsonStr := `{"name":"John","age":30,"city":"New York"}`
	var objmap map[string]*json.RawMessage
	err := json.Unmarshal([]byte(jsonStr), &objmap)
	if err != nil {
		panic(err)
	}
	pretty, err := json.MarshalIndent(objmap, "", "  ")
	if err != nil {
		panic(err)
	}
	fmt.Println(string(pretty))
}