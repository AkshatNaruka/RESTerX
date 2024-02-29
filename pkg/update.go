package pkg

import (
	"fmt"

	"github.com/spf13/cobra"
)

var UpdateCmd = &cobra.Command{
	Use:   "update <URL>",
	Short: "Send a PUT request to the specified URL",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		url := args[0]
		// Your PUT request implementation here
		fmt.Printf("Sending PUT request to %s\n", url)
	},
}
