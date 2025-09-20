package pkg

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// WebSocketService handles WebSocket connections and testing
type WebSocketService struct {
	connections map[string]*WebSocketConnection
	mutex       sync.RWMutex
}

// NewWebSocketService creates a new WebSocket service
func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		connections: make(map[string]*WebSocketConnection),
	}
}

// WebSocketConnection represents a WebSocket connection
type WebSocketConnection struct {
	ID           string                 `json:"id"`
	URL          string                 `json:"url"`
	Status       string                 `json:"status"`
	Connected    bool                   `json:"connected"`
	ConnectedAt  time.Time             `json:"connectedAt,omitempty"`
	LastActivity time.Time             `json:"lastActivity,omitempty"`
	Messages     []WebSocketMessage    `json:"messages"`
	Headers      map[string]string     `json:"headers"`
	Protocols    []string              `json:"protocols"`
	Settings     WebSocketSettings     `json:"settings"`
	Stats        WebSocketStats        `json:"stats"`
	conn         *websocket.Conn
	messageChan  chan WebSocketMessage
	closeChan    chan bool
	mutex        sync.RWMutex
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`      // "sent", "received", "error", "connection", "disconnection"
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
	Size      int       `json:"size"`
	Format    string    `json:"format"`    // "text", "binary", "json", "xml"
	Direction string    `json:"direction"` // "inbound", "outbound"
}

// WebSocketSettings contains connection settings
type WebSocketSettings struct {
	AutoReconnect     bool          `json:"autoReconnect"`
	ReconnectInterval time.Duration `json:"reconnectInterval"`
	MaxReconnects     int           `json:"maxReconnects"`
	PingInterval      time.Duration `json:"pingInterval"`
	MessageLimit      int           `json:"messageLimit"`
	CompressionEnabled bool         `json:"compressionEnabled"`
	BufferSize        int           `json:"bufferSize"`
}

// WebSocketStats contains connection statistics
type WebSocketStats struct {
	MessagesSent     int           `json:"messagesSent"`
	MessagesReceived int           `json:"messagesReceived"`
	BytesSent        int64         `json:"bytesSent"`
	BytesReceived    int64         `json:"bytesReceived"`
	ConnectionTime   time.Duration `json:"connectionTime"`
	Latency          time.Duration `json:"latency"`
	Errors           int           `json:"errors"`
	Reconnects       int           `json:"reconnects"`
}

// WebSocketRequest represents a connection request
type WebSocketRequest struct {
	URL       string            `json:"url"`
	Headers   map[string]string `json:"headers"`
	Protocols []string          `json:"protocols"`
	Settings  WebSocketSettings `json:"settings"`
}

// Connect establishes a new WebSocket connection
func (ws *WebSocketService) Connect(request *WebSocketRequest) (*WebSocketConnection, error) {
	// Validate URL
	u, err := url.Parse(request.URL)
	if err != nil {
		return nil, fmt.Errorf("invalid WebSocket URL: %v", err)
	}

	if u.Scheme != "ws" && u.Scheme != "wss" {
		return nil, fmt.Errorf("invalid WebSocket scheme: %s", u.Scheme)
	}

	// Generate connection ID
	connID := fmt.Sprintf("ws_%d", time.Now().UnixNano())

	// Create connection object
	connection := &WebSocketConnection{
		ID:          connID,
		URL:         request.URL,
		Status:      "connecting",
		Connected:   false,
		Messages:    []WebSocketMessage{},
		Headers:     request.Headers,
		Protocols:   request.Protocols,
		Settings:    request.Settings,
		Stats:       WebSocketStats{},
		messageChan: make(chan WebSocketMessage, 100),
		closeChan:   make(chan bool, 1),
	}

	// Set default settings
	if connection.Settings.ReconnectInterval == 0 {
		connection.Settings.ReconnectInterval = 5 * time.Second
	}
	if connection.Settings.PingInterval == 0 {
		connection.Settings.PingInterval = 30 * time.Second
	}
	if connection.Settings.MessageLimit == 0 {
		connection.Settings.MessageLimit = 1000
	}
	if connection.Settings.BufferSize == 0 {
		connection.Settings.BufferSize = 1024
	}

	// Prepare headers
	header := http.Header{}
	for key, value := range request.Headers {
		header.Set(key, value)
	}

	// Create dialer
	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
		Subprotocols:     request.Protocols,
	}

	if connection.Settings.CompressionEnabled {
		dialer.EnableCompression = true
	}

	// Establish connection
	startTime := time.Now()
	conn, resp, err := dialer.Dial(request.URL, header)
	if err != nil {
		connection.Status = "failed"
		connection.addMessage("error", fmt.Sprintf("Connection failed: %v", err), "outbound")
		return connection, err
	}
	defer func() {
		if resp != nil && resp.Body != nil {
			resp.Body.Close()
		}
	}()

	// Update connection
	connection.conn = conn
	connection.Connected = true
	connection.ConnectedAt = time.Now()
	connection.LastActivity = time.Now()
	connection.Status = "connected"
	connection.Stats.ConnectionTime = time.Since(startTime)

	// Add connection message
	connection.addMessage("connection", "WebSocket connected", "inbound")

	// Store connection
	ws.mutex.Lock()
	ws.connections[connID] = connection
	ws.mutex.Unlock()

	// Start message handlers
	go connection.startReading()
	go connection.startPinging()

	return connection, nil
}

// SendMessage sends a message through the WebSocket connection
func (ws *WebSocketService) SendMessage(connID string, message string, messageType string) error {
	ws.mutex.RLock()
	connection, exists := ws.connections[connID]
	ws.mutex.RUnlock()

	if !exists {
		return fmt.Errorf("connection not found")
	}

	if !connection.Connected {
		return fmt.Errorf("connection not active")
	}

	// Determine message type
	var msgType int
	switch messageType {
	case "text":
		msgType = websocket.TextMessage
	case "binary":
		msgType = websocket.BinaryMessage
	case "ping":
		msgType = websocket.PingMessage
	case "pong":
		msgType = websocket.PongMessage
	default:
		msgType = websocket.TextMessage
	}

	// Send message
	connection.mutex.Lock()
	err := connection.conn.WriteMessage(msgType, []byte(message))
	connection.mutex.Unlock()

	if err != nil {
		connection.addMessage("error", fmt.Sprintf("Send failed: %v", err), "outbound")
		return err
	}

	// Update stats
	connection.Stats.MessagesSent++
	connection.Stats.BytesSent += int64(len(message))
	connection.LastActivity = time.Now()

	// Add to message log
	connection.addMessage("sent", message, "outbound")

	return nil
}

// GetConnection retrieves a WebSocket connection
func (ws *WebSocketService) GetConnection(connID string) (*WebSocketConnection, error) {
	ws.mutex.RLock()
	connection, exists := ws.connections[connID]
	ws.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("connection not found")
	}

	return connection, nil
}

// CloseConnection closes a WebSocket connection
func (ws *WebSocketService) CloseConnection(connID string) error {
	ws.mutex.RLock()
	connection, exists := ws.connections[connID]
	ws.mutex.RUnlock()

	if !exists {
		return fmt.Errorf("connection not found")
	}

	return connection.close()
}

// ListConnections returns all active connections
func (ws *WebSocketService) ListConnections() []*WebSocketConnection {
	ws.mutex.RLock()
	defer ws.mutex.RUnlock()

	var connections []*WebSocketConnection
	for _, conn := range ws.connections {
		connections = append(connections, conn)
	}

	return connections
}

// Connection methods

func (conn *WebSocketConnection) startReading() {
	defer func() {
		conn.Connected = false
		conn.Status = "disconnected"
		conn.addMessage("disconnection", "WebSocket disconnected", "inbound")
	}()

	for {
		select {
		case <-conn.closeChan:
			return
		default:
			conn.mutex.Lock()
			msgType, message, err := conn.conn.ReadMessage()
			conn.mutex.Unlock()

			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					conn.addMessage("error", fmt.Sprintf("Read error: %v", err), "inbound")
				}
				conn.Stats.Errors++
				return
			}

			// Update stats
			conn.Stats.MessagesReceived++
			conn.Stats.BytesReceived += int64(len(message))
			conn.LastActivity = time.Now()

			// Determine message format (simplified for now)
			_ = msgType // msgType variable acknowledged but not used in this version

			// Add to message log
			conn.addMessage("received", string(message), "inbound")

			// Limit message history
			if len(conn.Messages) > conn.Settings.MessageLimit {
				conn.Messages = conn.Messages[1:]
			}
		}
	}
}

func (conn *WebSocketConnection) startPinging() {
	ticker := time.NewTicker(conn.Settings.PingInterval)
	defer ticker.Stop()

	for {
		select {
		case <-conn.closeChan:
			return
		case <-ticker.C:
			if conn.Connected {
				conn.mutex.Lock()
				err := conn.conn.WriteMessage(websocket.PingMessage, nil)
				conn.mutex.Unlock()

				if err != nil {
					conn.addMessage("error", fmt.Sprintf("Ping failed: %v", err), "outbound")
					return
				}
			}
		}
	}
}

func (conn *WebSocketConnection) close() error {
	if !conn.Connected {
		return nil
	}

	conn.Connected = false
	conn.Status = "disconnected"

	// Signal goroutines to stop
	close(conn.closeChan)

	// Close WebSocket connection
	conn.mutex.Lock()
	err := conn.conn.Close()
	conn.mutex.Unlock()

	conn.addMessage("disconnection", "WebSocket connection closed", "outbound")
	return err
}

func (conn *WebSocketConnection) addMessage(msgType string, content string, direction string) {
	message := WebSocketMessage{
		ID:        fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		Type:      msgType,
		Content:   content,
		Timestamp: time.Now(),
		Size:      len(content),
		Direction: direction,
	}

	// Determine format
	if msgType == "sent" || msgType == "received" {
		if conn.isJSON(content) {
			message.Format = "json"
		} else if conn.isXML(content) {
			message.Format = "xml"
		} else {
			message.Format = "text"
		}
	}

	conn.mutex.Lock()
	conn.Messages = append(conn.Messages, message)
	conn.mutex.Unlock()

	// Send to message channel for real-time updates
	select {
	case conn.messageChan <- message:
	default:
		// Channel full, skip
	}
}

func (conn *WebSocketConnection) isJSON(content string) bool {
	var js json.RawMessage
	return json.Unmarshal([]byte(content), &js) == nil
}

func (conn *WebSocketConnection) isXML(content string) bool {
	content = strings.TrimSpace(content)
	return strings.HasPrefix(content, "<") && strings.HasSuffix(content, ">")
}

// GetMessageHistory returns recent messages
func (conn *WebSocketConnection) GetMessageHistory(limit int) []WebSocketMessage {
	conn.mutex.RLock()
	defer conn.mutex.RUnlock()

	if limit <= 0 || limit > len(conn.Messages) {
		return conn.Messages
	}

	start := len(conn.Messages) - limit
	return conn.Messages[start:]
}

// GetConnectionStats returns current connection statistics
func (conn *WebSocketConnection) GetConnectionStats() WebSocketStats {
	conn.mutex.RLock()
	defer conn.mutex.RUnlock()

	stats := conn.Stats
	if conn.Connected {
		stats.ConnectionTime = time.Since(conn.ConnectedAt)
	}

	return stats
}

// TestWebSocketEndpoint performs a connection test
func (ws *WebSocketService) TestWebSocketEndpoint(url string, timeout time.Duration) map[string]interface{} {
	result := map[string]interface{}{
		"success":      false,
		"responseTime": 0,
		"error":        "",
		"protocols":    []string{},
		"headers":      map[string]string{},
	}

	startTime := time.Now()

	// Create dialer with timeout
	dialer := websocket.Dialer{
		HandshakeTimeout: timeout,
	}

	// Attempt connection
	conn, resp, err := dialer.Dial(url, nil)
	responseTime := time.Since(startTime)

	result["responseTime"] = responseTime.Milliseconds()

	if err != nil {
		result["error"] = err.Error()
		return result
	}

	// Connection successful
	result["success"] = true

	// Extract response information
	if resp != nil {
		headers := make(map[string]string)
		for key, values := range resp.Header {
			if len(values) > 0 {
				headers[key] = values[0]
			}
		}
		result["headers"] = headers
		
		// Get supported protocols
		if protocols, ok := resp.Header["Sec-Websocket-Protocol"]; ok {
			result["protocols"] = protocols
		}
	}

	// Close connection
	conn.Close()

	return result
}