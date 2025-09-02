package pkg

import (
	"time"
)

// Collection represents a group of related API requests
type Collection struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Requests    []SavedRequest   `json:"requests"`
	Variables   map[string]string `json:"variables"`
	CreatedAt   time.Time        `json:"createdAt"`
	UpdatedAt   time.Time        `json:"updatedAt"`
}

// SavedRequest represents a saved API request within a collection
type SavedRequest struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Method      string            `json:"method"`
	URL         string            `json:"url"`
	Headers     map[string]string `json:"headers"`
	Body        string            `json:"body"`
	Tests       []TestScript      `json:"tests"`
	PreScript   string            `json:"preScript"`
	PostScript  string            `json:"postScript"`
	CreatedAt   time.Time         `json:"createdAt"`
}

// TestScript represents a test script for validation
type TestScript struct {
	Name        string `json:"name"`
	Script      string `json:"script"`
	Enabled     bool   `json:"enabled"`
}

// Environment represents environment variables
type Environment struct {
	ID        string            `json:"id"`
	Name      string            `json:"name"`
	Variables map[string]string `json:"variables"`
	Active    bool              `json:"active"`
}

// Workspace represents a workspace containing collections
type Workspace struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Description  string        `json:"description"`
	Collections  []Collection  `json:"collections"`
	Environments []Environment `json:"environments"`
	CreatedAt    time.Time     `json:"createdAt"`
}

// CollectionManager handles collection operations
type CollectionManager struct {
	workspaces map[string]*Workspace
}

// NewCollectionManager creates a new collection manager
func NewCollectionManager() *CollectionManager {
	return &CollectionManager{
		workspaces: make(map[string]*Workspace),
	}
}

// CreateWorkspace creates a new workspace
func (cm *CollectionManager) CreateWorkspace(name, description string) *Workspace {
	workspace := &Workspace{
		ID:           generateID(),
		Name:         name,
		Description:  description,
		Collections:  []Collection{},
		Environments: []Environment{},
		CreatedAt:    time.Now(),
	}
	cm.workspaces[workspace.ID] = workspace
	return workspace
}

// CreateCollection creates a new collection in a workspace
func (cm *CollectionManager) CreateCollection(workspaceID, name, description string) (*Collection, error) {
	workspace, exists := cm.workspaces[workspaceID]
	if !exists {
		workspace = cm.CreateWorkspace("Default", "Default workspace")
	}

	collection := Collection{
		ID:          generateID(),
		Name:        name,
		Description: description,
		Requests:    []SavedRequest{},
		Variables:   make(map[string]string),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	workspace.Collections = append(workspace.Collections, collection)
	return &collection, nil
}

// AddRequestToCollection adds a request to a collection
func (cm *CollectionManager) AddRequestToCollection(workspaceID, collectionID string, request SavedRequest) error {
	workspace, exists := cm.workspaces[workspaceID]
	if !exists {
		return &APIError{Message: "Workspace not found"}
	}

	for i := range workspace.Collections {
		if workspace.Collections[i].ID == collectionID {
			request.ID = generateID()
			request.CreatedAt = time.Now()
			workspace.Collections[i].Requests = append(workspace.Collections[i].Requests, request)
			workspace.Collections[i].UpdatedAt = time.Now()
			return nil
		}
	}
	return &APIError{Message: "Collection not found"}
}

// GetWorkspaces returns all workspaces
func (cm *CollectionManager) GetWorkspaces() map[string]*Workspace {
	return cm.workspaces
}

// APIError represents an API error
type APIError struct {
	Message string `json:"message"`
}

func (e *APIError) Error() string {
	return e.Message
}

// generateID generates a simple ID (in production, use UUID)
func generateID() string {
	return time.Now().Format("20060102150405") + "000"
}