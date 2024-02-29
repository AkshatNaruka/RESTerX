package pkg

import (
	"fmt"

	"github.com/spf13/cobra"
)

var DeleteCmd = &cobra.Command{
	Use:   "delete <URL>",
	Short: "Send a DELETE request to the specified URL",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		url := args[0]
		// Your DELETE request implementation here
		fmt.Printf("Sending DELETE request to %s\n", url)
	},
}
