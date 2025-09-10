package pkg

import (
	"database/sql"
	"errors"
	"time"
)

type WorkspaceService struct{}

type CreateWorkspaceRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        string `json:"type"` // team, enterprise
}

type InviteUserRequest struct {
	Email string `json:"email"`
	Role  string `json:"role"` // admin, editor, viewer, member
}

type WorkspaceStats struct {
	TotalRequests    int64   `json:"totalRequests"`
	TotalCollections int64   `json:"totalCollections"`
	ActiveMembers    int64   `json:"activeMembers"`
	AvgResponseTime  float64 `json:"avgResponseTime"`
	SuccessRate      float64 `json:"successRate"`
}

func NewWorkspaceService() *WorkspaceService {
	return &WorkspaceService{}
}

// CreateWorkspace creates a new workspace
func (ws *WorkspaceService) CreateWorkspace(userID uint, req CreateWorkspaceRequest) (*WorkspaceDB, error) {
	workspace := WorkspaceDB{
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		CreatedBy:   userID,
		IsActive:    true,
	}

	if err := DB.Create(&workspace).Error; err != nil {
		return nil, err
	}

	// Add creator as admin
	userWorkspace := UserWorkspace{
		UserID:      userID,
		WorkspaceID: workspace.ID,
		Role:        "admin",
		JoinedAt:    time.Now(),
	}

	if err := DB.Create(&userWorkspace).Error; err != nil {
		return nil, err
	}

	return &workspace, nil
}

// GetUserWorkspaces returns all workspaces for a user
func (ws *WorkspaceService) GetUserWorkspaces(userID uint) ([]WorkspaceDB, error) {
	var userWorkspaces []UserWorkspace
	if err := DB.Preload("Workspace").Where("user_id = ?", userID).Find(&userWorkspaces).Error; err != nil {
		return nil, err
	}

	var workspaces []WorkspaceDB
	for _, uw := range userWorkspaces {
		workspaces = append(workspaces, uw.Workspace)
	}

	return workspaces, nil
}

// GetWorkspaceMembers returns all members of a workspace
func (ws *WorkspaceService) GetWorkspaceMembers(workspaceID uint, userID uint) ([]UserWorkspace, error) {
	// Check if user has access to this workspace
	if !ws.HasWorkspaceAccess(userID, workspaceID) {
		return nil, errors.New("access denied")
	}

	var members []UserWorkspace
	if err := DB.Preload("User").Where("workspace_id = ?", workspaceID).Find(&members).Error; err != nil {
		return nil, err
	}

	// Clear passwords
	for i := range members {
		members[i].User.Password = ""
	}

	return members, nil
}

// InviteUser invites a user to workspace
func (ws *WorkspaceService) InviteUser(workspaceID uint, inviterID uint, req InviteUserRequest) error {
	// Check if inviter is admin
	var inviterWorkspace UserWorkspace
	if err := DB.Where("user_id = ? AND workspace_id = ?", inviterID, workspaceID).First(&inviterWorkspace).Error; err != nil {
		return errors.New("access denied")
	}

	if inviterWorkspace.Role != "admin" {
		return errors.New("only admins can invite users")
	}

	// Find user by email
	var user User
	if err := DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return errors.New("user not found")
	}

	// Check if user is already in workspace
	var existingMember UserWorkspace
	if err := DB.Where("user_id = ? AND workspace_id = ?", user.ID, workspaceID).First(&existingMember).Error; err == nil {
		return errors.New("user is already a member")
	}

	// Add user to workspace
	userWorkspace := UserWorkspace{
		UserID:      user.ID,
		WorkspaceID: workspaceID,
		Role:        req.Role,
		JoinedAt:    time.Now(),
	}

	return DB.Create(&userWorkspace).Error
}

// RemoveUser removes a user from workspace
func (ws *WorkspaceService) RemoveUser(workspaceID uint, adminID uint, userID uint) error {
	// Check if admin has permission
	var adminWorkspace UserWorkspace
	if err := DB.Where("user_id = ? AND workspace_id = ?", adminID, workspaceID).First(&adminWorkspace).Error; err != nil {
		return errors.New("access denied")
	}

	if adminWorkspace.Role != "admin" {
		return errors.New("only admins can remove users")
	}

	// Cannot remove workspace creator
	var workspace WorkspaceDB
	if err := DB.First(&workspace, workspaceID).Error; err != nil {
		return err
	}

	if workspace.CreatedBy == userID {
		return errors.New("cannot remove workspace creator")
	}

	// Remove user from workspace
	return DB.Where("user_id = ? AND workspace_id = ?", userID, workspaceID).Delete(&UserWorkspace{}).Error
}

// UpdateUserRole updates a user's role in workspace
func (ws *WorkspaceService) UpdateUserRole(workspaceID uint, adminID uint, userID uint, newRole string) error {
	// Check if admin has permission
	var adminWorkspace UserWorkspace
	if err := DB.Where("user_id = ? AND workspace_id = ?", adminID, workspaceID).First(&adminWorkspace).Error; err != nil {
		return errors.New("access denied")
	}

	if adminWorkspace.Role != "admin" {
		return errors.New("only admins can update roles")
	}

	// Update role
	return DB.Model(&UserWorkspace{}).Where("user_id = ? AND workspace_id = ?", userID, workspaceID).Update("role", newRole).Error
}

// HasWorkspaceAccess checks if user has access to workspace
func (ws *WorkspaceService) HasWorkspaceAccess(userID uint, workspaceID uint) bool {
	var userWorkspace UserWorkspace
	return DB.Where("user_id = ? AND workspace_id = ?", userID, workspaceID).First(&userWorkspace).Error == nil
}

// GetWorkspaceStats returns workspace analytics
func (ws *WorkspaceService) GetWorkspaceStats(workspaceID uint, userID uint) (*WorkspaceStats, error) {
	if !ws.HasWorkspaceAccess(userID, workspaceID) {
		return nil, errors.New("access denied")
	}

	stats := &WorkspaceStats{}

	// Total requests
	DB.Model(&RequestHistory{}).Where("workspace_id = ?", workspaceID).Count(&stats.TotalRequests)

	// Total collections
	DB.Model(&DBCollection{}).Where("workspace_id = ?", workspaceID).Count(&stats.TotalCollections)

	// Active members
	DB.Model(&UserWorkspace{}).Where("workspace_id = ?", workspaceID).Count(&stats.ActiveMembers)

	// Average response time
	var avgTime sql.NullFloat64
	DB.Model(&RequestHistory{}).Where("workspace_id = ?", workspaceID).Select("AVG(response_time)").Scan(&avgTime)
	if avgTime.Valid {
		stats.AvgResponseTime = avgTime.Float64
	}

	// Success rate
	var totalRequests, successfulRequests int64
	DB.Model(&RequestHistory{}).Where("workspace_id = ?", workspaceID).Count(&totalRequests)
	DB.Model(&RequestHistory{}).Where("workspace_id = ? AND success = ?", workspaceID, true).Count(&successfulRequests)

	if totalRequests > 0 {
		stats.SuccessRate = float64(successfulRequests) / float64(totalRequests) * 100
	}

	return stats, nil
}

// DeleteWorkspace deletes a workspace (admin only)
func (ws *WorkspaceService) DeleteWorkspace(workspaceID uint, userID uint) error {
	// Check if user is workspace creator
	var workspace WorkspaceDB
	if err := DB.First(&workspace, workspaceID).Error; err != nil {
		return err
	}

	if workspace.CreatedBy != userID {
		return errors.New("only workspace creator can delete workspace")
	}

	if workspace.Type == "personal" {
		return errors.New("cannot delete personal workspace")
	}

	// Delete all related data
	tx := DB.Begin()

	// Delete member relationships
	if err := tx.Where("workspace_id = ?", workspaceID).Delete(&UserWorkspace{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete collections and requests
	if err := tx.Where("workspace_id = ?", workspaceID).Delete(&DBCollection{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete environments
	if err := tx.Where("workspace_id = ?", workspaceID).Delete(&DBEnvironment{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete request history
	if err := tx.Where("workspace_id = ?", workspaceID).Delete(&RequestHistory{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete monitors
	if err := tx.Where("workspace_id = ?", workspaceID).Delete(&APIMonitor{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete workspace
	if err := tx.Delete(&workspace).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// UpdateWorkspace updates workspace details
func (ws *WorkspaceService) UpdateWorkspace(workspaceID uint, userID uint, updates map[string]interface{}) error {
	// Check if user is admin
	var userWorkspace UserWorkspace
	if err := DB.Where("user_id = ? AND workspace_id = ?", userID, workspaceID).First(&userWorkspace).Error; err != nil {
		return errors.New("access denied")
	}

	if userWorkspace.Role != "admin" {
		return errors.New("only admins can update workspace")
	}

	return DB.Model(&Workspace{}).Where("id = ?", workspaceID).Updates(updates).Error
}