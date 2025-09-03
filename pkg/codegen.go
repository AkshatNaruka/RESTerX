package pkg

import (
	"fmt"
	"strings"
)

// CodeGenerator generates code snippets for various programming languages
type CodeGenerator struct{}

// NewCodeGenerator creates a new code generator
func NewCodeGenerator() *CodeGenerator {
	return &CodeGenerator{}
}

// GenerateCode generates code for a given request in the specified language
func (cg *CodeGenerator) GenerateCode(request APIRequest, language string) string {
	switch strings.ToLower(language) {
	case "curl":
		return cg.generateCurl(request)
	case "javascript":
		return cg.generateJavaScript(request)
	case "python":
		return cg.generatePython(request)
	case "go":
		return cg.generateGo(request)
	case "nodejs":
		return cg.generateNodeJS(request)
	default:
		return cg.generateCurl(request)
	}
}

func (cg *CodeGenerator) generateCurl(request APIRequest) string {
	var parts []string
	
	// Basic curl command
	parts = append(parts, fmt.Sprintf(`curl -X %s "%s"`, request.Method, request.URL))
	
	// Headers
	for key, value := range request.Headers {
		parts = append(parts, fmt.Sprintf(`  -H "%s: %s"`, key, value))
	}
	
	// Body for POST/PUT/PATCH
	if request.Body != "" && (request.Method == "POST" || request.Method == "PUT" || request.Method == "PATCH") {
		parts = append(parts, fmt.Sprintf(`  -d '%s'`, request.Body))
	}
	
	return strings.Join(parts, " \\\n")
}

func (cg *CodeGenerator) generateJavaScript(request APIRequest) string {
	var code strings.Builder
	
	code.WriteString("const response = await fetch(")
	code.WriteString(fmt.Sprintf(`"%s", {\n`, request.URL))
	code.WriteString(fmt.Sprintf(`  method: "%s",\n`, request.Method))
	
	if len(request.Headers) > 0 {
		code.WriteString("  headers: {\n")
		for key, value := range request.Headers {
			code.WriteString(fmt.Sprintf(`    "%s": "%s",\n`, key, value))
		}
		code.WriteString("  },\n")
	}
	
	if request.Body != "" {
		code.WriteString(fmt.Sprintf(`  body: %s,\n`, formatJSBody(request.Body)))
	}
	
	code.WriteString("});\n\n")
	code.WriteString("const data = await response.json();\n")
	code.WriteString("console.log(data);")
	
	return code.String()
}

func (cg *CodeGenerator) generatePython(request APIRequest) string {
	var code strings.Builder
	
	code.WriteString("import requests\n\n")
	code.WriteString(fmt.Sprintf(`url = "%s"\n`, request.URL))
	
	if len(request.Headers) > 0 {
		code.WriteString("headers = {\n")
		for key, value := range request.Headers {
			code.WriteString(fmt.Sprintf(`    "%s": "%s",\n`, key, value))
		}
		code.WriteString("}\n\n")
	}
	
	if request.Body != "" {
		code.WriteString(fmt.Sprintf(`data = %s\n\n`, formatPythonBody(request.Body)))
	}
	
	// Generate request
	args := []string{`url`}
	if len(request.Headers) > 0 {
		args = append(args, "headers=headers")
	}
	if request.Body != "" {
		args = append(args, "json=data")
	}
	
	code.WriteString(fmt.Sprintf(`response = requests.%s(%s)\n`, 
		strings.ToLower(request.Method), strings.Join(args, ", ")))
	code.WriteString("print(response.json())")
	
	return code.String()
}

func (cg *CodeGenerator) generateGo(request APIRequest) string {
	var code strings.Builder
	
	code.WriteString("package main\n\n")
	code.WriteString("import (\n")
	code.WriteString(`    "bytes"` + "\n")
	code.WriteString(`    "fmt"` + "\n")
	code.WriteString(`    "io/ioutil"` + "\n")
	code.WriteString(`    "net/http"` + "\n")
	code.WriteString(")\n\n")
	
	code.WriteString("func main() {\n")
	code.WriteString(fmt.Sprintf(`    url := "%s"` + "\n", request.URL))
	
	if request.Body != "" {
		code.WriteString(fmt.Sprintf(`    jsonData := []byte(%s)` + "\n", formatGoBody(request.Body)))
		code.WriteString(`    req, _ := http.NewRequest("` + request.Method + `", url, bytes.NewBuffer(jsonData))` + "\n")
	} else {
		code.WriteString(`    req, _ := http.NewRequest("` + request.Method + `", url, nil)` + "\n")
	}
	
	for key, value := range request.Headers {
		code.WriteString(fmt.Sprintf(`    req.Header.Set("%s", "%s")` + "\n", key, value))
	}
	
	code.WriteString("\n    client := &http.Client{}\n")
	code.WriteString("    resp, err := client.Do(req)\n")
	code.WriteString("    if err != nil {\n")
	code.WriteString("        panic(err)\n")
	code.WriteString("    }\n")
	code.WriteString("    defer resp.Body.Close()\n\n")
	code.WriteString("    body, _ := ioutil.ReadAll(resp.Body)\n")
	code.WriteString("    fmt.Println(string(body))\n")
	code.WriteString("}")
	
	return code.String()
}

func (cg *CodeGenerator) generateNodeJS(request APIRequest) string {
	var code strings.Builder
	
	code.WriteString("const https = require('https');\n\n")
	code.WriteString("const options = {\n")
	code.WriteString(fmt.Sprintf(`  hostname: '%s',\n`, extractHostname(request.URL)))
	code.WriteString(fmt.Sprintf(`  path: '%s',\n`, extractPath(request.URL)))
	code.WriteString(fmt.Sprintf(`  method: '%s',\n`, request.Method))
	
	if len(request.Headers) > 0 {
		code.WriteString("  headers: {\n")
		for key, value := range request.Headers {
			code.WriteString(fmt.Sprintf(`    '%s': '%s',\n`, key, value))
		}
		code.WriteString("  }\n")
	}
	
	code.WriteString("};\n\n")
	
	code.WriteString("const req = https.request(options, (res) => {\n")
	code.WriteString("  let data = '';\n")
	code.WriteString("  res.on('data', (chunk) => { data += chunk; });\n")
	code.WriteString("  res.on('end', () => { console.log(data); });\n")
	code.WriteString("});\n\n")
	
	if request.Body != "" {
		code.WriteString(fmt.Sprintf(`req.write(%s);\n`, formatJSBody(request.Body)))
	}
	
	code.WriteString("req.end();")
	
	return code.String()
}

// Helper functions
func formatJSBody(body string) string {
	// Try to parse as JSON, if successful return as object, otherwise as string
	if strings.HasPrefix(strings.TrimSpace(body), "{") || strings.HasPrefix(strings.TrimSpace(body), "[") {
		return fmt.Sprintf("JSON.stringify(%s)", body)
	}
	return fmt.Sprintf(`"%s"`, body)
}

func formatPythonBody(body string) string {
	if strings.HasPrefix(strings.TrimSpace(body), "{") || strings.HasPrefix(strings.TrimSpace(body), "[") {
		return body
	}
	return fmt.Sprintf(`"%s"`, body)
}

func formatGoBody(body string) string {
	return fmt.Sprintf("`%s`", body)
}

func extractHostname(url string) string {
	// Simple hostname extraction
	url = strings.TrimPrefix(url, "https://")
	url = strings.TrimPrefix(url, "http://")
	parts := strings.Split(url, "/")
	return parts[0]
}

func extractPath(url string) string {
	// Simple path extraction
	url = strings.TrimPrefix(url, "https://")
	url = strings.TrimPrefix(url, "http://")
	parts := strings.Split(url, "/")
	if len(parts) > 1 {
		return "/" + strings.Join(parts[1:], "/")
	}
	return "/"
}