package pkg

import (
	"fmt"

	"github.com/spf13/cobra"
)

var PostCmd = &cobra.Command{
	Use:   "post <URL>",
	Short: "Send a POST request to the specified URL",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		url := args[0]
		// Your POST request implementation here
		fmt.Printf("Sending POST request to %s\n", url)
	},
}
