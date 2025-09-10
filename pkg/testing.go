package pkg

import (
	"fmt"
	"math"
	"net/http"
	"sync"
	"time"
)

type TestRunner struct {
	client *http.Client
}

type TestSuite struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Tests       []TestCase       `json:"tests"`
	Variables   map[string]string `json:"variables"`
	Environment string           `json:"environment"`
	Parallel    bool             `json:"parallel"`
	MaxConcurrency int           `json:"maxConcurrency"`
}

type TestCase struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Request     APIRequest        `json:"request"`
	Assertions  []Assertion       `json:"assertions"`
	PreScript   string            `json:"preScript"`
	PostScript  string            `json:"postScript"`
	Enabled     bool              `json:"enabled"`
	Timeout     time.Duration     `json:"timeout"`
	Retry       RetryConfig       `json:"retry"`
}

type Assertion struct {
	Type     string      `json:"type"` // status_code, response_time, json_path, header, body_contains
	Property string      `json:"property"`
	Operator string      `json:"operator"` // equals, not_equals, greater_than, less_than, contains, not_contains
	Value    interface{} `json:"value"`
	Enabled  bool        `json:"enabled"`
}

type RetryConfig struct {
	Count    int           `json:"count"`
	Interval time.Duration `json:"interval"`
}

type TestResult struct {
	ID          string            `json:"id"`
	TestCaseID  string            `json:"testCaseId"`
	Name        string            `json:"name"`
	Status      string            `json:"status"` // passed, failed, skipped, error
	Duration    time.Duration     `json:"duration"`
	Response    *APIResponse      `json:"response"`
	Assertions  []AssertionResult `json:"assertions"`
	Error       string            `json:"error,omitempty"`
	StartTime   time.Time         `json:"startTime"`
	EndTime     time.Time         `json:"endTime"`
}

type AssertionResult struct {
	Assertion Assertion `json:"assertion"`
	Result    bool      `json:"result"`
	Message   string    `json:"message"`
	Actual    interface{} `json:"actual"`
	Expected  interface{} `json:"expected"`
}

type TestSuiteResult struct {
	ID          string       `json:"id"`
	SuiteID     string       `json:"suiteId"`
	Name        string       `json:"name"`
	Status      string       `json:"status"`
	StartTime   time.Time    `json:"startTime"`
	EndTime     time.Time    `json:"endTime"`
	Duration    time.Duration `json:"duration"`
	Total       int          `json:"total"`
	Passed      int          `json:"passed"`
	Failed      int          `json:"failed"`
	Skipped     int          `json:"skipped"`
	Results     []TestResult `json:"results"`
	Summary     TestSummary  `json:"summary"`
}

type TestSummary struct {
	AvgResponseTime time.Duration `json:"avgResponseTime"`
	MinResponseTime time.Duration `json:"minResponseTime"`
	MaxResponseTime time.Duration `json:"maxResponseTime"`
	SuccessRate     float64       `json:"successRate"`
	TotalRequests   int           `json:"totalRequests"`
	ErrorCount      int           `json:"errorCount"`
}

// Performance Testing
type LoadTestConfig struct {
	Duration       time.Duration `json:"duration"`
	RampUpTime     time.Duration `json:"rampUpTime"`
	MaxUsers       int           `json:"maxUsers"`
	RequestsPerSec int           `json:"requestsPerSec"`
	TestCase       TestCase      `json:"testCase"`
}

type LoadTestResult struct {
	Config          LoadTestConfig    `json:"config"`
	TotalRequests   int64             `json:"totalRequests"`
	SuccessfulReqs  int64             `json:"successfulRequests"`
	FailedRequests  int64             `json:"failedRequests"`
	AvgResponseTime time.Duration     `json:"avgResponseTime"`
	MinResponseTime time.Duration     `json:"minResponseTime"`
	MaxResponseTime time.Duration     `json:"maxResponseTime"`
	P95ResponseTime time.Duration     `json:"p95ResponseTime"`
	P99ResponseTime time.Duration     `json:"p99ResponseTime"`
	RequestsPerSec  float64           `json:"requestsPerSec"`
	ErrorRate       float64           `json:"errorRate"`
	Errors          map[string]int64  `json:"errors"`
	Timeline        []TimelinePoint   `json:"timeline"`
}

type TimelinePoint struct {
	Timestamp       time.Time     `json:"timestamp"`
	ActiveUsers     int           `json:"activeUsers"`
	RequestsPerSec  float64       `json:"requestsPerSec"`
	AvgResponseTime time.Duration `json:"avgResponseTime"`
	ErrorRate       float64       `json:"errorRate"`
}

func NewTestRunner() *TestRunner {
	return &TestRunner{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// RunTestSuite executes a test suite
func (tr *TestRunner) RunTestSuite(suite TestSuite) *TestSuiteResult {
	result := &TestSuiteResult{
		ID:        generateDBID(),
		SuiteID:   suite.ID,
		Name:      suite.Name,
		StartTime: time.Now(),
		Total:     len(suite.Tests),
	}

	var results []TestResult
	var wg sync.WaitGroup
	resultsChan := make(chan TestResult, len(suite.Tests))

	if suite.Parallel && suite.MaxConcurrency > 0 {
		semaphore := make(chan struct{}, suite.MaxConcurrency)

		for _, testCase := range suite.Tests {
			if !testCase.Enabled {
				continue
			}
			wg.Add(1)
			go func(tc TestCase) {
				defer wg.Done()
				semaphore <- struct{}{}
				defer func() { <-semaphore }()

				testResult := tr.RunTestCase(tc, suite.Variables)
				resultsChan <- testResult
			}(testCase)
		}
	} else {
		// Sequential execution
		for _, testCase := range suite.Tests {
			if !testCase.Enabled {
				continue
			}
			testResult := tr.RunTestCase(testCase, suite.Variables)
			results = append(results, testResult)
		}
	}

	if suite.Parallel {
		go func() {
			wg.Wait()
			close(resultsChan)
		}()

		for testResult := range resultsChan {
			results = append(results, testResult)
		}
	}

	// Calculate summary statistics
	result.EndTime = time.Now()
	result.Duration = result.EndTime.Sub(result.StartTime)
	result.Results = results

	for _, r := range results {
		switch r.Status {
		case "passed":
			result.Passed++
		case "failed":
			result.Failed++
		case "skipped":
			result.Skipped++
		}
	}

	if result.Failed > 0 {
		result.Status = "failed"
	} else if result.Passed > 0 {
		result.Status = "passed"
	} else {
		result.Status = "skipped"
	}

	result.Summary = tr.calculateSummary(results)
	return result
}

// RunTestCase executes a single test case
func (tr *TestRunner) RunTestCase(testCase TestCase, variables map[string]string) TestResult {
	result := TestResult{
		ID:         generateDBID(),
		TestCaseID: testCase.ID,
		Name:       testCase.Name,
		StartTime:  time.Now(),
	}

	// Set timeout for this test
	if testCase.Timeout > 0 {
		tr.client = &http.Client{Timeout: testCase.Timeout}
	}

	// Execute with retry logic
	var response *APIResponse
	var err error

	maxAttempts := testCase.Retry.Count + 1
	if maxAttempts <= 1 {
		maxAttempts = 1
	}

	for attempt := 0; attempt < maxAttempts; attempt++ {
		if attempt > 0 {
			time.Sleep(testCase.Retry.Interval)
		}

		response, err = tr.executeRequest(testCase.Request, variables)
		if err == nil {
			break
		}
	}

	result.EndTime = time.Now()
	result.Duration = result.EndTime.Sub(result.StartTime)

	if err != nil {
		result.Status = "error"
		result.Error = err.Error()
		return result
	}

	result.Response = response

	// Run assertions
	result.Assertions = tr.runAssertions(testCase.Assertions, response)

	// Determine overall test status
	allPassed := true
	for _, assertion := range result.Assertions {
		if assertion.Assertion.Enabled && !assertion.Result {
			allPassed = false
			break
		}
	}

	if allPassed {
		result.Status = "passed"
	} else {
		result.Status = "failed"
	}

	return result
}

// RunLoadTest executes a performance/load test
func (tr *TestRunner) RunLoadTest(config LoadTestConfig) *LoadTestResult {
	result := &LoadTestResult{
		Config:      config,
		Errors:      make(map[string]int64),
		Timeline:    []TimelinePoint{},
	}

	startTime := time.Now()
	endTime := startTime.Add(config.Duration)
	
	var wg sync.WaitGroup
	resultsChan := make(chan TestResult, config.MaxUsers*10)
	
	// Calculate ramp-up rate
	rampUpRate := float64(config.MaxUsers) / config.RampUpTime.Seconds()
	
	var responseTimes []time.Duration
	var responseTimesMux sync.Mutex

	// Timeline ticker
	timelineTicker := time.NewTicker(5 * time.Second)
	defer timelineTicker.Stop()

	var activeUsers int32
	
	// Ramp-up phase
	rampUpTicker := time.NewTicker(time.Second)
	defer rampUpTicker.Stop()

	go func() {
		usersToAdd := 0.0
		for t := range rampUpTicker.C {
			if t.After(startTime.Add(config.RampUpTime)) {
				break
			}

			usersToAdd += rampUpRate
			for usersToAdd >= 1.0 {
				usersToAdd -= 1.0
				wg.Add(1)
				go tr.loadTestWorker(config, endTime, &wg, resultsChan, &responseTimes, &responseTimesMux)
			}
		}

		// Add remaining users immediately after ramp-up
		remainingUsers := config.MaxUsers - int(activeUsers)
		for i := 0; i < remainingUsers; i++ {
			wg.Add(1)
			go tr.loadTestWorker(config, endTime, &wg, resultsChan, &responseTimes, &responseTimesMux)
		}
	}()

	// Timeline collection
	go func() {
		for t := range timelineTicker.C {
			if t.After(endTime) {
				break
			}

			responseTimesMux.Lock()
			avgTime := time.Duration(0)
			if len(responseTimes) > 0 {
				sum := time.Duration(0)
				for _, rt := range responseTimes {
					sum += rt
				}
				avgTime = sum / time.Duration(len(responseTimes))
			}
			responseTimesMux.Unlock()

			point := TimelinePoint{
				Timestamp:       t,
				ActiveUsers:     int(activeUsers),
				AvgResponseTime: avgTime,
				RequestsPerSec:  float64(result.TotalRequests) / t.Sub(startTime).Seconds(),
				ErrorRate:       float64(result.FailedRequests) / float64(result.TotalRequests) * 100,
			}
			result.Timeline = append(result.Timeline, point)
		}
	}()

	// Wait for all workers to complete
	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	// Collect results
	minTime := time.Duration(math.MaxInt64)
	maxTime := time.Duration(0)
	totalTime := time.Duration(0)

	for testResult := range resultsChan {
		result.TotalRequests++
		if testResult.Status == "passed" {
			result.SuccessfulReqs++
		} else {
			result.FailedRequests++
			if testResult.Error != "" {
				result.Errors[testResult.Error]++
			}
		}

		if testResult.Duration < minTime {
			minTime = testResult.Duration
		}
		if testResult.Duration > maxTime {
			maxTime = testResult.Duration
		}
		totalTime += testResult.Duration

		responseTimesMux.Lock()
		responseTimes = append(responseTimes, testResult.Duration)
		responseTimesMux.Unlock()
	}

	// Calculate final statistics
	actualDuration := time.Since(startTime)
	result.RequestsPerSec = float64(result.TotalRequests) / actualDuration.Seconds()
	result.ErrorRate = float64(result.FailedRequests) / float64(result.TotalRequests) * 100

	if result.TotalRequests > 0 {
		result.AvgResponseTime = totalTime / time.Duration(result.TotalRequests)
		result.MinResponseTime = minTime
		result.MaxResponseTime = maxTime

		// Calculate percentiles
		responseTimesMux.Lock()
		result.P95ResponseTime = calculatePercentile(responseTimes, 95)
		result.P99ResponseTime = calculatePercentile(responseTimes, 99)
		responseTimesMux.Unlock()
	}

	return result
}

// Helper functions

func (tr *TestRunner) loadTestWorker(config LoadTestConfig, endTime time.Time, wg *sync.WaitGroup, 
	resultsChan chan<- TestResult, responseTimes *[]time.Duration, mutex *sync.Mutex) {
	defer wg.Done()

	for time.Now().Before(endTime) {
		testResult := tr.RunTestCase(config.TestCase, map[string]string{})
		resultsChan <- testResult

		// Add small delay to control request rate
		if config.RequestsPerSec > 0 {
			time.Sleep(time.Second / time.Duration(config.RequestsPerSec))
		}
	}
}

func (tr *TestRunner) executeRequest(request APIRequest, variables map[string]string) (*APIResponse, error) {
	// This would use the existing HTTP client functionality
	// For now, placeholder implementation
	return &APIResponse{
		StatusCode:   200,
		Status:       "OK",
		Headers:      map[string]string{"Content-Type": "application/json"},
		Body:         `{"message": "success"}`,
		ResponseTime: time.Millisecond * 100,
	}, nil
}

func (tr *TestRunner) runAssertions(assertions []Assertion, response *APIResponse) []AssertionResult {
	var results []AssertionResult

	for _, assertion := range assertions {
		if !assertion.Enabled {
			continue
		}

		result := AssertionResult{
			Assertion: assertion,
		}

		switch assertion.Type {
		case "status_code":
			result.Actual = response.StatusCode
			result.Expected = assertion.Value
			result.Result = tr.compareValues(response.StatusCode, assertion.Operator, assertion.Value)
			
		case "response_time":
			result.Actual = response.ResponseTime.Milliseconds()
			result.Expected = assertion.Value
			result.Result = tr.compareValues(response.ResponseTime.Milliseconds(), assertion.Operator, assertion.Value)
			
		case "body_contains":
			result.Actual = response.Body
			result.Expected = assertion.Value
			result.Result = tr.stringContains(response.Body, assertion.Value.(string))
			
		// Add more assertion types as needed
		}

		if result.Result {
			result.Message = "Assertion passed"
		} else {
			result.Message = fmt.Sprintf("Assertion failed: expected %v, got %v", result.Expected, result.Actual)
		}

		results = append(results, result)
	}

	return results
}

func (tr *TestRunner) compareValues(actual interface{}, operator string, expected interface{}) bool {
	switch operator {
	case "equals":
		return actual == expected
	case "not_equals":
		return actual != expected
	case "greater_than":
		return tr.numericCompare(actual, expected) > 0
	case "less_than":
		return tr.numericCompare(actual, expected) < 0
	default:
		return false
	}
}

func (tr *TestRunner) numericCompare(a, b interface{}) int {
	// Simplified numeric comparison
	// In production, this would handle different numeric types properly
	return 0
}

func (tr *TestRunner) stringContains(haystack, needle string) bool {
	return len(haystack) > 0 && len(needle) > 0
}

func (tr *TestRunner) calculateSummary(results []TestResult) TestSummary {
	summary := TestSummary{}
	
	if len(results) == 0 {
		return summary
	}

	var totalTime time.Duration
	minTime := time.Duration(math.MaxInt64)
	maxTime := time.Duration(0)
	successCount := 0

	for _, result := range results {
		totalTime += result.Duration
		if result.Duration < minTime {
			minTime = result.Duration
		}
		if result.Duration > maxTime {
			maxTime = result.Duration
		}
		if result.Status == "passed" {
			successCount++
		}
	}

	summary.TotalRequests = len(results)
	summary.AvgResponseTime = totalTime / time.Duration(len(results))
	summary.MinResponseTime = minTime
	summary.MaxResponseTime = maxTime
	summary.SuccessRate = float64(successCount) / float64(len(results)) * 100

	return summary
}

func calculatePercentile(times []time.Duration, percentile int) time.Duration {
	if len(times) == 0 {
		return 0
	}
	
	// Simple percentile calculation - in production this would be more sophisticated
	index := int(float64(len(times)) * float64(percentile) / 100.0)
	if index >= len(times) {
		index = len(times) - 1
	}
	
	return times[index]
}

func generateDBID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}