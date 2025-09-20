package pkg

import (
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"time"
)

// ResponseVisualizer provides enhanced response visualization and analysis
type ResponseVisualizer struct{}

// NewResponseVisualizer creates a new response visualizer
func NewResponseVisualizer() *ResponseVisualizer {
	return &ResponseVisualizer{}
}

// ResponseAnalysis contains analysis results of an API response
type ResponseAnalysis struct {
	ContentType     string                 `json:"contentType"`
	Size           int                    `json:"size"`
	IsJSON         bool                   `json:"isJson"`
	IsXML          bool                   `json:"isXml"`
	IsHTML         bool                   `json:"isHtml"`
	IsImage        bool                   `json:"isImage"`
	JSONStructure  *JSONStructure         `json:"jsonStructure,omitempty"`
	XMLStructure   *XMLStructure          `json:"xmlStructure,omitempty"`
	HTMLStructure  *HTMLStructure         `json:"htmlStructure,omitempty"`
	ImageInfo      *ImageInfo             `json:"imageInfo,omitempty"`
	ResponseTime   time.Duration          `json:"responseTime"`
	Performance    PerformanceMetrics     `json:"performance"`
}

// JSONStructure represents the structure of JSON response
type JSONStructure struct {
	Type        string                 `json:"type"` // object, array, primitive
	Properties  map[string]interface{} `json:"properties,omitempty"`
	ArrayLength int                    `json:"arrayLength,omitempty"`
	Depth       int                    `json:"depth"`
	Keys        []string               `json:"keys,omitempty"`
}

// XMLStructure represents the structure of XML response
type XMLStructure struct {
	RootElement string              `json:"rootElement"`
	Elements    map[string]int      `json:"elements"`
	Attributes  map[string][]string `json:"attributes"`
	Depth       int                 `json:"depth"`
}

// HTMLStructure represents the structure of HTML response
type HTMLStructure struct {
	Title       string         `json:"title"`
	MetaTags    map[string]string `json:"metaTags"`
	Links       []string       `json:"links"`
	Images      []string       `json:"images"`
	Forms       int            `json:"forms"`
	Scripts     int            `json:"scripts"`
}

// ImageInfo contains information about image responses
type ImageInfo struct {
	Format      string `json:"format"`
	Dimensions  string `json:"dimensions"`
	EstimatedSize string `json:"estimatedSize"`
}

// PerformanceMetrics contains performance analysis
type PerformanceMetrics struct {
	Category    string  `json:"category"` // excellent, good, average, slow
	ScoreRating int     `json:"scoreRating"` // 1-100
	Suggestions []string `json:"suggestions"`
}

// AnalyzeResponse performs comprehensive analysis of an API response
func (rv *ResponseVisualizer) AnalyzeResponse(response *APIResponse) *ResponseAnalysis {
	analysis := &ResponseAnalysis{
		ContentType:  rv.getContentType(response.Headers),
		Size:        len(response.Body),
		ResponseTime: response.ResponseTime,
	}

	// Determine content type and analyze accordingly
	contentType := strings.ToLower(analysis.ContentType)
	
	if strings.Contains(contentType, "application/json") || rv.isJSON(response.Body) {
		analysis.IsJSON = true
		analysis.JSONStructure = rv.analyzeJSON(response.Body)
	} else if strings.Contains(contentType, "text/xml") || strings.Contains(contentType, "application/xml") || rv.isXML(response.Body) {
		analysis.IsXML = true
		analysis.XMLStructure = rv.analyzeXML(response.Body)
	} else if strings.Contains(contentType, "text/html") || rv.isHTML(response.Body) {
		analysis.IsHTML = true
		analysis.HTMLStructure = rv.analyzeHTML(response.Body)
	} else if strings.Contains(contentType, "image/") {
		analysis.IsImage = true
		analysis.ImageInfo = rv.analyzeImage(response, contentType)
	}

	// Analyze performance
	analysis.Performance = rv.analyzePerformance(response)

	return analysis
}

func (rv *ResponseVisualizer) getContentType(headers map[string]string) string {
	for key, value := range headers {
		if strings.ToLower(key) == "content-type" {
			return value
		}
	}
	return "text/plain"
}

func (rv *ResponseVisualizer) isJSON(body string) bool {
	body = strings.TrimSpace(body)
	return (strings.HasPrefix(body, "{") && strings.HasSuffix(body, "}")) ||
		   (strings.HasPrefix(body, "[") && strings.HasSuffix(body, "]"))
}

func (rv *ResponseVisualizer) isXML(body string) bool {
	body = strings.TrimSpace(body)
	return strings.HasPrefix(body, "<?xml") || (strings.HasPrefix(body, "<") && strings.HasSuffix(body, ">"))
}

func (rv *ResponseVisualizer) isHTML(body string) bool {
	body = strings.ToLower(strings.TrimSpace(body))
	return strings.Contains(body, "<html") || strings.Contains(body, "<!doctype html")
}

func (rv *ResponseVisualizer) analyzeJSON(body string) *JSONStructure {
	var data interface{}
	if err := json.Unmarshal([]byte(body), &data); err != nil {
		return &JSONStructure{Type: "invalid"}
	}

	structure := &JSONStructure{}
	rv.analyzeJSONValue(data, structure, 0)
	return structure
}

func (rv *ResponseVisualizer) analyzeJSONValue(data interface{}, structure *JSONStructure, depth int) {
	if depth > structure.Depth {
		structure.Depth = depth
	}

	switch v := data.(type) {
	case map[string]interface{}:
		structure.Type = "object"
		if structure.Properties == nil {
			structure.Properties = make(map[string]interface{})
			structure.Keys = make([]string, 0)
		}
		
		for key, value := range v {
			structure.Keys = append(structure.Keys, key)
			structure.Properties[key] = rv.getJSONValueType(value)
			rv.analyzeJSONValue(value, structure, depth+1)
		}
		sort.Strings(structure.Keys)
		
	case []interface{}:
		structure.Type = "array"
		structure.ArrayLength = len(v)
		if len(v) > 0 {
			rv.analyzeJSONValue(v[0], structure, depth+1)
		}
		
	default:
		if structure.Type == "" {
			structure.Type = "primitive"
		}
	}
}

func (rv *ResponseVisualizer) getJSONValueType(value interface{}) string {
	switch value.(type) {
	case string:
		return "string"
	case float64:
		return "number"
	case bool:
		return "boolean"
	case nil:
		return "null"
	case map[string]interface{}:
		return "object"
	case []interface{}:
		return "array"
	default:
		return "unknown"
	}
}

func (rv *ResponseVisualizer) analyzeXML(body string) *XMLStructure {
	structure := &XMLStructure{
		Elements:   make(map[string]int),
		Attributes: make(map[string][]string),
	}

	// Simple XML analysis using regex (for basic structure)
	elementRegex := regexp.MustCompile(`<([a-zA-Z][a-zA-Z0-9_-]*)[^>]*>`)
	matches := elementRegex.FindAllStringSubmatch(body, -1)

	for _, match := range matches {
		if len(match) > 1 {
			element := match[1]
			structure.Elements[element]++
			
			if structure.RootElement == "" {
				structure.RootElement = element
			}
		}
	}

	// Count nesting depth
	depth := 0
	maxDepth := 0
	for _, char := range body {
		if char == '<' && depth >= 0 {
			depth++
			if depth > maxDepth {
				maxDepth = depth
			}
		} else if char == '>' {
			depth--
		}
	}
	structure.Depth = maxDepth

	return structure
}

func (rv *ResponseVisualizer) analyzeHTML(body string) *HTMLStructure {
	structure := &HTMLStructure{
		MetaTags: make(map[string]string),
		Links:    make([]string, 0),
		Images:   make([]string, 0),
	}

	bodyLower := strings.ToLower(body)

	// Extract title
	titleRegex := regexp.MustCompile(`(?i)<title[^>]*>([^<]*)</title>`)
	if matches := titleRegex.FindStringSubmatch(body); len(matches) > 1 {
		structure.Title = strings.TrimSpace(matches[1])
	}

	// Count forms
	structure.Forms = strings.Count(bodyLower, "<form")

	// Count scripts
	structure.Scripts = strings.Count(bodyLower, "<script")

	// Extract links
	linkRegex := regexp.MustCompile(`(?i)<a[^>]*href="([^"]*)"`)
	linkMatches := linkRegex.FindAllStringSubmatch(body, -1)
	for _, match := range linkMatches {
		if len(match) > 1 {
			structure.Links = append(structure.Links, match[1])
		}
	}

	// Extract images
	imgRegex := regexp.MustCompile(`(?i)<img[^>]*src="([^"]*)"`)
	imgMatches := imgRegex.FindAllStringSubmatch(body, -1)
	for _, match := range imgMatches {
		if len(match) > 1 {
			structure.Images = append(structure.Images, match[1])
		}
	}

	return structure
}

func (rv *ResponseVisualizer) analyzeImage(response *APIResponse, contentType string) *ImageInfo {
	info := &ImageInfo{
		EstimatedSize: rv.formatBytes(len(response.Body)),
	}

	// Extract format from content type
	if strings.Contains(contentType, "jpeg") || strings.Contains(contentType, "jpg") {
		info.Format = "JPEG"
	} else if strings.Contains(contentType, "png") {
		info.Format = "PNG"
	} else if strings.Contains(contentType, "gif") {
		info.Format = "GIF"
	} else if strings.Contains(contentType, "webp") {
		info.Format = "WebP"
	} else if strings.Contains(contentType, "svg") {
		info.Format = "SVG"
	} else {
		info.Format = "Unknown"
	}

	// Note: Actual dimension extraction would require image parsing libraries
	info.Dimensions = "Available in binary data"

	return info
}

func (rv *ResponseVisualizer) analyzePerformance(response *APIResponse) PerformanceMetrics {
	metrics := PerformanceMetrics{
		Suggestions: make([]string, 0),
	}

	responseTimeMs := float64(response.ResponseTime) / float64(time.Millisecond)

	// Categorize performance based on response time
	if responseTimeMs < 100 {
		metrics.Category = "excellent"
		metrics.ScoreRating = 95
	} else if responseTimeMs < 300 {
		metrics.Category = "good"
		metrics.ScoreRating = 80
	} else if responseTimeMs < 1000 {
		metrics.Category = "average"
		metrics.ScoreRating = 60
		metrics.Suggestions = append(metrics.Suggestions, "Consider optimizing API response time")
	} else {
		metrics.Category = "slow"
		metrics.ScoreRating = 30
		metrics.Suggestions = append(metrics.Suggestions, "Response time is slow, investigate server performance")
	}

	// Check response size
	sizeKB := float64(len(response.Body)) / 1024.0
	if sizeKB > 1000 {
		metrics.Suggestions = append(metrics.Suggestions, "Response size is large, consider pagination or data compression")
		metrics.ScoreRating -= 10
	}

	// Check for gzip compression
	compressed := false
	for key, value := range response.Headers {
		if strings.ToLower(key) == "content-encoding" && strings.Contains(strings.ToLower(value), "gzip") {
			compressed = true
			break
		}
	}
	if !compressed && sizeKB > 10 {
		metrics.Suggestions = append(metrics.Suggestions, "Consider enabling gzip compression")
		metrics.ScoreRating -= 5
	}

	// Check status code
	if response.StatusCode >= 400 {
		metrics.Suggestions = append(metrics.Suggestions, "Check error status code and response")
		metrics.ScoreRating -= 20
	}

	if metrics.ScoreRating < 0 {
		metrics.ScoreRating = 0
	}

	return metrics
}

// FormatJSONResponse formats JSON response with proper indentation and syntax highlighting hints
func (rv *ResponseVisualizer) FormatJSONResponse(body string) (string, error) {
	var data interface{}
	if err := json.Unmarshal([]byte(body), &data); err != nil {
		return body, err
	}

	formatted, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return body, err
	}

	return string(formatted), nil
}

// GenerateResponseSummary creates a human-readable summary of the response
func (rv *ResponseVisualizer) GenerateResponseSummary(analysis *ResponseAnalysis) string {
	var summary strings.Builder

	summary.WriteString(fmt.Sprintf("📊 Response Analysis Summary\n"))
	summary.WriteString(fmt.Sprintf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"))
	summary.WriteString(fmt.Sprintf("📁 Content Type: %s\n", analysis.ContentType))
	summary.WriteString(fmt.Sprintf("📏 Size: %s\n", rv.formatBytes(analysis.Size)))
	summary.WriteString(fmt.Sprintf("⏱️  Response Time: %v\n", analysis.ResponseTime))
	summary.WriteString(fmt.Sprintf("🎯 Performance: %s (%d/100)\n", 
		strings.Title(analysis.Performance.Category), analysis.Performance.ScoreRating))

	if analysis.IsJSON && analysis.JSONStructure != nil {
		summary.WriteString(fmt.Sprintf("\n🔗 JSON Structure:\n"))
		summary.WriteString(fmt.Sprintf("   Type: %s\n", analysis.JSONStructure.Type))
		summary.WriteString(fmt.Sprintf("   Depth: %d levels\n", analysis.JSONStructure.Depth))
		if analysis.JSONStructure.Type == "array" {
			summary.WriteString(fmt.Sprintf("   Items: %d\n", analysis.JSONStructure.ArrayLength))
		}
		if len(analysis.JSONStructure.Keys) > 0 {
			summary.WriteString(fmt.Sprintf("   Properties: %d\n", len(analysis.JSONStructure.Keys)))
		}
	}

	if analysis.IsXML && analysis.XMLStructure != nil {
		summary.WriteString(fmt.Sprintf("\n🏷️  XML Structure:\n"))
		summary.WriteString(fmt.Sprintf("   Root: <%s>\n", analysis.XMLStructure.RootElement))
		summary.WriteString(fmt.Sprintf("   Elements: %d types\n", len(analysis.XMLStructure.Elements)))
		summary.WriteString(fmt.Sprintf("   Depth: %d levels\n", analysis.XMLStructure.Depth))
	}

	if analysis.IsHTML && analysis.HTMLStructure != nil {
		summary.WriteString(fmt.Sprintf("\n🌐 HTML Structure:\n"))
		if analysis.HTMLStructure.Title != "" {
			summary.WriteString(fmt.Sprintf("   Title: %s\n", analysis.HTMLStructure.Title))
		}
		summary.WriteString(fmt.Sprintf("   Links: %d\n", len(analysis.HTMLStructure.Links)))
		summary.WriteString(fmt.Sprintf("   Images: %d\n", len(analysis.HTMLStructure.Images)))
		summary.WriteString(fmt.Sprintf("   Forms: %d\n", analysis.HTMLStructure.Forms))
	}

	if len(analysis.Performance.Suggestions) > 0 {
		summary.WriteString(fmt.Sprintf("\n💡 Suggestions:\n"))
		for _, suggestion := range analysis.Performance.Suggestions {
			summary.WriteString(fmt.Sprintf("   • %s\n", suggestion))
		}
	}

	return summary.String()
}

func (rv *ResponseVisualizer) formatBytes(bytes int) string {
	if bytes < 1024 {
		return fmt.Sprintf("%d B", bytes)
	} else if bytes < 1024*1024 {
		return fmt.Sprintf("%.2f KB", float64(bytes)/1024)
	} else {
		return fmt.Sprintf("%.2f MB", float64(bytes)/(1024*1024))
	}
}

// CompareResponses compares two API responses and highlights differences
func (rv *ResponseVisualizer) CompareResponses(response1, response2 *APIResponse) map[string]interface{} {
	comparison := make(map[string]interface{})

	// Compare basic metrics
	comparison["statusCodeDiff"] = response2.StatusCode - response1.StatusCode
	comparison["timeDiff"] = response2.ResponseTime - response1.ResponseTime
	comparison["sizeDiff"] = len(response2.Body) - len(response1.Body)

	// Compare headers
	headerDiffs := make(map[string]string)
	for key, value1 := range response1.Headers {
		if value2, exists := response2.Headers[key]; exists {
			if value1 != value2 {
				headerDiffs[key] = fmt.Sprintf("'%s' → '%s'", value1, value2)
			}
		} else {
			headerDiffs[key] = fmt.Sprintf("'%s' → (removed)", value1)
		}
	}
	for key, value2 := range response2.Headers {
		if _, exists := response1.Headers[key]; !exists {
			headerDiffs[key] = fmt.Sprintf("(added) → '%s'", value2)
		}
	}
	comparison["headerDiffs"] = headerDiffs

	// If both are JSON, compare structures
	if rv.isJSON(response1.Body) && rv.isJSON(response2.Body) {
		var data1, data2 interface{}
		if json.Unmarshal([]byte(response1.Body), &data1) == nil &&
		   json.Unmarshal([]byte(response2.Body), &data2) == nil {
			comparison["jsonStructureChanged"] = !rv.deepEqual(data1, data2)
		}
	}

	return comparison
}

func (rv *ResponseVisualizer) deepEqual(a, b interface{}) bool {
	aBytes, _ := json.Marshal(a)
	bBytes, _ := json.Marshal(b)
	return string(aBytes) == string(bBytes)
}