package main

import (
	"fmt"
	"os"

	"RestCLI/pkg"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "RESTCLI",
	Short: "A simple CLI tool for testing APIs",
	Run: func(cmd *cobra.Command, args []string) {
		startInteractiveMenu()
	},
}

func init() {
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func startInteractiveMenu() {
	for {
		prompt := promptui.Select{
			Label: "Select an HTTP method",
			Items: []string{"GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "Exit"},
		}

		_, choice, err := prompt.Run()

		if err != nil {
			fmt.Printf("Prompt failed: %v\n", err)
			os.Exit(1)
		}

		switch choice {
		case "GET":
			fmt.Println("Selected GET method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandleGetRequest(getURL)
		case "POST":
			fmt.Println("Selected POST method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandlePostRequest(getURL)
		case "PUT":
			fmt.Println("Selected PUT method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandlePutRequest(getURL)
		case "PATCH":
			fmt.Println("Selected PATCH method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandlePatchRequest(getURL)
		case "HEAD":
			fmt.Println("Selected HEAD method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandleHeadRequest(getURL)
		case "DELETE":
			fmt.Println("Selected DELETE method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandleDeleteRequest(getURL)
			// Call function to handle DELETE requests
		case "Exit":
			fmt.Println("Exiting...")
			os.Exit(0)
		}
	}
}

func promptURL() string {
	prompt := promptui.Prompt{
		Label: "Enter URL:",
	}

	url, err := prompt.Run()
	if err != nil {
		fmt.Printf("Prompt failed: %v\n", err)
		os.Exit(1)
	}

	return url
}
