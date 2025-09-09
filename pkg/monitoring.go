package pkg

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type MonitorService struct {
	monitors map[uint]*MonitorInstance
	mutex    sync.RWMutex
	client   *http.Client
}

type MonitorInstance struct {
	Monitor   APIMonitor
	ticker    *time.Ticker
	stopChan  chan bool
	isRunning bool
}

type MonitorAlert struct {
	ID          uint      `json:"id"`
	MonitorID   uint      `json:"monitorId"`
	AlertType   string    `json:"alertType"` // downtime, slow_response, error_rate
	Message     string    `json:"message"`
	Severity    string    `json:"severity"` // low, medium, high, critical
	TriggeredAt time.Time `json:"triggeredAt"`
	ResolvedAt  *time.Time `json:"resolvedAt,omitempty"`
	IsResolved  bool      `json:"isResolved"`
}

type MonitorStats struct {
	MonitorID       uint          `json:"monitorId"`
	TotalChecks     int64         `json:"totalChecks"`
	SuccessfulChecks int64        `json:"successfulChecks"`
	FailedChecks    int64         `json:"failedChecks"`
	AvgResponseTime time.Duration `json:"avgResponseTime"`
	Uptime          float64       `json:"uptime"`
	LastCheck       time.Time     `json:"lastCheck"`
	Status          string        `json:"status"` // up, down, degraded
	RecentChecks    []MonitorCheck `json:"recentChecks"`
}

type UptimeReport struct {
	MonitorID   uint                    `json:"monitorId"`
	Period      string                  `json:"period"` // 24h, 7d, 30d
	OverallUptime float64               `json:"overallUptime"`
	TotalChecks   int64                 `json:"totalChecks"`
	Incidents     []DowntimeIncident    `json:"incidents"`
	Metrics       []UptimeMetric        `json:"metrics"`
}

type DowntimeIncident struct {
	ID        uint      `json:"id"`
	StartTime time.Time `json:"startTime"`
	EndTime   *time.Time `json:"endTime,omitempty"`
	Duration  time.Duration `json:"duration"`
	Reason    string    `json:"reason"`
	IsOngoing bool      `json:"isOngoing"`
}

type UptimeMetric struct {
	Timestamp   time.Time `json:"timestamp"`
	StatusCode  int       `json:"statusCode"`
	ResponseTime time.Duration `json:"responseTime"`
	Success     bool      `json:"success"`
}

func NewMonitorService() *MonitorService {
	return &MonitorService{
		monitors: make(map[uint]*MonitorInstance),
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// CreateMonitor creates a new API monitor
func (ms *MonitorService) CreateMonitor(workspaceID uint, userID uint, monitor APIMonitor) (*APIMonitor, error) {
	// Verify workspace access
	ws := NewWorkspaceService()
	if !ws.HasWorkspaceAccess(userID, workspaceID) {
		return nil, fmt.Errorf("access denied to workspace")
	}

	monitor.WorkspaceID = workspaceID
	monitor.CreatedBy = userID
	monitor.IsActive = true

	if err := DB.Create(&monitor).Error; err != nil {
		return nil, err
	}

	// Start monitoring if active
	if monitor.IsActive {
		ms.StartMonitor(monitor.ID)
	}

	return &monitor, nil
}

// StartMonitor starts monitoring for a specific monitor
func (ms *MonitorService) StartMonitor(monitorID uint) error {
	ms.mutex.Lock()
	defer ms.mutex.Unlock()

	// Check if already running
	if instance, exists := ms.monitors[monitorID]; exists && instance.isRunning {
		return nil
	}

	// Load monitor from database
	var monitor APIMonitor
	if err := DB.First(&monitor, monitorID).Error; err != nil {
		return err
	}

	if !monitor.IsActive {
		return fmt.Errorf("monitor is not active")
	}

	// Create monitor instance
	instance := &MonitorInstance{
		Monitor:   monitor,
		ticker:    time.NewTicker(time.Duration(monitor.Interval) * time.Second),
		stopChan:  make(chan bool),
		isRunning: true,
	}

	ms.monitors[monitorID] = instance

	// Start monitoring goroutine
	go ms.runMonitor(instance)

	return nil
}

// StopMonitor stops monitoring for a specific monitor
func (ms *MonitorService) StopMonitor(monitorID uint) {
	ms.mutex.Lock()
	defer ms.mutex.Unlock()

	if instance, exists := ms.monitors[monitorID]; exists && instance.isRunning {
		instance.stopChan <- true
		instance.ticker.Stop()
		instance.isRunning = false
		delete(ms.monitors, monitorID)
	}
}

// runMonitor executes the monitoring loop for a specific monitor
func (ms *MonitorService) runMonitor(instance *MonitorInstance) {
	for {
		select {
		case <-instance.ticker.C:
			ms.performCheck(instance.Monitor)
		case <-instance.stopChan:
			return
		}
	}
}

// performCheck executes a single monitor check
func (ms *MonitorService) performCheck(monitor APIMonitor) {
	startTime := time.Now()
	
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(monitor.Timeout)*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, monitor.Method, monitor.URL, nil)
	if err != nil {
		ms.recordCheck(monitor.ID, 0, 0, false, err.Error())
		return
	}

	// Add headers if specified
	if monitor.Headers != "" {
		var headers map[string]string
		if err := json.Unmarshal([]byte(monitor.Headers), &headers); err == nil {
			for key, value := range headers {
				req.Header.Set(key, value)
			}
		}
	}

	resp, err := ms.client.Do(req)
	responseTime := time.Since(startTime)

	if err != nil {
		ms.recordCheck(monitor.ID, 0, responseTime.Milliseconds(), false, err.Error())
		ms.handleAlert(monitor, "downtime", fmt.Sprintf("Monitor check failed: %s", err.Error()))
		return
	}
	defer resp.Body.Close()

	success := resp.StatusCode >= 200 && resp.StatusCode < 400
	errorMsg := ""
	if !success {
		errorMsg = fmt.Sprintf("HTTP %d", resp.StatusCode)
	}

	ms.recordCheck(monitor.ID, resp.StatusCode, responseTime.Milliseconds(), success, errorMsg)

	// Check for slow response alert
	if responseTime > time.Duration(monitor.Timeout/2)*time.Second {
		ms.handleAlert(monitor, "slow_response", 
			fmt.Sprintf("Slow response detected: %dms", responseTime.Milliseconds()))
	}

	// Check error rate over recent checks
	if !success {
		errorRate := ms.calculateRecentErrorRate(monitor.ID)
		if errorRate > 50.0 { // Alert if error rate > 50%
			ms.handleAlert(monitor, "error_rate", 
				fmt.Sprintf("High error rate detected: %.1f%%", errorRate))
		}
	}
}

// recordCheck saves a monitor check result to database
func (ms *MonitorService) recordCheck(monitorID uint, statusCode int, responseTime int64, success bool, errorMsg string) {
	check := MonitorCheck{
		MonitorID:    monitorID,
		StatusCode:   statusCode,
		ResponseTime: responseTime,
		Success:      success,
		Error:        errorMsg,
		CheckedAt:    time.Now(),
	}

	DB.Create(&check)
}

// handleAlert processes and creates alerts
func (ms *MonitorService) handleAlert(monitor APIMonitor, alertType, message string) {
	// Check if similar alert already exists and is unresolved
	var existingAlert MonitorAlert
	err := DB.Where("monitor_id = ? AND alert_type = ? AND is_resolved = ?", 
		monitor.ID, alertType, false).First(&existingAlert).Error
	
	if err != nil { // No existing alert, create new one
		severity := ms.determineSeverity(alertType)
		
		alert := MonitorAlert{
			MonitorID:   monitor.ID,
			AlertType:   alertType,
			Message:     message,
			Severity:    severity,
			TriggeredAt: time.Now(),
			IsResolved:  false,
		}

		DB.Create(&alert)

		// Send notification if email is configured
		if monitor.AlertEmail != "" {
			go ms.sendAlertEmail(monitor.AlertEmail, alert)
		}
	}
}

// sendAlertEmail sends alert notification email
func (ms *MonitorService) sendAlertEmail(email string, alert MonitorAlert) {
	// Placeholder for email sending functionality
	// In production, this would integrate with email service
	fmt.Printf("Alert email sent to %s: %s\n", email, alert.Message)
}

// GetMonitorStats returns statistics for a monitor
func (ms *MonitorService) GetMonitorStats(monitorID uint, userID uint) (*MonitorStats, error) {
	// Verify access
	var monitor APIMonitor
	if err := DB.Preload("Workspace").First(&monitor, monitorID).Error; err != nil {
		return nil, err
	}

	ws := NewWorkspaceService()
	if !ws.HasWorkspaceAccess(userID, monitor.WorkspaceID) {
		return nil, fmt.Errorf("access denied")
	}

	stats := &MonitorStats{
		MonitorID: monitorID,
	}

	// Get total checks
	DB.Model(&MonitorCheck{}).Where("monitor_id = ?", monitorID).Count(&stats.TotalChecks)

	// Get successful checks
	DB.Model(&MonitorCheck{}).Where("monitor_id = ? AND success = ?", monitorID, true).
		Count(&stats.SuccessfulChecks)

	stats.FailedChecks = stats.TotalChecks - stats.SuccessfulChecks

	// Calculate uptime percentage
	if stats.TotalChecks > 0 {
		stats.Uptime = float64(stats.SuccessfulChecks) / float64(stats.TotalChecks) * 100
	}

	// Get average response time
	var avgTime sql.NullFloat64
	DB.Model(&MonitorCheck{}).Where("monitor_id = ?", monitorID).
		Select("AVG(response_time)").Scan(&avgTime)
	if avgTime.Valid {
		stats.AvgResponseTime = time.Duration(avgTime.Float64) * time.Millisecond
	}

	// Get last check
	var lastCheck MonitorCheck
	if err := DB.Where("monitor_id = ?", monitorID).Order("checked_at DESC").
		First(&lastCheck).Error; err == nil {
		stats.LastCheck = lastCheck.CheckedAt
		if lastCheck.Success {
			stats.Status = "up"
		} else {
			stats.Status = "down"
		}
	}

	// Get recent checks (last 50)
	DB.Where("monitor_id = ?", monitorID).Order("checked_at DESC").
		Limit(50).Find(&stats.RecentChecks)

	// Determine status based on recent checks
	if len(stats.RecentChecks) > 0 {
		recentSuccess := 0
		for _, check := range stats.RecentChecks {
			if check.Success {
				recentSuccess++
			}
		}
		recentSuccessRate := float64(recentSuccess) / float64(len(stats.RecentChecks)) * 100
		
		if recentSuccessRate >= 90 {
			stats.Status = "up"
		} else if recentSuccessRate >= 50 {
			stats.Status = "degraded"
		} else {
			stats.Status = "down"
		}
	}

	return stats, nil
}

// GetUptimeReport generates uptime report for a monitor
func (ms *MonitorService) GetUptimeReport(monitorID uint, period string, userID uint) (*UptimeReport, error) {
	// Verify access
	var monitor APIMonitor
	if err := DB.Preload("Workspace").First(&monitor, monitorID).Error; err != nil {
		return nil, err
	}

	ws := NewWorkspaceService()
	if !ws.HasWorkspaceAccess(userID, monitor.WorkspaceID) {
		return nil, fmt.Errorf("access denied")
	}

	var startTime time.Time
	switch period {
	case "24h":
		startTime = time.Now().Add(-24 * time.Hour)
	case "7d":
		startTime = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		startTime = time.Now().Add(-30 * 24 * time.Hour)
	default:
		startTime = time.Now().Add(-24 * time.Hour)
		period = "24h"
	}

	report := &UptimeReport{
		MonitorID: monitorID,
		Period:    period,
	}

	// Get checks for the period
	var checks []MonitorCheck
	DB.Where("monitor_id = ? AND checked_at >= ?", monitorID, startTime).
		Order("checked_at ASC").Find(&checks)

	if len(checks) == 0 {
		return report, nil
	}

	report.TotalChecks = int64(len(checks))

	// Calculate overall uptime
	successfulChecks := int64(0)
	for _, check := range checks {
		if check.Success {
			successfulChecks++
		}

		// Add to metrics
		metric := UptimeMetric{
			Timestamp:    check.CheckedAt,
			StatusCode:   check.StatusCode,
			ResponseTime: time.Duration(check.ResponseTime) * time.Millisecond,
			Success:      check.Success,
		}
		report.Metrics = append(report.Metrics, metric)
	}

	report.OverallUptime = float64(successfulChecks) / float64(report.TotalChecks) * 100

	// Identify downtime incidents
	report.Incidents = ms.identifyDowntimeIncidents(checks)

	return report, nil
}

// identifyDowntimeIncidents analyzes checks to identify downtime incidents
func (ms *MonitorService) identifyDowntimeIncidents(checks []MonitorCheck) []DowntimeIncident {
	var incidents []DowntimeIncident
	var currentIncident *DowntimeIncident

	for _, check := range checks {
		if !check.Success {
			if currentIncident == nil {
				// Start new incident
				currentIncident = &DowntimeIncident{
					StartTime: check.CheckedAt,
					Reason:    check.Error,
					IsOngoing: true,
				}
			}
		} else {
			if currentIncident != nil {
				// End current incident
				currentIncident.EndTime = &check.CheckedAt
				currentIncident.Duration = check.CheckedAt.Sub(currentIncident.StartTime)
				currentIncident.IsOngoing = false
				incidents = append(incidents, *currentIncident)
				currentIncident = nil
			}
		}
	}

	// Handle ongoing incident
	if currentIncident != nil {
		currentIncident.Duration = time.Since(currentIncident.StartTime)
		incidents = append(incidents, *currentIncident)
	}

	return incidents
}

// calculateRecentErrorRate calculates error rate for recent checks
func (ms *MonitorService) calculateRecentErrorRate(monitorID uint) float64 {
	var totalRecent, failedRecent int64
	
	// Get checks from last 10 minutes
	since := time.Now().Add(-10 * time.Minute)
	
	DB.Model(&MonitorCheck{}).Where("monitor_id = ? AND checked_at >= ?", 
		monitorID, since).Count(&totalRecent)
	
	DB.Model(&MonitorCheck{}).Where("monitor_id = ? AND checked_at >= ? AND success = ?", 
		monitorID, since, false).Count(&failedRecent)
	
	if totalRecent == 0 {
		return 0
	}
	
	return float64(failedRecent) / float64(totalRecent) * 100
}

// determineSeverity determines alert severity based on type
func (ms *MonitorService) determineSeverity(alertType string) string {
	switch alertType {
	case "downtime":
		return "critical"
	case "slow_response":
		return "medium"
	case "error_rate":
		return "high"
	default:
		return "low"
	}
}

// GetWorkspaceMonitors returns all monitors for a workspace
func (ms *MonitorService) GetWorkspaceMonitors(workspaceID uint, userID uint) ([]APIMonitor, error) {
	ws := NewWorkspaceService()
	if !ws.HasWorkspaceAccess(userID, workspaceID) {
		return nil, fmt.Errorf("access denied")
	}

	var monitors []APIMonitor
	if err := DB.Where("workspace_id = ?", workspaceID).Find(&monitors).Error; err != nil {
		return nil, err
	}

	return monitors, nil
}

// UpdateMonitor updates monitor configuration
func (ms *MonitorService) UpdateMonitor(monitorID uint, userID uint, updates map[string]interface{}) error {
	var monitor APIMonitor
	if err := DB.First(&monitor, monitorID).Error; err != nil {
		return err
	}

	ws := NewWorkspaceService()
	if !ws.HasWorkspaceAccess(userID, monitor.WorkspaceID) {
		return fmt.Errorf("access denied")
	}

	// Stop current monitoring if running
	ms.StopMonitor(monitorID)

	// Update monitor
	if err := DB.Model(&monitor).Updates(updates).Error; err != nil {
		return err
	}

	// Restart if still active
	if isActive, ok := updates["is_active"]; !ok || isActive.(bool) {
		ms.StartMonitor(monitorID)
	}

	return nil
}

// DeleteMonitor deletes a monitor
func (ms *MonitorService) DeleteMonitor(monitorID uint, userID uint) error {
	var monitor APIMonitor
	if err := DB.First(&monitor, monitorID).Error; err != nil {
		return err
	}

	ws := NewWorkspaceService()
	if !ws.HasWorkspaceAccess(userID, monitor.WorkspaceID) {
		return fmt.Errorf("access denied")
	}

	// Stop monitoring
	ms.StopMonitor(monitorID)

	// Delete related data
	tx := DB.Begin()
	
	// Delete checks
	if err := tx.Where("monitor_id = ?", monitorID).Delete(&MonitorCheck{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete monitor
	if err := tx.Delete(&monitor).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}