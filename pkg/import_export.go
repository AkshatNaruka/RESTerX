package pkg

import (
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// ImportExportService handles importing and exporting of various API testing formats
type ImportExportService struct{}

// NewImportExportService creates a new import/export service
func NewImportExportService() *ImportExportService {
	return &ImportExportService{}
}

// PostmanCollection represents a Postman collection structure
type PostmanCollection struct {
	Info PostmanInfo   `json:"info"`
	Item []PostmanItem `json:"item"`
}

type PostmanInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Schema      string `json:"schema"`
}

type PostmanItem struct {
	Name    string         `json:"name"`
	Request *PostmanRequest `json:"request,omitempty"`
	Item    []PostmanItem  `json:"item,omitempty"`
}

type PostmanRequest struct {
	Method string                 `json:"method"`
	Header []PostmanHeader        `json:"header"`
	Body   *PostmanBody           `json:"body,omitempty"`
	URL    interface{}            `json:"url"`
	Auth   map[string]interface{} `json:"auth,omitempty"`
}

type PostmanHeader struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Type  string `json:"type,omitempty"`
}

type PostmanBody struct {
	Mode string      `json:"mode"`
	Raw  string      `json:"raw,omitempty"`
	FormData []PostmanFormData `json:"formdata,omitempty"`
}

type PostmanFormData struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Type  string `json:"type"`
}

// OpenAPISpec represents an OpenAPI specification
type OpenAPISpec struct {
	OpenAPI string                 `json:"openapi"`
	Info    OpenAPIInfo            `json:"info"`
	Servers []OpenAPIServer        `json:"servers"`
	Paths   map[string]interface{} `json:"paths"`
}

type OpenAPIInfo struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Version     string `json:"version"`
}

type OpenAPIServer struct {
	URL         string `json:"url"`
	Description string `json:"description"`
}

// ImportPostmanCollection imports a Postman collection and converts to RESTerX format
func (ies *ImportExportService) ImportPostmanCollection(collectionData []byte) (*Collection, error) {
	var postmanCollection PostmanCollection
	if err := json.Unmarshal(collectionData, &postmanCollection); err != nil {
		return nil, fmt.Errorf("invalid Postman collection format: %v", err)
	}

	collection := &Collection{
		ID:          generateCollectionID(),
		Name:        postmanCollection.Info.Name,
		Description: postmanCollection.Info.Description,
		Variables:   make(map[string]string),
		Requests:    []SavedRequest{},
		CreatedAt:   time.Now(),
	}

	// Convert Postman items to RESTerX requests
	ies.convertPostmanItems(postmanCollection.Item, collection, "")

	return collection, nil
}

func (ies *ImportExportService) convertPostmanItems(items []PostmanItem, collection *Collection, prefix string) {
	for _, item := range items {
		if item.Request != nil {
			// This is a request item
			request := ies.convertPostmanRequest(item, prefix)
			collection.Requests = append(collection.Requests, request)
		} else if len(item.Item) > 0 {
			// This is a folder, recurse into it
			folderPrefix := item.Name
			if prefix != "" {
				folderPrefix = prefix + "/" + item.Name
			}
			ies.convertPostmanItems(item.Item, collection, folderPrefix)
		}
	}
}

func (ies *ImportExportService) convertPostmanRequest(item PostmanItem, prefix string) SavedRequest {
	req := item.Request
	
	// Convert URL
	var urlStr string
	switch v := req.URL.(type) {
	case string:
		urlStr = v
	case map[string]interface{}:
		if raw, ok := v["raw"].(string); ok {
			urlStr = raw
		}
	}

	// Convert headers
	headers := make(map[string]string)
	for _, header := range req.Header {
		headers[header.Key] = header.Value
	}

	// Convert body
	var body string
	if req.Body != nil {
		switch req.Body.Mode {
		case "raw":
			body = req.Body.Raw
		case "formdata":
			// Convert form data to URL encoded format
			var formParts []string
			for _, field := range req.Body.FormData {
				formParts = append(formParts, url.QueryEscape(field.Key)+"="+url.QueryEscape(field.Value))
			}
			body = strings.Join(formParts, "&")
			headers["Content-Type"] = "application/x-www-form-urlencoded"
		}
	}

	name := item.Name
	if prefix != "" {
		name = prefix + "/" + item.Name
	}

	return SavedRequest{
		ID:        fmt.Sprintf("req_%d", time.Now().UnixNano()),
		Name:      name,
		Method:    req.Method,
		URL:       urlStr,
		Headers:   headers,
		Body:      body,
		CreatedAt: time.Now(),
	}
}

// ExportToPostmanCollection exports RESTerX collection to Postman format
func (ies *ImportExportService) ExportToPostmanCollection(collection *Collection) (*PostmanCollection, error) {
	postmanCollection := &PostmanCollection{
		Info: PostmanInfo{
			Name:        collection.Name,
			Description: collection.Description,
			Schema:      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		},
		Item: []PostmanItem{},
	}

	// Convert requests to Postman items
	for _, req := range collection.Requests {
		item := ies.convertToPostmanItem(req)
		postmanCollection.Item = append(postmanCollection.Item, item)
	}

	return postmanCollection, nil
}

func (ies *ImportExportService) convertToPostmanItem(req SavedRequest) PostmanItem {
	headers := []PostmanHeader{}
	for key, value := range req.Headers {
		headers = append(headers, PostmanHeader{
			Key:   key,
			Value: value,
			Type:  "text",
		})
	}

	var body *PostmanBody
	if req.Body != "" {
		contentType := req.Headers["Content-Type"]
		if strings.Contains(contentType, "application/x-www-form-urlencoded") {
			// Convert URL encoded to form data
			formData := []PostmanFormData{}
			pairs := strings.Split(req.Body, "&")
			for _, pair := range pairs {
				parts := strings.SplitN(pair, "=", 2)
				if len(parts) == 2 {
					key, _ := url.QueryUnescape(parts[0])
					value, _ := url.QueryUnescape(parts[1])
					formData = append(formData, PostmanFormData{
						Key:   key,
						Value: value,
						Type:  "text",
					})
				}
			}
			body = &PostmanBody{
				Mode:     "formdata",
				FormData: formData,
			}
		} else {
			body = &PostmanBody{
				Mode: "raw",
				Raw:  req.Body,
			}
		}
	}

	return PostmanItem{
		Name: req.Name,
		Request: &PostmanRequest{
			Method: req.Method,
			Header: headers,
			Body:   body,
			URL:    req.URL,
		},
	}
}

// ImportFromCURL imports a cURL command and converts to RESTerX request
func (ies *ImportExportService) ImportFromCURL(curlCommand string) (*APIRequest, error) {
	// Parse cURL command using regex patterns
	request := &APIRequest{
		Headers: make(map[string]string),
		Method:  "GET", // default
	}

	// Extract URL
	urlPattern := regexp.MustCompile(`curl\s+(?:-[^\s]*\s+)*['"]?([^'"\s]+)['"]?`)
	if matches := urlPattern.FindStringSubmatch(curlCommand); len(matches) > 1 {
		request.URL = strings.Trim(matches[1], `'"`)
	}

	// Extract method
	methodPattern := regexp.MustCompile(`-X\s+([A-Z]+)`)
	if matches := methodPattern.FindStringSubmatch(curlCommand); len(matches) > 1 {
		request.Method = matches[1]
	}

	// Extract headers
	headerPattern := regexp.MustCompile(`-H\s+['"]([^:]+):\s*([^'"]*?)['"]`)
	headerMatches := headerPattern.FindAllStringSubmatch(curlCommand, -1)
	for _, match := range headerMatches {
		if len(match) >= 3 {
			request.Headers[match[1]] = match[2]
		}
	}

	// Extract data/body
	dataPattern := regexp.MustCompile(`(?:-d|--data)\s+['"]([^'"]*)['"]`)
	if matches := dataPattern.FindStringSubmatch(curlCommand); len(matches) > 1 {
		request.Body = matches[1]
		if request.Method == "GET" {
			request.Method = "POST" // Assume POST if data is present
		}
	}

	if request.URL == "" {
		return nil, fmt.Errorf("no URL found in cURL command")
	}

	return request, nil
}

// ImportFromOpenAPI imports an OpenAPI specification and creates a collection
func (ies *ImportExportService) ImportFromOpenAPI(specData []byte) (*Collection, error) {
	var spec OpenAPISpec
	if err := json.Unmarshal(specData, &spec); err != nil {
		return nil, fmt.Errorf("invalid OpenAPI specification: %v", err)
	}

	collection := &Collection{
		ID:          generateCollectionID(),
		Name:        spec.Info.Title,
		Description: spec.Info.Description,
		Variables:   make(map[string]string),
		Requests:    []SavedRequest{},
		CreatedAt:   time.Now(),
	}

	// Get base URL from servers
	baseURL := ""
	if len(spec.Servers) > 0 {
		baseURL = spec.Servers[0].URL
	}

	// Convert paths to requests
	for path, pathItem := range spec.Paths {
		if pathMap, ok := pathItem.(map[string]interface{}); ok {
			for method, operation := range pathMap {
				if method == "parameters" || method == "summary" || method == "description" {
					continue // Skip non-HTTP methods
				}
				
				request := SavedRequest{
					ID:        fmt.Sprintf("req_%s_%s_%d", method, strings.ReplaceAll(path, "/", "_"), time.Now().UnixNano()),
					Name:      fmt.Sprintf("%s %s", strings.ToUpper(method), path),
					Method:    strings.ToUpper(method),
					URL:       baseURL + path,
					Headers:   make(map[string]string),
					Body:      "",
					CreatedAt: time.Now(),
				}

				// Extract operation details if available
				if opMap, ok := operation.(map[string]interface{}); ok {
					if summary, exists := opMap["summary"].(string); exists {
						// Use summary as a comment or name
						_ = summary
					}
				}

				collection.Requests = append(collection.Requests, request)
			}
		}
	}

	return collection, nil
}

// Helper functions
func extractNameFromURL(urlStr, method string) string {
	if urlStr == "" {
		return method + " Request"
	}
	
	// Parse URL and extract meaningful name
	if u, err := url.Parse(urlStr); err == nil {
		path := strings.Trim(u.Path, "/")
		if path == "" {
			return method + " " + u.Host
		}
		
		// Take the last part of the path
		parts := strings.Split(path, "/")
		lastPart := parts[len(parts)-1]
		
		// Clean up the name
		name := strings.ReplaceAll(lastPart, "_", " ")
		name = strings.ReplaceAll(name, "-", " ")
		
		return method + " " + strings.Title(name)
	}
	
	return method + " Request"
}

func generateCollectionID() string {
	return fmt.Sprintf("collection_%d", time.Now().UnixNano())
}