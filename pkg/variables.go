package pkg

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

// VariableResolver handles environment and collection variables
type VariableResolver struct {
	environments map[string]*Environment
	collections  map[string]*Collection
	activeEnv    string
}

// NewVariableResolver creates a new variable resolver
func NewVariableResolver() *VariableResolver {
	return &VariableResolver{
		environments: make(map[string]*Environment),
		collections:  make(map[string]*Collection),
	}
}

// SetActiveEnvironment sets the active environment
func (vr *VariableResolver) SetActiveEnvironment(envID string) {
	vr.activeEnv = envID
}

// AddEnvironment adds an environment
func (vr *VariableResolver) AddEnvironment(env *Environment) {
	vr.environments[env.ID] = env
}

// AddCollection adds a collection for variable resolution
func (vr *VariableResolver) AddCollection(collection *Collection) {
	vr.collections[collection.ID] = collection
}

// ResolveVariables resolves variables in a string
func (vr *VariableResolver) ResolveVariables(input string, collectionID string) string {
	// Pattern to match {{variable_name}}
	pattern := regexp.MustCompile(`\{\{([^}]+)\}\}`)
	
	return pattern.ReplaceAllStringFunc(input, func(match string) string {
		// Extract variable name
		varName := strings.Trim(match, "{}")
		varName = strings.TrimSpace(varName)
		
		// Look in active environment first
		if vr.activeEnv != "" {
			if env, exists := vr.environments[vr.activeEnv]; exists {
				if value, found := env.Variables[varName]; found {
					return value
				}
			}
		}
		
		// Look in collection variables
		if collectionID != "" {
			if collection, exists := vr.collections[collectionID]; exists {
				if value, found := collection.Variables[varName]; found {
					return value
				}
			}
		}
		
		// Check for built-in variables
		if value := vr.getBuiltInVariable(varName); value != "" {
			return value
		}
		
		// Return original if not found
		return match
	})
}

// getBuiltInVariable returns built-in dynamic variables
func (vr *VariableResolver) getBuiltInVariable(varName string) string {
	now := time.Now()
	
	switch varName {
	case "timestamp":
		return fmt.Sprintf("%d", now.Unix())
	case "timestamp_ms":
		return fmt.Sprintf("%d", now.UnixNano()/int64(time.Millisecond))
	case "datetime":
		return now.Format("2006-01-02T15:04:05Z07:00")
	case "date":
		return now.Format("2006-01-02")
	case "time":
		return now.Format("15:04:05")
	case "uuid":
		return generateUUID()
	case "random_int":
		return fmt.Sprintf("%d", now.UnixNano()%1000000)
	default:
		return ""
	}
}

// generateUUID generates a simple UUID-like string
func generateUUID() string {
	now := time.Now()
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		now.Unix(),
		now.Nanosecond()&0xFFFF,
		now.Nanosecond()>>16&0xFFFF,
		now.Nanosecond()>>32&0xFFFF,
		now.UnixNano()&0xFFFFFFFFFFFF,
	)
}

// ValidateVariables checks for undefined variables
func (vr *VariableResolver) ValidateVariables(input string, collectionID string) []string {
	pattern := regexp.MustCompile(`\{\{([^}]+)\}\}`)
	matches := pattern.FindAllStringSubmatch(input, -1)
	
	var undefined []string
	
	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		
		varName := strings.TrimSpace(match[1])
		found := false
		
		// Check active environment
		if vr.activeEnv != "" {
			if env, exists := vr.environments[vr.activeEnv]; exists {
				if _, found = env.Variables[varName]; found {
					continue
				}
			}
		}
		
		// Check collection variables
		if collectionID != "" {
			if collection, exists := vr.collections[collectionID]; exists {
				if _, found = collection.Variables[varName]; found {
					continue
				}
			}
		}
		
		// Check built-in variables
		if vr.getBuiltInVariable(varName) != "" {
			continue
		}
		
		// Variable not found
		undefined = append(undefined, varName)
	}
	
	return undefined
}