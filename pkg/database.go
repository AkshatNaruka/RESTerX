package pkg

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"time"
)

// Database models for persistence
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"`
	FullName  string    `json:"fullName"`
	Avatar    string    `json:"avatar"`
	Role      string    `json:"role" gorm:"default:user"`
	IsActive  bool      `json:"isActive" gorm:"default:true"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	
	// Relationships
	Workspaces []UserWorkspace `json:"workspaces"`
	Requests   []RequestHistory `json:"requests"`
}

type WorkspaceDB struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description"`
	Type        string    `json:"type" gorm:"default:team"` // personal, team, enterprise
	IsActive    bool      `json:"isActive" gorm:"default:true"`
	CreatedBy   uint      `json:"createdBy"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	
	// Relationships
	Members     []UserWorkspace    `json:"members"`
	Collections []DBCollection     `json:"collections"`
	Environments []DBEnvironment   `json:"environments"`
}

type UserWorkspace struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"userId" gorm:"not null"`
	WorkspaceID uint      `json:"workspaceId" gorm:"not null"`
	Role        string    `json:"role" gorm:"default:member"` // admin, editor, viewer, member
	JoinedAt    time.Time `json:"joinedAt"`
	
	// Relationships
	User      User        `json:"user"`
	Workspace WorkspaceDB `json:"workspace"`
}

type DBCollection struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description"`
	WorkspaceID uint      `json:"workspaceId"`
	CreatedBy   uint      `json:"createdBy"`
	Version     int       `json:"version" gorm:"default:1"`
	IsPublic    bool      `json:"isPublic" gorm:"default:false"`
	Tags        string    `json:"tags"` // JSON string for tags
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	
	// Relationships
	Workspace WorkspaceDB     `json:"workspace"`
	Requests  []DBRequest     `json:"requests"`
}

type DBRequest struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	CollectionID uint      `json:"collectionId"`
	Name         string    `json:"name" gorm:"not null"`
	Method       string    `json:"method" gorm:"not null"`
	URL          string    `json:"url" gorm:"not null"`
	Headers      string    `json:"headers"` // JSON string
	Body         string    `json:"body"`
	AuthType     string    `json:"authType"`
	AuthData     string    `json:"authData"` // JSON string
	Tests        string    `json:"tests"` // JSON string
	PreScript    string    `json:"preScript"`
	PostScript   string    `json:"postScript"`
	Variables    string    `json:"variables"` // JSON string
	Order        int       `json:"order"`
	CreatedBy    uint      `json:"createdBy"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	
	// Relationships
	Collection DBCollection `json:"collection"`
}

type DBEnvironment struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	WorkspaceID uint      `json:"workspaceId"`
	Name        string    `json:"name" gorm:"not null"`
	Variables   string    `json:"variables"` // JSON string
	IsActive    bool      `json:"isActive" gorm:"default:false"`
	CreatedBy   uint      `json:"createdBy"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	
	// Relationships
	Workspace WorkspaceDB `json:"workspace"`
}

type RequestHistory struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"userId"`
	WorkspaceID  uint      `json:"workspaceId"`
	Method       string    `json:"method" gorm:"not null"`
	URL          string    `json:"url" gorm:"not null"`
	Headers      string    `json:"headers"` // JSON string
	Body         string    `json:"body"`
	StatusCode   int       `json:"statusCode"`
	ResponseTime int64     `json:"responseTime"` // milliseconds
	ResponseSize int64     `json:"responseSize"` // bytes
	Success      bool      `json:"success"`
	CreatedAt    time.Time `json:"createdAt"`
	
	// Relationships
	User      User        `json:"user"`
	Workspace WorkspaceDB `json:"workspace"`
}

type APIMonitor struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	WorkspaceID  uint      `json:"workspaceId"`
	Name         string    `json:"name" gorm:"not null"`
	URL          string    `json:"url" gorm:"not null"`
	Method       string    `json:"method" gorm:"default:GET"`
	Headers      string    `json:"headers"` // JSON string
	Interval     int       `json:"interval" gorm:"default:300"` // seconds
	Timeout      int       `json:"timeout" gorm:"default:30"` // seconds
	IsActive     bool      `json:"isActive" gorm:"default:true"`
	AlertEmail   string    `json:"alertEmail"`
	CreatedBy    uint      `json:"createdBy"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	
	// Relationships
	Workspace WorkspaceDB    `json:"workspace"`
	Checks    []MonitorCheck `json:"checks"`
}

type MonitorCheck struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	MonitorID   uint      `json:"monitorId"`
	StatusCode  int       `json:"statusCode"`
	ResponseTime int64     `json:"responseTime"` // milliseconds
	Success     bool      `json:"success"`
	Error       string    `json:"error"`
	CheckedAt   time.Time `json:"checkedAt"`
	
	// Relationships
	Monitor APIMonitor `json:"monitor"`
}

var DB *gorm.DB

// InitDatabase initializes the database connection and runs migrations
func InitDatabase(dsn string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	// Run auto-migration
	err = DB.AutoMigrate(
		&User{},
		&WorkspaceDB{},
		&UserWorkspace{},
		&DBCollection{},
		&DBRequest{},
		&DBEnvironment{},
		&RequestHistory{},
		&APIMonitor{},
		&MonitorCheck{},
	)
	if err != nil {
		return err
	}

	log.Println("Database initialized successfully")
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}