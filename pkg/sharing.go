package pkg

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// SharingService handles request and collection sharing
type SharingService struct {
	shares map[string]*SharedItem
}

// NewSharingService creates a new sharing service
func NewSharingService() *SharingService {
	return &SharingService{
		shares: make(map[string]*SharedItem),
	}
}

// SharedItem represents a shared request or collection
type SharedItem struct {
	ID          string      `json:"id"`
	Type        string      `json:"type"` // "request" or "collection"
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Content     interface{} `json:"content"`
	CreatedBy   string      `json:"createdBy"`
	CreatedAt   time.Time   `json:"createdAt"`
	ExpiresAt   *time.Time  `json:"expiresAt,omitempty"`
	Public      bool        `json:"public"`
	Password    string      `json:"password,omitempty"`
	Views       int         `json:"views"`
	MaxViews    int         `json:"maxViews,omitempty"`
	Settings    ShareSettings `json:"settings"`
}

// ShareSettings contains sharing configuration
type ShareSettings struct {
	AllowComments   bool   `json:"allowComments"`
	AllowDownload   bool   `json:"allowDownload"`
	AllowFork       bool   `json:"allowFork"`
	ShowMetadata    bool   `json:"showMetadata"`
	EmbedEnabled    bool   `json:"embedEnabled"`
	Theme           string `json:"theme"`
	CustomDomain    string `json:"customDomain,omitempty"`
}

// ShareRequest represents a request to share an item
type ShareRequest struct {
	Type        string      `json:"type"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Content     interface{} `json:"content"`
	ExpiryHours int         `json:"expiryHours,omitempty"`
	Public      bool        `json:"public"`
	Password    string      `json:"password,omitempty"`
	MaxViews    int         `json:"maxViews,omitempty"`
	Settings    ShareSettings `json:"settings"`
}

// ShareResponse contains the result of a share operation
type ShareResponse struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	ShortURL  string `json:"shortUrl"`
	EmbedCode string `json:"embedCode,omitempty"`
	QRCode    string `json:"qrCode,omitempty"`
}

// CreateShare creates a new shared item
func (ss *SharingService) CreateShare(req *ShareRequest, createdBy string) (*ShareResponse, error) {
	// Generate unique ID
	id := ss.generateShareID(req.Content, createdBy)

	// Set expiration if specified
	var expiresAt *time.Time
	if req.ExpiryHours > 0 {
		expiry := time.Now().Add(time.Duration(req.ExpiryHours) * time.Hour)
		expiresAt = &expiry
	}

	// Create shared item
	sharedItem := &SharedItem{
		ID:          id,
		Type:        req.Type,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		CreatedBy:   createdBy,
		CreatedAt:   time.Now(),
		ExpiresAt:   expiresAt,
		Public:      req.Public,
		Password:    req.Password,
		Views:       0,
		MaxViews:    req.MaxViews,
		Settings:    req.Settings,
	}

	// Store the share
	ss.shares[id] = sharedItem

	// Generate response
	response := &ShareResponse{
		ID:       id,
		URL:      fmt.Sprintf("https://resterx.com/share/%s", id),
		ShortURL: fmt.Sprintf("https://rxs.io/%s", id[:8]),
	}

	// Generate embed code if enabled
	if sharedItem.Settings.EmbedEnabled {
		response.EmbedCode = ss.generateEmbedCode(id, sharedItem.Settings.Theme)
	}

	// Generate QR code data (URL for QR generation)
	response.QRCode = fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=%s", response.URL)

	return response, nil
}

// GetShare retrieves a shared item
func (ss *SharingService) GetShare(id string, password string) (*SharedItem, error) {
	share, exists := ss.shares[id]
	if !exists {
		return nil, fmt.Errorf("shared item not found")
	}

	// Check expiration
	if share.ExpiresAt != nil && time.Now().After(*share.ExpiresAt) {
		delete(ss.shares, id)
		return nil, fmt.Errorf("shared item has expired")
	}

	// Check password
	if share.Password != "" && share.Password != password {
		return nil, fmt.Errorf("incorrect password")
	}

	// Check view limit
	if share.MaxViews > 0 && share.Views >= share.MaxViews {
		return nil, fmt.Errorf("view limit exceeded")
	}

	// Increment view count
	share.Views++

	return share, nil
}

// ListUserShares lists all shares created by a user
func (ss *SharingService) ListUserShares(userID string) []*SharedItem {
	var userShares []*SharedItem

	for _, share := range ss.shares {
		if share.CreatedBy == userID {
			userShares = append(userShares, share)
		}
	}

	return userShares
}

// ListPublicShares lists all public shares
func (ss *SharingService) ListPublicShares(limit int) []*SharedItem {
	var publicShares []*SharedItem
	count := 0

	for _, share := range ss.shares {
		if share.Public && (share.ExpiresAt == nil || time.Now().Before(*share.ExpiresAt)) {
			publicShares = append(publicShares, share)
			count++
			if limit > 0 && count >= limit {
				break
			}
		}
	}

	return publicShares
}

// UpdateShare updates an existing shared item
func (ss *SharingService) UpdateShare(id string, userID string, updates map[string]interface{}) error {
	share, exists := ss.shares[id]
	if !exists {
		return fmt.Errorf("shared item not found")
	}

	if share.CreatedBy != userID {
		return fmt.Errorf("permission denied")
	}

	// Update allowed fields
	if title, ok := updates["title"].(string); ok {
		share.Title = title
	}
	if description, ok := updates["description"].(string); ok {
		share.Description = description
	}
	if public, ok := updates["public"].(bool); ok {
		share.Public = public
	}
	if password, ok := updates["password"].(string); ok {
		share.Password = password
	}

	return nil
}

// DeleteShare deletes a shared item
func (ss *SharingService) DeleteShare(id string, userID string) error {
	share, exists := ss.shares[id]
	if !exists {
		return fmt.Errorf("shared item not found")
	}

	if share.CreatedBy != userID {
		return fmt.Errorf("permission denied")
	}

	delete(ss.shares, id)
	return nil
}

// ForkShare creates a copy of a shared item for the user
func (ss *SharingService) ForkShare(id string, userID string, newTitle string) (*ShareResponse, error) {
	originalShare, exists := ss.shares[id]
	if !exists {
		return nil, fmt.Errorf("shared item not found")
	}

	if !originalShare.Settings.AllowFork {
		return nil, fmt.Errorf("forking not allowed for this share")
	}

	// Create fork request
	forkReq := &ShareRequest{
		Type:        originalShare.Type,
		Title:       newTitle,
		Description: fmt.Sprintf("Forked from: %s", originalShare.Title),
		Content:     originalShare.Content,
		Public:      false, // Forks are private by default
		Settings:    originalShare.Settings,
	}

	return ss.CreateShare(forkReq, userID)
}

// GenerateShareableLink creates a temporary shareable link
func (ss *SharingService) GenerateShareableLink(content interface{}, expiryMinutes int) (string, error) {
	tempReq := &ShareRequest{
		Type:        "temporary",
		Title:       "Temporary Share",
		Content:     content,
		ExpiryHours: expiryMinutes / 60,
		Public:      true,
	}

	response, err := ss.CreateShare(tempReq, "anonymous")
	if err != nil {
		return "", err
	}

	return response.URL, nil
}

// GetShareAnalytics returns analytics for a shared item
func (ss *SharingService) GetShareAnalytics(id string, userID string) (map[string]interface{}, error) {
	share, exists := ss.shares[id]
	if !exists {
		return nil, fmt.Errorf("shared item not found")
	}

	if share.CreatedBy != userID {
		return nil, fmt.Errorf("permission denied")
	}

	analytics := map[string]interface{}{
		"totalViews":   share.Views,
		"createdAt":    share.CreatedAt,
		"lastViewed":   time.Now(), // Simplified - would track actual last view
		"isPublic":     share.Public,
		"hasPassword":  share.Password != "",
		"hasExpiry":    share.ExpiresAt != nil,
		"viewsRemaining": func() interface{} {
			if share.MaxViews > 0 {
				return share.MaxViews - share.Views
			}
			return "unlimited"
		}(),
	}

	return analytics, nil
}

// Helper functions

func (ss *SharingService) generateShareID(content interface{}, createdBy string) string {
	// Create a hash based on content and timestamp
	contentBytes, _ := json.Marshal(content)
	hash := sha256.Sum256(append(contentBytes, []byte(createdBy+fmt.Sprintf("%d", time.Now().UnixNano()))...))
	return hex.EncodeToString(hash[:])[:16] // Use first 16 characters
}

func (ss *SharingService) generateEmbedCode(id string, theme string) string {
	if theme == "" {
		theme = "light"
	}

	return fmt.Sprintf(`<iframe src="https://resterx.com/embed/%s?theme=%s" 
    width="100%%" height="600" 
    frameborder="0" 
    allowfullscreen>
</iframe>`, id, theme)
}

// ExportShareData exports a shared item in various formats
func (ss *SharingService) ExportShareData(id string, format string) ([]byte, error) {
	share, exists := ss.shares[id]
	if !exists {
		return nil, fmt.Errorf("shared item not found")
	}

	if !share.Settings.AllowDownload {
		return nil, fmt.Errorf("download not allowed for this share")
	}

	switch format {
	case "json":
		return json.MarshalIndent(share.Content, "", "  ")
	case "curl":
		if apiReq, ok := share.Content.(*APIRequest); ok {
			return []byte(ss.generateCurlCommand(apiReq)), nil
		}
		return nil, fmt.Errorf("invalid content type for curl export")
	default:
		return json.MarshalIndent(share, "", "  ")
	}
}

func (ss *SharingService) generateCurlCommand(req *APIRequest) string {
	curl := fmt.Sprintf("curl -X %s '%s'", req.Method, req.URL)

	// Add headers
	for key, value := range req.Headers {
		curl += fmt.Sprintf(" \\\n  -H '%s: %s'", key, value)
	}

	// Add body if present
	if req.Body != "" {
		curl += fmt.Sprintf(" \\\n  -d '%s'", req.Body)
	}

	return curl
}

// SearchShares searches public shares
func (ss *SharingService) SearchShares(query string, tags []string, limit int) []*SharedItem {
	var results []*SharedItem
	count := 0

	for _, share := range ss.shares {
		if !share.Public {
			continue
		}

		// Check if expired
		if share.ExpiresAt != nil && time.Now().After(*share.ExpiresAt) {
			continue
		}

		// Simple text search in title and description
		if query != "" {
			queryLower := strings.ToLower(query)
			titleMatch := strings.Contains(strings.ToLower(share.Title), queryLower)
			descMatch := strings.Contains(strings.ToLower(share.Description), queryLower)
			
			if !titleMatch && !descMatch {
				continue
			}
		}

		results = append(results, share)
		count++
		if limit > 0 && count >= limit {
			break
		}
	}

	return results
}

// GetShareMetadata returns metadata without the full content
func (ss *SharingService) GetShareMetadata(id string) (map[string]interface{}, error) {
	share, exists := ss.shares[id]
	if !exists {
		return nil, fmt.Errorf("shared item not found")
	}

	return map[string]interface{}{
		"id":          share.ID,
		"type":        share.Type,
		"title":       share.Title,
		"description": share.Description,
		"createdAt":   share.CreatedAt,
		"public":      share.Public,
		"hasPassword": share.Password != "",
		"views":       share.Views,
		"settings":    share.Settings,
	}, nil
}