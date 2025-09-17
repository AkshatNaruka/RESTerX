package pkg

import (
	"errors"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your-secret-key-change-this-in-production")

type AuthService struct{}

type JWTClaims struct {
	UserID      uint   `json:"userId"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	WorkspaceID uint   `json:"workspaceId,omitempty"`
	jwt.RegisteredClaims
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"fullName"`
}

type LoginResponse struct {
	Token        string        `json:"token"`
	RefreshToken string        `json:"refreshToken"`
	User         *User         `json:"user"`
	Workspaces   []WorkspaceDB `json:"workspaces"`
}

func NewAuthService() *AuthService {
	return &AuthService{}
}

// HashPassword hashes a plain text password
func (as *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword compares a hashed password with a plain text password
func (as *AuthService) CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateToken generates a JWT token for a user
func (as *AuthService) GenerateToken(user *User, workspaceID uint) (string, error) {
	claims := JWTClaims{
		UserID:      user.ID,
		Username:    user.Username,
		Email:       user.Email,
		Role:        user.Role,
		WorkspaceID: workspaceID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GenerateRefreshToken generates a refresh token
func (as *AuthService) GenerateRefreshToken(user *User) (string, error) {
	claims := JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken validates a JWT token and returns the claims
func (as *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// Register creates a new user account
func (as *AuthService) Register(req RegisterRequest) (*User, error) {
	// Check if user already exists
	var existingUser User
	if err := DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := as.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		FullName: req.FullName,
		Role:     "user",
		IsActive: true,
	}

	if err := DB.Create(&user).Error; err != nil {
		return nil, err
	}

	// Create default personal workspace
	workspace := WorkspaceDB{
		Name:        req.Username + "'s Workspace",
		Description: "Personal workspace",
		Type:        "personal",
		CreatedBy:   user.ID,
		IsActive:    true,
	}

	if err := DB.Create(&workspace).Error; err != nil {
		return nil, err
	}

	// Add user to workspace as admin
	userWorkspace := UserWorkspace{
		UserID:      user.ID,
		WorkspaceID: workspace.ID,
		Role:        "admin",
		JoinedAt:    time.Now(),
	}

	if err := DB.Create(&userWorkspace).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// Login authenticates a user and returns tokens
func (as *AuthService) Login(req LoginRequest) (*LoginResponse, error) {
	// Check for hardcoded admin credentials first
	if req.Username == "admin" && req.Password == "admin123" {
		// Create hardcoded admin user response
		adminUser := User{
			ID:       999999, // Use high ID to avoid conflicts
			Username: "admin",
			Email:    "admin@resterx.com",
			FullName: "Administrator",
			Role:     "admin",
			IsActive: true,
		}

		// Create default admin workspace
		adminWorkspace := WorkspaceDB{
			ID:          999999,
			Name:        "Admin Workspace",
			Description: "Administrator workspace",
			Type:        "personal",
			IsActive:    true,
			CreatedBy:   999999,
		}

		// Generate tokens for admin
		token, err := as.GenerateToken(&adminUser, 999999)
		if err != nil {
			return nil, err
		}

		refreshToken, err := as.GenerateRefreshToken(&adminUser)
		if err != nil {
			return nil, err
		}

		return &LoginResponse{
			Token:        token,
			RefreshToken: refreshToken,
			User:         &adminUser,
			Workspaces:   []WorkspaceDB{adminWorkspace},
		}, nil
	}

	var user User
	if err := DB.Where("username = ? OR email = ?", req.Username, req.Username).First(&user).Error; err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsActive {
		return nil, errors.New("account is deactivated")
	}

	if err := as.CheckPassword(user.Password, req.Password); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Get user workspaces
	var userWorkspaces []UserWorkspace
	if err := DB.Preload("Workspace").Where("user_id = ?", user.ID).Find(&userWorkspaces).Error; err != nil {
		return nil, err
	}

	var workspaces []WorkspaceDB
	var defaultWorkspaceID uint
	for _, uw := range userWorkspaces {
		workspaces = append(workspaces, uw.Workspace)
		if uw.Workspace.Type == "personal" {
			defaultWorkspaceID = uw.Workspace.ID
		}
	}

	if defaultWorkspaceID == 0 && len(workspaces) > 0 {
		defaultWorkspaceID = workspaces[0].ID
	}

	// Generate tokens
	token, err := as.GenerateToken(&user, defaultWorkspaceID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := as.GenerateRefreshToken(&user)
	if err != nil {
		return nil, err
	}

	// Clear password from response
	user.Password = ""

	return &LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         &user,
		Workspaces:   workspaces,
	}, nil
}

// RefreshToken refreshes an access token using a refresh token
func (as *AuthService) RefreshToken(refreshToken string) (string, error) {
	claims, err := as.ValidateToken(refreshToken)
	if err != nil {
		return "", err
	}

	var user User
	if err := DB.First(&user, claims.UserID).Error; err != nil {
		return "", errors.New("user not found")
	}

	if !user.IsActive {
		return "", errors.New("account is deactivated")
	}

	// Generate new access token with default workspace
	var userWorkspaces []UserWorkspace
	DB.Preload("Workspace").Where("user_id = ?", user.ID).Find(&userWorkspaces)
	
	var defaultWorkspaceID uint
	for _, uw := range userWorkspaces {
		if uw.Workspace.Type == "personal" {
			defaultWorkspaceID = uw.Workspace.ID
			break
		}
	}

	return as.GenerateToken(&user, defaultWorkspaceID)
}

// GetUserByID retrieves a user by ID
func (as *AuthService) GetUserByID(userID uint) (*User, error) {
	var user User
	if err := DB.First(&user, userID).Error; err != nil {
		return nil, err
	}
	user.Password = ""
	return &user, nil
}

// UpdateUserProfile updates user profile information
func (as *AuthService) UpdateUserProfile(userID uint, updates map[string]interface{}) error {
	return DB.Model(&User{}).Where("id = ?", userID).Updates(updates).Error
}

// ChangePassword changes a user's password
func (as *AuthService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	var user User
	if err := DB.First(&user, userID).Error; err != nil {
		return err
	}

	if err := as.CheckPassword(user.Password, oldPassword); err != nil {
		return errors.New("invalid current password")
	}

	hashedPassword, err := as.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return DB.Model(&user).Update("password", hashedPassword).Error
}