package main

import (
	"fmt"
	"os"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"RestCLI/pkg"
)

var rootCmd = &cobra.Command{
	Use:   "api-tester",
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
			Items: []string{"GET", "POST", "UPDATE", "DELETE", "Exit"},
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
			// Call function to handle POST requests
		case "UPDATE":
			fmt.Println("Selected UPDATE method")
			getURL := promptURL()
			if getURL == "" {
				fmt.Println("URL cannot be empty")
				break
			}
			pkg.HandleUpdateRequest(getURL)
			// Call function to handle UPDATE requests
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
