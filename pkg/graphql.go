package pkg

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// GraphQLService handles GraphQL queries and mutations
type GraphQLService struct {
	client *http.Client
}

// NewGraphQLService creates a new GraphQL service
func NewGraphQLService() *GraphQLService {
	return &GraphQLService{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GraphQLRequest represents a GraphQL request
type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
	OperationName string             `json:"operationName,omitempty"`
}

// GraphQLResponse represents a GraphQL response
type GraphQLResponse struct {
	Data   interface{}            `json:"data"`
	Errors []GraphQLError         `json:"errors,omitempty"`
	Extensions map[string]interface{} `json:"extensions,omitempty"`
}

// GraphQLError represents a GraphQL error
type GraphQLError struct {
	Message   string                 `json:"message"`
	Locations []GraphQLLocation      `json:"locations,omitempty"`
	Path      []interface{}          `json:"path,omitempty"`
	Extensions map[string]interface{} `json:"extensions,omitempty"`
}

// GraphQLLocation represents a location in a GraphQL query
type GraphQLLocation struct {
	Line   int `json:"line"`
	Column int `json:"column"`
}

// GraphQLIntrospection represents GraphQL introspection query result
type GraphQLIntrospection struct {
	Schema GraphQLSchemaInfo `json:"__schema"`
}

// GraphQLSchemaInfo contains basic schema information
type GraphQLSchemaInfo struct {
	Types        []GraphQLTypeInfo `json:"types"`
	QueryType    *GraphQLTypeRef   `json:"queryType"`
	MutationType *GraphQLTypeRef   `json:"mutationType"`
}

// GraphQLTypeInfo contains type information
type GraphQLTypeInfo struct {
	Name        string              `json:"name"`
	Kind        string              `json:"kind"`
	Description string              `json:"description"`
	Fields      []GraphQLFieldInfo  `json:"fields"`
}

// GraphQLFieldInfo contains field information
type GraphQLFieldInfo struct {
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Type        GraphQLTypeRef    `json:"type"`
	Args        []GraphQLArgInfo  `json:"args"`
}

// GraphQLArgInfo contains argument information
type GraphQLArgInfo struct {
	Name         string         `json:"name"`
	Description  string         `json:"description"`
	Type         GraphQLTypeRef `json:"type"`
	DefaultValue interface{}    `json:"defaultValue"`
}

// GraphQLTypeRef represents a type reference
type GraphQLTypeRef struct {
	Kind   string          `json:"kind"`
	Name   string          `json:"name"`
	OfType *GraphQLTypeRef `json:"ofType"`
}

// ExecuteGraphQLQuery executes a GraphQL query against the specified endpoint
func (gql *GraphQLService) ExecuteGraphQLQuery(endpoint string, request GraphQLRequest, headers map[string]string) (*APIResponse, error) {
	startTime := time.Now()

	// Prepare the request body
	requestBody, err := json.Marshal(request)
	if err != nil {
		return &APIResponse{
			Error: fmt.Sprintf("Failed to marshal GraphQL request: %v", err),
		}, err
	}

	// Create HTTP request
	httpReq, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(requestBody))
	if err != nil {
		return &APIResponse{
			Error: fmt.Sprintf("Failed to create HTTP request: %v", err),
		}, err
	}

	// Set default Content-Type for GraphQL
	httpReq.Header.Set("Content-Type", "application/json")

	// Add custom headers
	for key, value := range headers {
		httpReq.Header.Set(key, value)
	}

	// Execute the request
	resp, err := gql.client.Do(httpReq)
	if err != nil {
		return &APIResponse{
			Error: fmt.Sprintf("Request failed: %v", err),
		}, err
	}
	defer resp.Body.Close()

	responseTime := time.Since(startTime)

	// Read response body
	var responseBuffer bytes.Buffer
	_, err = responseBuffer.ReadFrom(resp.Body)
	if err != nil {
		return &APIResponse{
			Error: fmt.Sprintf("Failed to read response: %v", err),
		}, err
	}

	responseBody := responseBuffer.String()

	// Parse GraphQL response to check for errors
	var gqlResp GraphQLResponse
	if err := json.Unmarshal([]byte(responseBody), &gqlResp); err == nil {
		if len(gqlResp.Errors) > 0 {
			// Format GraphQL errors nicely
			var errorMessages []string
			for _, gqlErr := range gqlResp.Errors {
				errorMessages = append(errorMessages, gqlErr.Message)
			}
			// Still return the full response but note the GraphQL errors
			responseBody = fmt.Sprintf("GraphQL Errors: %s\n\nFull Response:\n%s", 
				strings.Join(errorMessages, "; "), responseBody)
		}
	}

	return &APIResponse{
		StatusCode:   resp.StatusCode,
		Status:       resp.Status,
		Headers:      convertHeaders(resp.Header),
		Body:         responseBody,
		ResponseTime: responseTime,
	}, nil
}

// GetIntrospectionQuery returns the GraphQL introspection query
func (gql *GraphQLService) GetIntrospectionQuery() string {
	return `
	query IntrospectionQuery {
		__schema {
			queryType { name }
			mutationType { name }
			subscriptionType { name }
			types {
				...FullType
			}
			directives {
				name
				description
				locations
				args {
					...InputValue
				}
			}
		}
	}

	fragment FullType on __Type {
		kind
		name
		description
		fields(includeDeprecated: true) {
			name
			description
			args {
				...InputValue
			}
			type {
				...TypeRef
			}
			isDeprecated
			deprecationReason
		}
		inputFields {
			...InputValue
		}
		interfaces {
			...TypeRef
		}
		enumValues(includeDeprecated: true) {
			name
			description
			isDeprecated
			deprecationReason
		}
		possibleTypes {
			...TypeRef
		}
	}

	fragment InputValue on __InputValue {
		name
		description
		type { ...TypeRef }
		defaultValue
	}

	fragment TypeRef on __Type {
		kind
		name
		ofType {
			kind
			name
			ofType {
				kind
				name
				ofType {
					kind
					name
					ofType {
						kind
						name
						ofType {
							kind
							name
							ofType {
								kind
								name
								ofType {
									kind
									name
								}
							}
						}
					}
				}
			}
		}
	}`
}

// IntrospectSchema performs GraphQL introspection to get schema information
func (gql *GraphQLService) IntrospectSchema(endpoint string, headers map[string]string) (*GraphQLIntrospection, error) {
	introspectionQuery := gql.GetIntrospectionQuery()
	
	request := GraphQLRequest{
		Query: introspectionQuery,
	}

	resp, err := gql.ExecuteGraphQLQuery(endpoint, request, headers)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("introspection failed with status %d: %s", resp.StatusCode, resp.Body)
	}

	var gqlResp GraphQLResponse
	if err := json.Unmarshal([]byte(resp.Body), &gqlResp); err != nil {
		return nil, fmt.Errorf("failed to parse introspection response: %v", err)
	}

	if len(gqlResp.Errors) > 0 {
		return nil, fmt.Errorf("GraphQL errors in introspection: %v", gqlResp.Errors[0].Message)
	}

	var introspection GraphQLIntrospection
	dataBytes, err := json.Marshal(gqlResp.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal introspection data: %v", err)
	}

	if err := json.Unmarshal(dataBytes, &introspection); err != nil {
		return nil, fmt.Errorf("failed to parse introspection data: %v", err)
	}

	return &introspection, nil
}

// ValidateGraphQLQuery performs basic validation of GraphQL query syntax
func (gql *GraphQLService) ValidateGraphQLQuery(query string) []string {
	var errors []string

	query = strings.TrimSpace(query)
	if query == "" {
		errors = append(errors, "Query cannot be empty")
		return errors
	}

	// Check for balanced braces
	braceCount := 0
	for _, char := range query {
		if char == '{' {
			braceCount++
		} else if char == '}' {
			braceCount--
			if braceCount < 0 {
				errors = append(errors, "Unmatched closing brace }")
				break
			}
		}
	}

	if braceCount > 0 {
		errors = append(errors, "Unmatched opening brace {")
	}

	// Check for GraphQL operation keywords
	queryLower := strings.ToLower(query)
	hasOperation := strings.Contains(queryLower, "query") || 
					strings.Contains(queryLower, "mutation") || 
					strings.Contains(queryLower, "subscription")

	// If no explicit operation, check if it starts with a field (which is valid)
	if !hasOperation {
		trimmed := strings.TrimSpace(query)
		if !strings.HasPrefix(trimmed, "{") {
			errors = append(errors, "Query should start with an operation (query, mutation, subscription) or a selection set {}")
		}
	}

	return errors
}

// FormatGraphQLQuery formats a GraphQL query for better readability
func (gql *GraphQLService) FormatGraphQLQuery(query string) string {
	// Simple formatting - add proper indentation
	lines := strings.Split(query, "\n")
	var formatted []string
	indent := 0
	
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}

		// Decrease indent for closing braces
		if strings.Contains(trimmed, "}") {
			indent--
			if indent < 0 {
				indent = 0
			}
		}

		// Add indentation
		indentStr := strings.Repeat("  ", indent)
		formatted = append(formatted, indentStr+trimmed)

		// Increase indent for opening braces
		if strings.Contains(trimmed, "{") {
			indent++
		}
	}

	return strings.Join(formatted, "\n")
}

// GenerateGraphQLSampleQueries generates sample queries based on schema introspection
func (gql *GraphQLService) GenerateGraphQLSampleQueries(introspection *GraphQLIntrospection) []string {
	var samples []string

	// Generate a simple query for each root field
	if introspection.Schema.QueryType != nil {
		for _, typeInfo := range introspection.Schema.Types {
			if typeInfo.Name == introspection.Schema.QueryType.Name {
				for _, field := range typeInfo.Fields {
					if !strings.HasPrefix(field.Name, "__") { // Skip introspection fields
						query := fmt.Sprintf(`query {
  %s {
    # Add fields here
  }
}`, field.Name)
						samples = append(samples, query)
					}
				}
				break
			}
		}
	}

	// Generate a simple mutation if available
	if introspection.Schema.MutationType != nil {
		samples = append(samples, `mutation {
  # Add mutation here
}`)
	}

	return samples
}