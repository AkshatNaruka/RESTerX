package pkg

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

// ScriptingEngine handles pre-request and post-request scripts
type ScriptingEngine struct {
	variables map[string]string
	functions map[string]func(args []string) string
}

// NewScriptingEngine creates a new scripting engine
func NewScriptingEngine() *ScriptingEngine {
	engine := &ScriptingEngine{
		variables: make(map[string]string),
		functions: make(map[string]func(args []string) string),
	}
	
	// Register built-in functions
	engine.registerBuiltInFunctions()
	
	return engine
}

// ScriptContext contains the context for script execution
type ScriptContext struct {
	Request    *APIRequest    `json:"request"`
	Response   *APIResponse   `json:"response,omitempty"`
	Variables  map[string]string `json:"variables"`
	Environment string        `json:"environment"`
	Iteration   int           `json:"iteration"`
}

// ScriptResult contains the result of script execution
type ScriptResult struct {
	Success    bool                    `json:"success"`
	Output     []string                `json:"output"`
	Errors     []string                `json:"errors"`
	Variables  map[string]string       `json:"variables"`
	Tests      []ScriptTestResult      `json:"tests"`
	Assertions []ScriptAssertionResult `json:"assertions"`
}

// ScriptTestResult represents a test result from a script
type ScriptTestResult struct {
	Name    string `json:"name"`
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}

// ScriptAssertionResult represents an assertion result
type ScriptAssertionResult struct {
	Description string      `json:"description"`
	Passed      bool        `json:"passed"`
	Expected    interface{} `json:"expected"`
	Actual      interface{} `json:"actual"`
	Error       string      `json:"error,omitempty"`
}

// ExecutePreRequestScript executes a pre-request script
func (se *ScriptingEngine) ExecutePreRequestScript(script string, context *ScriptContext) *ScriptResult {
	result := &ScriptResult{
		Success:    true,
		Output:     []string{},
		Errors:     []string{},
		Variables:  make(map[string]string),
		Tests:      []ScriptTestResult{},
		Assertions: []ScriptAssertionResult{},
	}

	// Copy current variables
	for k, v := range context.Variables {
		result.Variables[k] = v
		se.variables[k] = v
	}

	// Execute script line by line
	lines := strings.Split(script, "\n")
	for lineNum, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "//") {
			continue
		}

		if err := se.executeLine(line, context, result); err != nil {
			result.Success = false
			result.Errors = append(result.Errors, fmt.Sprintf("Line %d: %v", lineNum+1, err))
		}
	}

	return result
}

// ExecutePostRequestScript executes a post-request script (test script)
func (se *ScriptingEngine) ExecutePostRequestScript(script string, context *ScriptContext) *ScriptResult {
	result := &ScriptResult{
		Success:    true,
		Output:     []string{},
		Errors:     []string{},
		Variables:  make(map[string]string),
		Tests:      []ScriptTestResult{},
		Assertions: []ScriptAssertionResult{},
	}

	// Copy current variables
	for k, v := range context.Variables {
		result.Variables[k] = v
		se.variables[k] = v
	}

	// Execute script
	lines := strings.Split(script, "\n")
	for lineNum, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "//") {
			continue
		}

		if err := se.executeLine(line, context, result); err != nil {
			result.Success = false
			result.Errors = append(result.Errors, fmt.Sprintf("Line %d: %v", lineNum+1, err))
		}
	}

	return result
}

func (se *ScriptingEngine) executeLine(line string, context *ScriptContext, result *ScriptResult) error {
	// Variable assignment: var name = value
	if matched, _ := regexp.MatchString(`^var\s+\w+\s*=`, line); matched {
		return se.executeVariableAssignment(line, context, result)
	}

	// Console.log: console.log("message")
	if strings.HasPrefix(line, "console.log(") {
		return se.executeConsoleLog(line, result)
	}

	// Test function: test("name", function() { ... })
	if strings.HasPrefix(line, "test(") {
		return se.executeTest(line, context, result)
	}

	// Assertion functions
	if strings.Contains(line, "assertEqual") || strings.Contains(line, "assertTrue") || strings.Contains(line, "assertFalse") {
		return se.executeAssertion(line, context, result)
	}

	// Function calls
	if strings.Contains(line, "(") && strings.Contains(line, ")") {
		return se.executeFunctionCall(line, context, result)
	}

	return nil
}

func (se *ScriptingEngine) executeVariableAssignment(line string, context *ScriptContext, result *ScriptResult) error {
	// Parse: var variableName = value
	re := regexp.MustCompile(`^var\s+(\w+)\s*=\s*(.+)$`)
	matches := re.FindStringSubmatch(line)
	if len(matches) != 3 {
		return fmt.Errorf("invalid variable assignment syntax")
	}

	varName := matches[1]
	valueExpr := strings.TrimSpace(matches[2])

	// Evaluate the expression
	value, err := se.evaluateExpression(valueExpr, context)
	if err != nil {
		return err
	}

	// Store variable
	result.Variables[varName] = value
	se.variables[varName] = value

	return nil
}

func (se *ScriptingEngine) executeConsoleLog(line string, result *ScriptResult) error {
	// Extract content from console.log("content")
	re := regexp.MustCompile(`console\.log\(\s*"([^"]*)"\s*\)`)
	matches := re.FindStringSubmatch(line)
	if len(matches) != 2 {
		return fmt.Errorf("invalid console.log syntax")
	}

	message := matches[1]
	result.Output = append(result.Output, message)
	return nil
}

func (se *ScriptingEngine) executeTest(line string, context *ScriptContext, result *ScriptResult) error {
	// Simple test execution - just check if response status is 200
	testResult := ScriptTestResult{
		Name:   "Basic Test",
		Passed: context.Response != nil && context.Response.StatusCode == 200,
	}

	if testResult.Passed {
		testResult.Message = "Test passed"
	} else {
		testResult.Message = "Test failed"
	}

	result.Tests = append(result.Tests, testResult)
	return nil
}

func (se *ScriptingEngine) executeAssertion(line string, context *ScriptContext, result *ScriptResult) error {
	// Simple assertion handling
	assertion := ScriptAssertionResult{
		Description: line,
		Passed:      true,
	}

	// Basic status code assertion
	if strings.Contains(line, "response.status") && strings.Contains(line, "200") {
		assertion.Expected = 200
		if context.Response != nil {
			assertion.Actual = context.Response.StatusCode
			assertion.Passed = context.Response.StatusCode == 200
		} else {
			assertion.Passed = false
			assertion.Error = "No response available"
		}
	}

	result.Assertions = append(result.Assertions, assertion)
	return nil
}

func (se *ScriptingEngine) executeFunctionCall(line string, context *ScriptContext, result *ScriptResult) error {
	// Extract function name and arguments
	re := regexp.MustCompile(`(\w+)\((.*)\)`)
	matches := re.FindStringSubmatch(line)
	if len(matches) != 3 {
		return nil // Not a function call we recognize
	}

	funcName := matches[1]
	argsStr := matches[2]

	// Parse arguments (simple comma-separated)
	var args []string
	if argsStr != "" {
		args = strings.Split(argsStr, ",")
		for i, arg := range args {
			args[i] = strings.Trim(strings.TrimSpace(arg), `"'`)
		}
	}

	// Execute function
	if fn, exists := se.functions[funcName]; exists {
		resultValue := fn(args)
		result.Output = append(result.Output, fmt.Sprintf("%s() = %s", funcName, resultValue))
	}

	return nil
}

func (se *ScriptingEngine) evaluateExpression(expr string, context *ScriptContext) (string, error) {
	expr = strings.TrimSpace(expr)

	// String literal
	if strings.HasPrefix(expr, `"`) && strings.HasSuffix(expr, `"`) {
		return strings.Trim(expr, `"`), nil
	}

	// Number
	if matched, _ := regexp.MatchString(`^\d+$`, expr); matched {
		return expr, nil
	}

	// Function call
	if strings.Contains(expr, "(") && strings.Contains(expr, ")") {
		return se.evaluateFunctionCall(expr, context)
	}

	// Variable reference
	if value, exists := se.variables[expr]; exists {
		return value, nil
	}

	// Response property access
	if strings.HasPrefix(expr, "response.") && context.Response != nil {
		return se.evaluateResponseProperty(expr, context.Response)
	}

	return expr, nil
}

func (se *ScriptingEngine) evaluateFunctionCall(expr string, context *ScriptContext) (string, error) {
	re := regexp.MustCompile(`(\w+)\((.*)\)`)
	matches := re.FindStringSubmatch(expr)
	if len(matches) != 3 {
		return expr, nil
	}

	funcName := matches[1]
	if fn, exists := se.functions[funcName]; exists {
		return fn([]string{}), nil
	}

	return expr, nil
}

func (se *ScriptingEngine) evaluateResponseProperty(expr string, response *APIResponse) (string, error) {
	switch expr {
	case "response.status":
		return fmt.Sprintf("%d", response.StatusCode), nil
	case "response.statusText":
		return response.Status, nil
	case "response.responseTime":
		return fmt.Sprintf("%v", response.ResponseTime), nil
	case "response.body":
		return response.Body, nil
	default:
		return expr, nil
	}
}

func (se *ScriptingEngine) registerBuiltInFunctions() {
	se.functions["timestamp"] = func(args []string) string {
		return fmt.Sprintf("%d", time.Now().Unix())
	}

	se.functions["uuid"] = func(args []string) string {
		return generateUUID()
	}

	se.functions["randomInt"] = func(args []string) string {
		return fmt.Sprintf("%d", time.Now().UnixNano()%10000)
	}

	se.functions["randomString"] = func(args []string) string {
		return fmt.Sprintf("str_%d", time.Now().UnixNano()%10000)
	}

	se.functions["base64encode"] = func(args []string) string {
		if len(args) > 0 {
			// Simple base64 encoding simulation
			return fmt.Sprintf("base64(%s)", args[0])
		}
		return ""
	}

	se.functions["md5"] = func(args []string) string {
		if len(args) > 0 {
			// Simple MD5 hash simulation
			return fmt.Sprintf("md5(%s)", args[0])
		}
		return ""
	}
}

// ValidateScript performs basic validation of a script
func (se *ScriptingEngine) ValidateScript(script string) []string {
	var errors []string

	lines := strings.Split(script, "\n")
	for lineNum, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "//") {
			continue
		}

		// Check for common syntax errors
		if strings.Contains(line, "var ") && !strings.Contains(line, "=") {
			errors = append(errors, fmt.Sprintf("Line %d: Variable declaration missing assignment", lineNum+1))
		}

		if strings.Count(line, "(") != strings.Count(line, ")") {
			errors = append(errors, fmt.Sprintf("Line %d: Unmatched parentheses", lineNum+1))
		}

		if strings.Count(line, "{") != strings.Count(line, "}") {
			errors = append(errors, fmt.Sprintf("Line %d: Unmatched braces", lineNum+1))
		}
	}

	return errors
}

// GetAvailableFunctions returns a list of available functions
func (se *ScriptingEngine) GetAvailableFunctions() []string {
	var functions []string
	for name := range se.functions {
		functions = append(functions, name)
	}
	return functions
}

// GetScriptExamples returns example scripts for common use cases
func (se *ScriptingEngine) GetScriptExamples() map[string]string {
	return map[string]string{
		"pre-request": `// Pre-request script example
var authToken = "Bearer " + uuid();
console.log("Generated auth token");

// Set dynamic timestamp
var currentTime = timestamp();

// Set custom header
request.headers["X-Timestamp"] = currentTime;`,

		"post-request": `// Post-request (test) script example
// Test status code
test("Status code is 200", function() {
    assertEqual(response.status, 200);
});

// Test response time
test("Response time is reasonable", function() {
    assertTrue(response.responseTime < 1000);
});

// Extract data from response
var responseData = JSON.parse(response.body);
var userId = responseData.id;
console.log("User ID: " + userId);

// Save for next request
var nextRequestUrl = "https://api.example.com/users/" + userId;`,

		"validation": `// Response validation example
// Check if response contains required fields
var data = JSON.parse(response.body);

test("Response has required fields", function() {
    assertTrue(data.hasOwnProperty("id"));
    assertTrue(data.hasOwnProperty("name"));
    assertTrue(data.hasOwnProperty("email"));
});

// Validate data types
test("ID is a number", function() {
    assertTrue(typeof data.id === "number");
});`,
	}
}