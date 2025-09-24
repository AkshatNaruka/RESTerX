class RESTerX {
    constructor() {
        this.authToken = localStorage.getItem('resterx-auth-token');
        this.currentUser = JSON.parse(localStorage.getItem('resterx-user') || 'null');
        this.currentWorkspace = JSON.parse(localStorage.getItem('resterx-workspace') || 'null');
        this.isStaticMode = this.detectStaticMode();
        
        // Check authentication status - automatically use demo account for API playground mode
        if (!this.authToken) {
            this.autoLoginWithDemo();
        } else {
            this.init();
            this.setupEventListeners();
            this.loadHistory();
            this.showUserBar();
        }
    }

    // Detect if we're running in static mode (GitHub Pages) without backend
    detectStaticMode() {
        // Check if we're on GitHub Pages or likely running without backend
        const isGitHubPages = window.location.hostname.includes('github.io');
        const isFileProtocol = window.location.protocol === 'file:';
        
        // If we're clearly on GitHub Pages or file protocol, we're in static mode
        if (isGitHubPages || isFileProtocol) {
            return true;
        }
        
        // For other cases, we'll detect this at runtime when API calls fail
        return false;
    }

    init() {
        this.history = JSON.parse(localStorage.getItem('resterx-history') || '[]');
        this.currentTheme = localStorage.getItem('resterx-theme') || 'light';
        this.collections = JSON.parse(localStorage.getItem('resterx-collections') || '[]');
        this.environments = JSON.parse(localStorage.getItem('resterx-environments') || '[]');
        this.activeEnvironment = localStorage.getItem('resterx-active-env') || '';
        this.variables = JSON.parse(localStorage.getItem('resterx-variables') || '{}');
        this.analytics = JSON.parse(localStorage.getItem('resterx-analytics') || '{"requests": [], "totalRequests": 0, "successfulRequests": 0}');
        this.applyTheme();
        this.loadCollections();
        this.loadEnvironments();
        this.updateAnalytics();
        
        // Setup mobile enhancements
        this.setupMobileEnhancements();
    }

    // Auto-login with demo account for API playground mode
    async autoLoginWithDemo() {
        // Hide auth modal during auto-login
        document.getElementById('authModal').style.display = 'none';
        
        // In static mode, skip API calls and simulate successful authentication
        if (this.isStaticMode) {
            this.handleStaticModeDemo();
            return;
        }
        
        try {
            // Create demo account if it doesn't exist
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'demo',
                    email: 'demo@resterx.com',
                    password: 'demo123',
                    fullName: 'API Playground Demo User'
                })
            });
        } catch (error) {
            // Account might already exist, continue with login
        }

        // Login with demo credentials
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'demo',
                    password: 'demo123'
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.handleAuthSuccess(data);
                console.log('🚀 RESTerX API Playground ready - Demo user logged in automatically');
            } else if (response.status === 501 || response.status === 404) {
                // 501 = Unsupported method (Python HTTP server), 404 = Not found (static mode)
                console.log('Detected static mode (API not available), enabling demo without backend');
                this.isStaticMode = true;
                this.handleStaticModeDemo();
            } else {
                console.error('Demo login failed, falling back to auth modal');
                this.showAuthModal();
            }
        } catch (error) {
            console.error('Demo login error:', error);
            // If we get a network error, we might be in static mode
            console.log('Detected static mode (network error), enabling demo without backend');
            this.isStaticMode = true;
            this.handleStaticModeDemo();
        }
    }

    // Handle demo authentication in static mode (no backend)
    handleStaticModeDemo() {
        // Create fake auth data for static mode
        const staticDemoData = {
            token: 'static-demo-token-' + Date.now(),
            user: {
                id: 1,
                username: 'demo',
                email: 'demo@resterx.com',
                fullName: 'Demo User (Static Mode)',
                role: 'user'
            },
            workspaces: [{
                id: 1,
                name: 'Demo Workspace',
                description: 'Static mode demo workspace'
            }]
        };

        // Simulate successful authentication
        this.handleAuthSuccess(staticDemoData);
        console.log('🚀 RESTerX Static Mode - Demo user logged in (no backend required)');
    }

    // Authentication Methods
    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
        this.setupAuthEventListeners();
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    showUserBar() {
        if (this.currentUser) {
            document.getElementById('userBar').style.display = 'flex';
            document.getElementById('userName').textContent = this.currentUser.fullName || this.currentUser.username;
        }
    }

    hideUserBar() {
        document.getElementById('userBar').style.display = 'none';
    }

    setupAuthEventListeners() {
        // Auth tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });

        // Login form
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('demoLogin').addEventListener('click', () => this.handleDemoLogin());

        // Register form
        document.getElementById('registerBtn').addEventListener('click', () => this.handleRegister());

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Enter key handling
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');

        // Clear error
        this.hideAuthError();
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showAuthError('Please enter both username and password');
            return;
        }

        // Check if this is demo credentials in static mode
        if ((this.isStaticMode || username === 'demo') && username === 'demo' && password === 'demo123') {
            this.isStaticMode = true;
            this.handleStaticModeDemo();
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.handleAuthSuccess(data);
            } else if ((response.status === 501 || response.status === 404) && username === 'demo' && password === 'demo123') {
                // Static mode detected with demo credentials
                console.log('Detected static mode during login, enabling demo without backend');
                this.isStaticMode = true;
                this.handleStaticModeDemo();
            } else {
                const error = await response.text();
                this.showAuthError(error || 'Login failed');
            }
        } catch (error) {
            if (username === 'demo' && password === 'demo123') {
                // Network error with demo credentials - enable static mode
                console.log('Detected static mode during login (network error), enabling demo without backend');
                this.isStaticMode = true;
                this.handleStaticModeDemo();
            } else {
                this.showAuthError('Network error. Please try again.');
            }
        }
    }

    async handleDemoLogin() {
        // In static mode, use the static mode demo handler
        if (this.isStaticMode) {
            this.handleStaticModeDemo();
            return;
        }

        // Create demo account if it doesn't exist, then login
        try {
            // First try to register demo account
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'demo',
                    email: 'demo@resterx.com',
                    password: 'demo123',
                    fullName: 'Demo User'
                })
            });
        } catch (error) {
            // Account might already exist, continue with login
        }

        // Login with demo credentials
        document.getElementById('loginUsername').value = 'demo';
        document.getElementById('loginPassword').value = 'demo123';
        await this.handleLogin();
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const fullName = document.getElementById('registerFullName').value;
        const password = document.getElementById('registerPassword').value;

        if (!username || !email || !password) {
            this.showAuthError('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, fullName, password })
            });

            if (response.ok) {
                // Switch to login tab and show success message
                this.switchAuthTab('login');
                this.showAuthError('Account created successfully! Please log in.', 'success');
                
                // Pre-fill login form
                document.getElementById('loginUsername').value = username;
            } else {
                const error = await response.text();
                this.showAuthError(error || 'Registration failed');
            }
        } catch (error) {
            this.showAuthError('Network error. Please try again.');
        }
    }

    handleAuthSuccess(data) {
        // Store authentication data
        localStorage.setItem('resterx-auth-token', data.token);
        localStorage.setItem('resterx-user', JSON.stringify(data.user));
        if (data.workspaces && data.workspaces.length > 0) {
            localStorage.setItem('resterx-workspace', JSON.stringify(data.workspaces[0]));
        }

        this.authToken = data.token;
        this.currentUser = data.user;
        this.currentWorkspace = data.workspaces?.[0] || null;

        // Initialize the app
        this.hideAuthModal();
        this.showUserBar();
        this.init();
        this.setupEventListeners();
        this.loadHistory();

        // Show success message
        this.showNotification('Welcome to RESTerX Enterprise! 🚀', 'success');
    }

    handleLogout() {
        // Clear authentication data
        localStorage.removeItem('resterx-auth-token');
        localStorage.removeItem('resterx-user');
        localStorage.removeItem('resterx-workspace');

        this.authToken = null;
        this.currentUser = null;
        this.currentWorkspace = null;

        // Show auth modal
        this.hideUserBar();
        this.showAuthModal();
    }

    showAuthError(message, type = 'error') {
        const errorDiv = document.getElementById('authError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        if (type === 'success') {
            errorDiv.style.background = 'rgba(40, 167, 69, 0.1)';
            errorDiv.style.borderColor = '#28a745';
            errorDiv.style.color = '#28a745';
        } else {
            errorDiv.style.background = 'rgba(220, 53, 69, 0.1)';
            errorDiv.style.borderColor = '#dc3545';
            errorDiv.style.color = '#dc3545';
        }
    }

    hideAuthError() {
        document.getElementById('authError').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--success-color);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Enhanced request method with authentication
    async sendRequest() {
        if (!this.authToken) {
            this.showAuthModal();
            return;
        }

        // Get request data
        const method = document.getElementById('methodSelect').value;
        const url = document.getElementById('urlInput').value.trim();
        
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Show loading
        document.getElementById('loading').style.display = 'flex';
        
        // Collect headers
        const headers = {};
        document.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key) {
                headers[key] = value;
            }
        });

        // Get body content
        let body = '';
        const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
        if (bodyType === 'json' || bodyType === 'text') {
            body = document.getElementById('requestBody').value;
        } else if (bodyType === 'form') {
            const formData = {};
            document.querySelectorAll('.form-row').forEach(row => {
                const key = row.querySelector('.form-key').value.trim();
                const value = row.querySelector('.form-value').value.trim();
                if (key) {
                    formData[key] = value;
                }
            });
            body = JSON.stringify(formData);
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch('/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    method,
                    url,
                    headers,
                    body
                })
            });

            if (response.status === 401) {
                // Token expired
                this.handleLogout();
                return;
            }

            const result = await response.json();
            this.displayResponse(result);
            this.addToHistory({ method, url, headers, body }, result);
            
        } catch (error) {
            this.displayError(error.message);
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Shortcuts modal
        document.getElementById('shortcutsBtn').addEventListener('click', () => this.showShortcutsModal());

        // Template selector
        document.getElementById('templateSelect').addEventListener('change', (e) => this.loadTemplate(e.target.value));

        // Send request
        document.getElementById('sendBtn').addEventListener('click', () => this.sendRequest());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.querySelectorAll('.response-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchResponseTab(e.target.dataset.tab));
        });

        // Add/remove headers
        document.getElementById('addHeader').addEventListener('click', () => this.addHeaderRow());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-header')) {
                this.removeHeaderRow(e.target);
            }
        });

        // Body type change
        document.querySelectorAll('input[name="bodyType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleBodyTypeChange(e.target.value));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Enhanced UI Event Listeners
        this.setupEnhancedEventListeners();

        // Auth type change
        document.querySelectorAll('input[name="authType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleAuthTypeChange(e.target.value));
        });

        // Add/remove form data
        document.getElementById('addFormData').addEventListener('click', () => this.addFormDataRow());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-form')) {
                this.removeFormDataRow(e.target);
            }
        });

        // Response controls
        document.getElementById('formatJson').addEventListener('click', () => this.formatJsonResponse());
        document.getElementById('copyResponse').addEventListener('click', () => this.copyResponse());

        // History
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());

        // URL input enter key
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendRequest();
            }
        });

        // New enhanced features event listeners
        
        // Environment management
        document.getElementById('manageEnv').addEventListener('click', () => this.showEnvironmentModal());
        document.getElementById('environmentSelect').addEventListener('change', (e) => this.setActiveEnvironment(e.target.value));
        
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSidebarTab(e.target.dataset.tab));
        });

        // Collections
        document.getElementById('newCollection').addEventListener('click', () => this.showCollectionModal());

        // Variables
        document.getElementById('addVariable').addEventListener('click', () => this.addVariableRow());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-variable')) {
                this.removeVariableRow(e.target);
            }
        });

        // Environment modal
        document.getElementById('addEnvVar').addEventListener('click', () => this.addEnvVariableRow());
        document.getElementById('createEnv').addEventListener('click', () => this.createEnvironment());
        document.getElementById('createCollection').addEventListener('click', () => this.createCollection());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Code generation
        document.getElementById('generateCode').addEventListener('click', () => this.generateCode());
        document.getElementById('copyCode').addEventListener('click', () => this.copyGeneratedCode());

        // Mock server
        document.getElementById('createMockFromRequest').addEventListener('click', () => this.createMockFromRequest());
        document.getElementById('viewMockEndpoints').addEventListener('click', () => this.viewMockEndpoints());
        document.getElementById('generateApiDocs').addEventListener('click', () => this.generateApiDocs());

        // Documentation
        document.getElementById('refreshDocs').addEventListener('click', () => this.refreshDocumentation());
        document.getElementById('exportOpenAPI').addEventListener('click', () => this.exportOpenAPI());
        document.getElementById('copyDocs').addEventListener('click', () => this.copyDocumentation());

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());

        // History search and filtering
        document.getElementById('historySearch').addEventListener('input', (e) => this.filterHistory());
        document.getElementById('methodFilter').addEventListener('change', (e) => this.filterHistory());
        document.getElementById('statusFilter').addEventListener('change', (e) => this.filterHistory());

        // Mobile sidebar functionality
        document.getElementById('mobileSidebarToggle').addEventListener('click', () => this.toggleMobileSidebar());
        document.getElementById('mobileOverlay').addEventListener('click', () => this.closeMobileSidebar());
        
        // Close mobile sidebar when clicking inside sidebar links/buttons
        document.querySelector('.sidebar').addEventListener('click', (e) => {
            if (e.target.classList.contains('history-item') || 
                e.target.closest('.history-item') ||
                e.target.classList.contains('collection-item') ||
                e.target.closest('.collection-item')) {
                this.closeMobileSidebar();
            }
        });

        // Handle window resize for mobile sidebar
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('resterx-theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    switchResponseTab(tabName) {
        // Remove active class from all response tabs and panes
        document.querySelectorAll('.response-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.response-tab-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    addHeaderRow() {
        const container = document.querySelector('.headers-container');
        const row = document.createElement('div');
        row.className = 'header-row';
        row.innerHTML = `
            <input type="text" placeholder="Header Name" class="header-key">
            <input type="text" placeholder="Header Value" class="header-value">
            <button class="remove-header">×</button>
        `;
        container.appendChild(row);
    }

    removeHeaderRow(button) {
        button.parentElement.remove();
    }

    addFormDataRow() {
        const container = document.querySelector('.form-data-container');
        const addBtn = document.getElementById('addFormData');
        const row = document.createElement('div');
        row.className = 'form-row';
        row.innerHTML = `
            <input type="text" placeholder="Key" class="form-key">
            <input type="text" placeholder="Value" class="form-value">
            <button class="remove-form">×</button>
        `;
        container.insertBefore(row, addBtn);
    }

    removeFormDataRow(button) {
        button.parentElement.remove();
    }

    handleBodyTypeChange(type) {
        const bodyTextarea = document.getElementById('requestBody');
        const formDataContainer = document.getElementById('formData');

        if (type === 'form') {
            bodyTextarea.style.display = 'none';
            formDataContainer.style.display = 'block';
        } else {
            bodyTextarea.style.display = 'block';
            formDataContainer.style.display = 'none';

            if (type === 'json') {
                bodyTextarea.placeholder = '{\n  "key": "value"\n}';
            } else if (type === 'text') {
                bodyTextarea.placeholder = 'Raw text content...';
            } else {
                bodyTextarea.placeholder = 'Request body content...';
                bodyTextarea.value = '';
            }
        }
    }

    handleAuthTypeChange(type) {
        const bearerAuth = document.getElementById('bearerAuth');
        const basicAuth = document.getElementById('basicAuth');

        bearerAuth.style.display = type === 'bearer' ? 'block' : 'none';
        basicAuth.style.display = type === 'basic' ? 'block' : 'none';
    }

    collectHeaders() {
        const headers = {};
        const headerRows = document.querySelectorAll('.header-row');

        headerRows.forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key && value) {
                headers[key] = value;
            }
        });

        // Add authentication headers
        const authType = document.querySelector('input[name="authType"]:checked').value;
        if (authType === 'bearer') {
            const token = document.getElementById('bearerToken').value.trim();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } else if (authType === 'basic') {
            const username = document.getElementById('basicUsername').value.trim();
            const password = document.getElementById('basicPassword').value.trim();
            if (username && password) {
                headers['Authorization'] = `Basic ${btoa(username + ':' + password)}`;
            }
        }

        return headers;
    }

    collectRequestBody() {
        const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
        
        if (bodyType === 'none') {
            return '';
        } else if (bodyType === 'form') {
            const formData = {};
            const formRows = document.querySelectorAll('.form-row');
            
            formRows.forEach(row => {
                const key = row.querySelector('.form-key')?.value.trim();
                const value = row.querySelector('.form-value')?.value.trim();
                if (key && value) {
                    formData[key] = value;
                }
            });
            
            return new URLSearchParams(formData).toString();
        } else {
            return document.getElementById('requestBody').value;
        }
    }

    async sendRequest() {
        const method = document.getElementById('methodSelect').value;
        let url = document.getElementById('urlInput').value.trim();

        // Enhanced URL validation
        if (!url) {
            this.showNotification('Please enter a URL', 'error');
            return;
        }

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            document.getElementById('urlInput').value = url;
        }

        // URL validation
        try {
            new URL(url);
        } catch (e) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }

        // Resolve variables in URL and body
        url = this.resolveVariables(url);
        
        const headers = this.collectHeaders();
        let body = this.collectRequestBody();
        
        // Resolve variables in body
        body = this.resolveVariables(body);

        // Enhanced body validation
        if (body) {
            const bodyType = document.querySelector('input[name="bodyType"]:checked').value;
            if (bodyType === 'json' && body) {
                try {
                    JSON.parse(body);
                    headers['Content-Type'] = 'application/json';
                } catch (e) {
                    this.showNotification('Invalid JSON in request body', 'error');
                    return;
                }
            } else if (bodyType === 'form' && body) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        // Request size validation (limit to 10MB)
        const requestSize = new Blob([JSON.stringify({ method, url, headers, body })]).size;
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (requestSize > maxSize) {
            this.showNotification('Request size too large (max 10MB)', 'error');
            return;
        }

        const request = { method, url, headers, body, timestamp: Date.now() };

        this.showLoading(true);
        this.disableSendButton(true);

        try {
            let result;
            
            // In static mode, make direct HTTP requests instead of using backend
            if (this.isStaticMode) {
                result = await this.makeDirectHttpRequest(request);
            } else {
                // Use backend API
                const requestHeaders = { 'Content-Type': 'application/json' };
                if (this.authToken) {
                    requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
                }
                
                const response = await fetch('/api/request', {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(request)
                });

                if (!response.ok && (response.status === 501 || response.status === 404)) {
                    // Backend not available, switch to static mode
                    console.log('Backend unavailable during request, switching to static mode');
                    this.isStaticMode = true;
                    result = await this.makeDirectHttpRequest(request);
                } else {
                    result = await response.json();
                }
            }
            
            this.displayResponse(result);
            this.addToHistory(request, result);
            this.trackAnalytics(request, result);
        } catch (error) {
            this.displayError('Failed to send request: ' + error.message);
        } finally {
            this.showLoading(false);
            this.disableSendButton(false);
        }
    }

    // Make direct HTTP request in static mode (no backend proxy)
    async makeDirectHttpRequest(request) {
        const startTime = Date.now();
        
        try {
            // Enhanced timeout support with AbortController
            const timeoutMs = parseInt(localStorage.getItem('resterx-timeout') || '30000'); // Default 30 seconds
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            // Prepare fetch options
            const fetchOptions = {
                method: request.method,
                headers: request.headers || {},
                mode: 'cors', // Enable CORS for cross-origin requests
                signal: controller.signal,
                // Add credentials for authentication when needed
                credentials: 'omit' // Can be changed to 'include' if cookies are needed
            };

            // Add body for methods that support it
            if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
                fetchOptions.body = request.body;
            }

            // Make the request with timeout
            const response = await fetch(request.url, fetchOptions);
            clearTimeout(timeoutId); // Clear timeout on successful response
            
            const responseTime = Date.now() - startTime;

            // Get response headers
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            // Get response body with size limits
            let responseBody;
            const contentType = response.headers.get('content-type') || '';
            const contentLength = parseInt(response.headers.get('content-length') || '0');
            
            // Check response size (limit to 50MB)
            const maxResponseSize = 50 * 1024 * 1024;
            if (contentLength > maxResponseSize) {
                throw new Error(`Response too large: ${Math.round(contentLength / 1024 / 1024)}MB (max 50MB)`);
            }
            
            if (contentType.includes('application/json')) {
                try {
                    responseBody = await response.json();
                    responseBody = JSON.stringify(responseBody, null, 2);
                } catch (e) {
                    responseBody = await response.text();
                }
            } else {
                responseBody = await response.text();
            }

            return {
                statusCode: response.status,
                status: response.statusText || 'OK',
                headers: responseHeaders,
                body: responseBody,
                responseTime: responseTime,
                size: responseBody ? new Blob([responseBody]).size : 0
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            let errorMessage = error.message;
            
            // Enhanced error handling with specific messages
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out';
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error - check your connection or CORS settings';
            } else if (error.message.includes('Response too large')) {
                errorMessage = error.message;
            }
            
            return {
                statusCode: 0,
                status: 'Error',
                headers: {},
                body: `Request failed: ${errorMessage}`,
                responseTime: responseTime,
                error: true
            };
        }
    }

    displayResponse(response) {
        // Status code
        const statusElement = document.getElementById('statusCode');
        statusElement.textContent = response.error ? 'ERROR' : `${response.statusCode} ${response.status}`;
        
        // Remove existing status classes
        statusElement.className = 'status-code';
        
        if (!response.error) {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                statusElement.classList.add('status-2xx');
            } else if (response.statusCode >= 300 && response.statusCode < 400) {
                statusElement.classList.add('status-3xx');
            } else if (response.statusCode >= 400 && response.statusCode < 500) {
                statusElement.classList.add('status-4xx');
            } else if (response.statusCode >= 500) {
                statusElement.classList.add('status-5xx');
            }
        } else {
            statusElement.classList.add('status-5xx');
        }

        // Enhanced response time display
        const responseTimeMs = response.responseTime || 0;
        let timeDisplay = '';
        if (responseTimeMs < 1000) {
            timeDisplay = `${responseTimeMs}ms`;
        } else {
            timeDisplay = `${(responseTimeMs / 1000).toFixed(2)}s`;
        }
        
        document.getElementById('responseTime').textContent = timeDisplay;

        // Add response size information
        const responseSizeElement = document.getElementById('responseSize');
        if (responseSizeElement) {
            const size = response.size || 0;
            let sizeDisplay = '';
            if (size < 1024) {
                sizeDisplay = `${size} B`;
            } else if (size < 1024 * 1024) {
                sizeDisplay = `${(size / 1024).toFixed(1)} KB`;
            } else {
                sizeDisplay = `${(size / 1024 / 1024).toFixed(1)} MB`;
            }
            responseSizeElement.textContent = sizeDisplay;
        }

        // Response body
        const responseBody = document.getElementById('responseBody');
        if (response.error) {
            responseBody.textContent = response.error;
        } else {
            responseBody.textContent = response.body || 'No content';
        }

        // Response headers
        const responseHeaders = document.getElementById('responseHeaders');
        if (response.headers) {
            const headerText = Object.entries(response.headers)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            responseHeaders.textContent = headerText || 'No headers';
        } else {
            responseHeaders.textContent = 'No headers';
        }
    }

    displayError(message) {
        const statusElement = document.getElementById('statusCode');
        statusElement.textContent = 'ERROR';
        statusElement.className = 'status-code status-5xx';
        
        document.getElementById('responseTime').textContent = '';
        document.getElementById('responseBody').textContent = message;
        document.getElementById('responseHeaders').textContent = '';
    }

    formatJsonResponse() {
        const responseBody = document.getElementById('responseBody');
        try {
            const json = JSON.parse(responseBody.textContent);
            responseBody.textContent = JSON.stringify(json, null, 2);
        } catch (error) {
            alert('Response is not valid JSON');
        }
    }

    async copyResponse() {
        const responseBody = document.getElementById('responseBody');
        try {
            await navigator.clipboard.writeText(responseBody.textContent);
            const btn = document.getElementById('copyResponse');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1000);
        } catch (error) {
            console.error('Failed to copy response:', error);
        }
    }

    addToHistory(request, response) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: response.responseTime
        };

        this.history.unshift(historyItem);
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }

        this.saveHistory();
        this.renderHistory();
    }

    loadHistory() {
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('history');
        
        if (this.history.length === 0) {
            container.innerHTML = '<p class="empty-state">No requests yet</p>';
            return;
        }

        container.innerHTML = this.history.map(item => `
            <div class="history-item" onclick="app.loadHistoryItem('${item.id}')">
                <div class="history-method">${item.method}</div>
                <div class="history-url">${item.url}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${new Date(item.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    loadHistoryItem(id) {
        const item = this.history.find(h => h.id == id);
        if (item) {
            document.getElementById('methodSelect').value = item.method;
            document.getElementById('urlInput').value = item.url;
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the request history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    saveHistory() {
        localStorage.setItem('resterx-history', JSON.stringify(this.history));
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    disableSendButton(disable) {
        document.getElementById('sendBtn').disabled = disable;
    }

    // Enhanced Features Methods

    switchSidebarTab(tabName) {
        // Remove active class from all sidebar tabs and panes
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sidebar-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to selected tab and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    loadCollections() {
        // Load collections from local storage and display them
        const container = document.getElementById('collectionsContainer');
        if (this.collections.length === 0) {
            container.innerHTML = '<p class="empty-state">No collections yet</p>';
            return;
        }

        container.innerHTML = this.collections.map(collection => `
            <div class="collection-item">
                <h4>${collection.name}</h4>
                <p>${collection.description || 'No description'}</p>
                <small>${collection.requests?.length || 0} requests</small>
            </div>
        `).join('');
    }

    loadEnvironments() {
        const select = document.getElementById('environmentSelect');
        select.innerHTML = '<option value="">No Environment</option>';
        
        this.environments.forEach(env => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = env.name;
            if (env.id === this.activeEnvironment) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    setActiveEnvironment(envId) {
        this.activeEnvironment = envId;
        localStorage.setItem('resterx-active-env', envId);
    }

    showEnvironmentModal() {
        document.getElementById('envModal').style.display = 'flex';
        this.loadEnvironmentModal();
    }

    showCollectionModal() {
        document.getElementById('collectionModal').style.display = 'flex';
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    loadEnvironmentModal() {
        const envList = document.getElementById('envList');
        envList.innerHTML = this.environments.map(env => `
            <div class="env-item">
                <span>${env.name}</span>
                <small>${Object.keys(env.variables || {}).length} variables</small>
            </div>
        `).join('');
    }

    addVariableRow() {
        const container = document.querySelector('.variables-container');
        const row = document.createElement('div');
        row.className = 'variable-row';
        row.innerHTML = `
            <input type="text" placeholder="Variable Name" class="variable-key">
            <input type="text" placeholder="Variable Value" class="variable-value">
            <button class="remove-variable">×</button>
        `;
        container.appendChild(row);
    }

    removeVariableRow(button) {
        button.closest('.variable-row').remove();
    }

    addEnvVariableRow() {
        const container = document.querySelector('.env-variables');
        const row = document.createElement('div');
        row.className = 'env-var-row';
        row.innerHTML = `
            <input type="text" placeholder="Variable Name" class="env-var-key">
            <input type="text" placeholder="Variable Value" class="env-var-value">
            <button class="remove-env-var">×</button>
        `;
        container.appendChild(row);
    }

    createEnvironment() {
        const name = document.getElementById('envName').value.trim();
        if (!name) {
            alert('Please enter an environment name');
            return;
        }

        const variables = {};
        document.querySelectorAll('.env-var-row').forEach(row => {
            const key = row.querySelector('.env-var-key').value.trim();
            const value = row.querySelector('.env-var-value').value.trim();
            if (key && value) {
                variables[key] = value;
            }
        });

        const env = {
            id: 'env_' + Date.now(),
            name: name,
            variables: variables,
            active: false
        };

        this.environments.push(env);
        localStorage.setItem('resterx-environments', JSON.stringify(this.environments));
        this.loadEnvironments();
        this.closeModal(document.getElementById('envModal'));
        
        // Clear form
        document.getElementById('envName').value = '';
        document.querySelector('.env-variables').innerHTML = `
            <div class="env-var-row">
                <input type="text" placeholder="Variable Name" class="env-var-key">
                <input type="text" placeholder="Variable Value" class="env-var-value">
                <button class="remove-env-var">×</button>
            </div>
        `;
    }

    createCollection() {
        const name = document.getElementById('collectionName').value.trim();
        const description = document.getElementById('collectionDescription').value.trim();
        
        if (!name) {
            alert('Please enter a collection name');
            return;
        }

        const collection = {
            id: 'col_' + Date.now(),
            name: name,
            description: description,
            requests: [],
            createdAt: new Date().toISOString()
        };

        this.collections.push(collection);
        localStorage.setItem('resterx-collections', JSON.stringify(this.collections));
        this.loadCollections();
        this.closeModal(document.getElementById('collectionModal'));

        // Clear form
        document.getElementById('collectionName').value = '';
        document.getElementById('collectionDescription').value = '';
    }

    collectVariables() {
        const variables = {};
        document.querySelectorAll('.variable-row').forEach(row => {
            const key = row.querySelector('.variable-key').value.trim();
            const value = row.querySelector('.variable-value').value.trim();
            if (key && value) {
                variables[key] = value;
            }
        });
        return variables;
    }

    resolveVariables(text) {
        // Simple variable resolution for frontend
        let resolved = text;
        
        // Get active environment variables
        let envVars = {};
        if (this.activeEnvironment) {
            const activeEnv = this.environments.find(env => env.id === this.activeEnvironment);
            if (activeEnv) {
                envVars = activeEnv.variables || {};
            }
        }

        // Get current variables from the form
        const currentVars = this.collectVariables();
        const allVars = { ...envVars, ...currentVars };

        // Replace variables
        Object.keys(allVars).forEach(key => {
            const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            resolved = resolved.replace(pattern, allVars[key]);
        });

        // Replace built-in variables
        resolved = resolved.replace(/\{\{timestamp\}\}/g, Date.now());
        resolved = resolved.replace(/\{\{datetime\}\}/g, new Date().toISOString());
        resolved = resolved.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0]);
        resolved = resolved.replace(/\{\{uuid\}\}/g, 'uuid-' + Math.random().toString(36).substr(2, 9));
        resolved = resolved.replace(/\{\{random_int\}\}/g, Math.floor(Math.random() * 1000000));

        return resolved;
    }

    async generateCode() {
        const method = document.getElementById('methodSelect').value;
        const url = this.resolveVariables(document.getElementById('urlInput').value.trim());
        const headers = this.collectHeaders();
        const body = this.resolveVariables(this.collectRequestBody());
        const language = document.getElementById('languageSelect').value;

        if (!url) {
            alert('Please enter a URL first');
            return;
        }

        const request = { method, url, headers, body };

        try {
            const response = await fetch('/api/codegen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request, language })
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('generatedCode').textContent = result.code;
            } else {
                document.getElementById('generatedCode').textContent = 'Error generating code';
            }
        } catch (error) {
            document.getElementById('generatedCode').textContent = 'Error generating code: ' + error.message;
        }
    }

    copyGeneratedCode() {
        const codeElement = document.getElementById('generatedCode');
        const code = codeElement.textContent;
        
        if (code && code !== 'Click "Generate Code" to create code snippets' && code !== 'Error generating code') {
            navigator.clipboard.writeText(code).then(() => {
                // Show brief feedback
                const originalText = document.getElementById('copyCode').textContent;
                document.getElementById('copyCode').textContent = 'Copied!';
                setTimeout(() => {
                    document.getElementById('copyCode').textContent = originalText;
                }, 1000);
            }).catch(() => {
                alert('Failed to copy code to clipboard');
            });
        }
    }

    createMockFromRequest() {
        const method = document.getElementById('methodSelect').value;
        const url = document.getElementById('urlInput').value.trim();
        const body = document.getElementById('responseBody').textContent;
        
        if (!url) {
            alert('Please enter a URL first');
            return;
        }

        // Extract path from URL
        let path;
        try {
            const urlObj = new URL(url);
            path = urlObj.pathname;
        } catch (e) {
            path = url.startsWith('/') ? url : '/' + url;
        }

        const mockEndpoint = {
            method: method,
            path: path,
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: body && body !== 'Send a request to see the response' ? body : '{"message": "Mock response"}',
            delay: 0,
            description: `Mock endpoint for ${method} ${path}`
        };

        this.saveMockEndpoint(mockEndpoint);
    }

    async saveMockEndpoint(endpoint) {
        try {
            const response = await fetch('/api/mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(endpoint)
            });

            if (response.ok) {
                alert('Mock endpoint created successfully!');
                this.viewMockEndpoints();
            } else {
                alert('Failed to create mock endpoint');
            }
        } catch (error) {
            alert('Error creating mock endpoint: ' + error.message);
        }
    }

    async viewMockEndpoints() {
        try {
            const response = await fetch('/api/mock');
            if (response.ok) {
                const endpoints = await response.json();
                this.displayMockEndpoints(endpoints);
            } else {
                alert('Failed to load mock endpoints');
            }
        } catch (error) {
            alert('Error loading mock endpoints: ' + error.message);
        }
    }

    displayMockEndpoints(endpoints) {
        const mockTab = document.getElementById('mock');
        let listContainer = mockTab.querySelector('.mock-endpoints-list');
        
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.className = 'mock-endpoints-list';
            mockTab.appendChild(listContainer);
        }

        if (Object.keys(endpoints).length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No mock endpoints created yet</p>';
            return;
        }

        listContainer.innerHTML = Object.values(endpoints).map(endpoint => `
            <div class="mock-endpoint-item">
                <div class="mock-endpoint-info">
                    <span class="mock-endpoint-method ${endpoint.method}">${endpoint.method}</span>
                    <span class="mock-endpoint-path">${endpoint.path}</span>
                    <div class="mock-endpoint-status">Status: ${endpoint.statusCode} | Delay: ${endpoint.delay}ms</div>
                </div>
                <button class="delete-mock-btn" onclick="app.deleteMockEndpoint('${endpoint.method}', '${endpoint.path}')">Delete</button>
            </div>
        `).join('');
    }

    async deleteMockEndpoint(method, path) {
        try {
            const response = await fetch('/api/mock', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, path })
            });

            if (response.ok) {
                this.viewMockEndpoints();
            } else {
                alert('Failed to delete mock endpoint');
            }
        } catch (error) {
            alert('Error deleting mock endpoint: ' + error.message);
        }
    }

    async generateApiDocs() {
        this.refreshDocumentation();
    }

    async refreshDocumentation() {
        try {
            const response = await fetch('/api/docs');
            if (response.ok) {
                const docs = await response.text();
                document.getElementById('apiDocumentation').textContent = docs;
            } else {
                document.getElementById('apiDocumentation').textContent = 'Failed to load documentation';
            }
        } catch (error) {
            document.getElementById('apiDocumentation').textContent = 'Error loading documentation: ' + error.message;
        }
    }

    async exportOpenAPI() {
        try {
            const response = await fetch('/api/docs?format=openapi');
            if (response.ok) {
                const openapi = await response.json();
                const blob = new Blob([JSON.stringify(openapi, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'api-spec.json';
                a.click();
                URL.revokeObjectURL(url);
            } else {
                alert('Failed to export OpenAPI specification');
            }
        } catch (error) {
            alert('Error exporting OpenAPI: ' + error.message);
        }
    }

    copyDocumentation() {
        const docsElement = document.getElementById('apiDocumentation');
        const docs = docsElement.textContent;
        
        if (docs && docs !== 'Click "Refresh Documentation" to generate API docs from mock endpoints') {
            navigator.clipboard.writeText(docs).then(() => {
                // Show brief feedback
                const originalText = document.getElementById('copyDocs').textContent;
                document.getElementById('copyDocs').textContent = 'Copied!';
                setTimeout(() => {
                    document.getElementById('copyDocs').textContent = originalText;
                }, 1000);
            }).catch(() => {
                alert('Failed to copy documentation to clipboard');
            });
        }
    }

    trackAnalytics(request, response) {
        const requestData = {
            timestamp: Date.now(),
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: response.responseTime || 0,
            success: response.statusCode >= 200 && response.statusCode < 400,
            responseSize: response.body ? response.body.length : 0
        };

        this.analytics.requests.push(requestData);
        this.analytics.totalRequests++;
        
        if (requestData.success) {
            this.analytics.successfulRequests++;
        }

        // Keep only last 100 requests for performance
        if (this.analytics.requests.length > 100) {
            this.analytics.requests = this.analytics.requests.slice(-100);
        }

        localStorage.setItem('resterx-analytics', JSON.stringify(this.analytics));
        this.updateAnalytics();
    }

    updateAnalytics() {
        if (this.analytics.totalRequests === 0) {
            return;
        }

        // Show analytics panel
        document.getElementById('analyticsPanel').style.display = 'block';

        // Calculate average response time
        const totalTime = this.analytics.requests.reduce((sum, req) => sum + (req.responseTime || 0), 0);
        const avgTime = totalTime / this.analytics.requests.length;
        document.getElementById('avgResponseTime').textContent = `${Math.round(avgTime / 1000000)}ms`;

        // Update request count
        document.getElementById('requestCount').textContent = this.analytics.totalRequests;

        // Calculate success rate
        const successRate = (this.analytics.successfulRequests / this.analytics.totalRequests * 100).toFixed(1);
        document.getElementById('successRate').textContent = `${successRate}%`;

        // Last response size
        if (this.analytics.requests.length > 0) {
            const lastRequest = this.analytics.requests[this.analytics.requests.length - 1];
            const sizeKB = (lastRequest.responseSize / 1024).toFixed(1);
            document.getElementById('lastResponseSize').textContent = `${sizeKB}KB`;
        }
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        // Ignore shortcuts if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl+Enter: Send request
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.sendRequest();
            return;
        }

        // Enhanced keyboard shortcuts for better productivity
        
        // Enter: Send request (when URL field is focused)
        if (e.key === 'Enter' && document.activeElement === document.getElementById('urlInput')) {
            e.preventDefault();
            this.sendRequest();
            return;
        }

        // Ctrl+Enter: Send request from anywhere
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.sendRequest();
            return;
        }

        // Ctrl+K: Focus URL input (like Postman)
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('urlInput').focus();
            document.getElementById('urlInput').select();
            return;
        }

        // Ctrl+Alt+C: Open collections
        if (e.ctrlKey && e.altKey && e.key === 'c') {
            e.preventDefault();
            this.switchSidebarTab('collections');
            return;
        }

        // Ctrl+Shift+S: Open settings
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            this.showSettingsModal();
            return;
        }

        // Ctrl+M: Toggle mobile sidebar (when in mobile mode)
        if (e.ctrlKey && e.key === 'm' && window.innerWidth <= 992) {
            e.preventDefault();
            this.toggleMobileSidebar();
            return;
        }

        // Ctrl+T: Toggle theme
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
            return;
        }

        // Ctrl+Shift+F: Format JSON response
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            this.formatJsonResponse();
            return;
        }

        // Ctrl+C: Copy response (when response area is focused)
        if (e.ctrlKey && e.key === 'c' && document.querySelector('#responseBody:focus')) {
            e.preventDefault();
            this.copyResponse();
            return;
        }

        // Ctrl+H: Toggle history sidebar
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.switchSidebarTab('history');
            return;
        }

        // Number keys 1-6: Switch request tabs
        if (!e.ctrlKey && !e.shiftKey && /^[1-6]$/.test(e.key)) {
            e.preventDefault();
            const tabs = ['headers', 'body', 'auth', 'variables', 'tests', 'mock'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
            return;
        }

        // Ctrl+Number keys 1-4: Switch response tabs
        if (e.ctrlKey && /^[1-4]$/.test(e.key)) {
            e.preventDefault();
            const responseTabs = ['response-body', 'response-headers', 'code-gen', 'docs'];
            const tabIndex = parseInt(e.key) - 1;
            if (responseTabs[tabIndex]) {
                this.switchResponseTab(responseTabs[tabIndex]);
            }
            return;
        }

        // ? key: Show shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            this.showShortcutsModal();
            return;
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            e.preventDefault();
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    this.closeModal(modal);
                }
            });
            return;
        }
    }

    showShortcutsModal() {
        document.getElementById('shortcutsModal').style.display = 'flex';
        
        // Add escape key handler for modal
        const modal = document.getElementById('shortcutsModal');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.onclick = () => this.closeModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        };
    }

    // Enhanced history with timestamps
    addToHistory(request, response) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
            response: {
                statusCode: response.statusCode,
                status: response.status,
                responseTime: response.responseTime
            }
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 requests
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.renderHistory();
    }

    // Enhanced history rendering with search and filters
    renderHistory() {
        const container = document.getElementById('historyContainer');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<p class="empty-state">No requests yet</p>';
            return;
        }

        // Apply current filters
        this.filterHistory();
    }

    filterHistory() {
        const container = document.getElementById('historyContainer');
        const searchTerm = document.getElementById('historySearch')?.value.toLowerCase() || '';
        const methodFilter = document.getElementById('methodFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        if (!container) return;

        let filteredHistory = this.history.filter(item => {
            // Search filter
            const matchesSearch = !searchTerm || 
                item.url.toLowerCase().includes(searchTerm) ||
                item.method.toLowerCase().includes(searchTerm);

            // Method filter
            const matchesMethod = !methodFilter || item.method === methodFilter;

            // Status filter
            let matchesStatus = true;
            if (statusFilter) {
                const statusCode = item.response?.statusCode || 0;
                switch (statusFilter) {
                    case '2xx':
                        matchesStatus = statusCode >= 200 && statusCode < 300;
                        break;
                    case '4xx':
                        matchesStatus = statusCode >= 400 && statusCode < 500;
                        break;
                    case '5xx':
                        matchesStatus = statusCode >= 500 && statusCode < 600;
                        break;
                    case 'error':
                        matchesStatus = statusCode === 0 || item.response?.error;
                        break;
                }
            }

            return matchesSearch && matchesMethod && matchesStatus;
        });

        if (filteredHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No matching requests found</p>';
            return;
        }

        container.innerHTML = filteredHistory.map(item => {
            const date = new Date(item.timestamp);
            const timeAgo = this.getTimeAgo(date);
            const statusCode = item.response?.statusCode || 0;
            
            let statusClass = 'error';
            if (statusCode >= 200 && statusCode < 300) statusClass = 'success';
            else if (statusCode >= 400 && statusCode < 500) statusClass = 'warning';
            else if (statusCode >= 500) statusClass = 'error';
            
            return `
                <div class="history-item" onclick="app.loadHistoryItem(${item.id})">
                    <div class="history-method ${item.method}">${item.method}</div>
                    <div class="history-url">${item.url}</div>
                    <div class="history-timestamp">${timeAgo}</div>
                    ${statusCode ? `<div class="history-status ${statusClass}">${statusCode}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    loadHistoryItem(id) {
        const item = this.history.find(h => h.id == id);
        if (item) {
            document.getElementById('methodSelect').value = item.method;
            document.getElementById('urlInput').value = item.url;
            
            // Load headers if any
            this.clearHeaders();
            if (item.headers && Object.keys(item.headers).length > 0) {
                Object.entries(item.headers).forEach(([key, value]) => {
                    this.addHeaderRow();
                    const headerRows = document.querySelectorAll('.header-row');
                    const lastRow = headerRows[headerRows.length - 1];
                    lastRow.querySelector('.header-key').value = key;
                    lastRow.querySelector('.header-value').value = value;
                });
            }
            
            // Load body if any
            if (item.body) {
                document.getElementById('requestBody').value = item.body;
                // Switch to body tab
                this.switchTab('body');
            }
            
            // Close mobile sidebar if open
            this.closeMobileSidebar();
            
            // Show notification
            this.showNotification('Request loaded from history', 'success');
        }
    }

    clearHeaders() {
        const headerRows = document.querySelectorAll('.header-row');
        headerRows.forEach(row => row.remove());
        this.addHeaderRow(); // Add one empty row
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    // Template functionality
    loadTemplate(templateId) {
        if (!templateId) return;

        const templates = {
            'jsonplaceholder-posts': {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                description: 'Fetch sample posts from JSONPlaceholder'
            },
            'jsonplaceholder-users': {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/users',
                headers: { 'Content-Type': 'application/json' },
                body: '',
                description: 'Fetch sample users from JSONPlaceholder'
            },
            'httpbin-get': {
                method: 'GET',
                url: 'https://httpbin.org/get?test=123',
                headers: { 'User-Agent': 'RESTerX/1.0' },
                body: '',
                description: 'Test GET request with HTTPBin'
            },
            'httpbin-post': {
                method: 'POST',
                url: 'https://httpbin.org/post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Hello from RESTerX!', timestamp: new Date().toISOString() }, null, 2),
                description: 'Test POST request with HTTPBin'
            },
            'github-api': {
                method: 'GET',
                url: 'https://api.github.com/users/octocat',
                headers: { 'Accept': 'application/vnd.github.v3+json' },
                body: '',
                description: 'Fetch GitHub user information'
            },
            'rest-countries': {
                method: 'GET',
                url: 'https://restcountries.com/v3.1/name/india',
                headers: { 'Accept': 'application/json' },
                body: '',
                description: 'Get country information from REST Countries API'
            }
        };

        const template = templates[templateId];
        if (!template) return;

        // Set method
        document.getElementById('methodSelect').value = template.method;

        // Set URL
        document.getElementById('urlInput').value = template.url;

        // Set headers
        this.clearHeaders();
        Object.entries(template.headers).forEach(([key, value]) => {
            this.addHeaderRow(key, value);
        });

        // Set body if exists
        if (template.body) {
            // Switch to body tab
            this.switchTab('body');
            // Set body type to JSON if it looks like JSON
            if (template.body.trim().startsWith('{')) {
                document.querySelector('input[name="bodyType"][value="json"]').checked = true;
                this.handleBodyTypeChange('json');
            }
            document.getElementById('bodyText').value = template.body;
        }

        // Show notification
        this.showNotification(`Template loaded: ${template.description}`, 'success');

        // Reset template selector
        document.getElementById('templateSelect').value = '';
    }

    clearHeaders() {
        const container = document.querySelector('.headers-container');
        // Keep one empty row
        container.innerHTML = `
            <div class="header-row">
                <input type="text" placeholder="Header Name" class="header-key">
                <input type="text" placeholder="Header Value" class="header-value">
                <button class="remove-header">×</button>
            </div>
        `;
    }

    addHeaderRow(key = '', value = '') {
        const container = document.querySelector('.headers-container');
        const row = document.createElement('div');
        row.className = 'header-row';
        row.innerHTML = `
            <input type="text" placeholder="Header Name" class="header-key" value="${key}">
            <input type="text" placeholder="Header Value" class="header-value" value="${value}">
            <button class="remove-header">×</button>
        `;
        container.appendChild(row);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;

        // Add to body
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Settings Modal Methods
    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        
        // Load current settings
        const timeout = parseInt(localStorage.getItem('resterx-timeout') || '30000') / 1000;
        const maxResponseSize = parseInt(localStorage.getItem('resterx-max-response-size') || '52428800') / (1024 * 1024);
        const followRedirects = localStorage.getItem('resterx-follow-redirects') !== 'false';
        const validateSSL = localStorage.getItem('resterx-validate-ssl') !== 'false';
        const sendCookies = localStorage.getItem('resterx-send-cookies') === 'true';
        
        document.getElementById('timeoutInput').value = timeout;
        document.getElementById('maxResponseSize').value = maxResponseSize;
        document.getElementById('followRedirects').checked = followRedirects;
        document.getElementById('validateSSL').checked = validateSSL;
        document.getElementById('sendCookies').checked = sendCookies;
        
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    saveSettings() {
        const timeout = parseInt(document.getElementById('timeoutInput').value) * 1000;
        const maxResponseSize = parseInt(document.getElementById('maxResponseSize').value) * 1024 * 1024;
        const followRedirects = document.getElementById('followRedirects').checked;
        const validateSSL = document.getElementById('validateSSL').checked;
        const sendCookies = document.getElementById('sendCookies').checked;
        
        // Validate inputs
        if (timeout < 1000 || timeout > 300000) {
            this.showNotification('Timeout must be between 1 and 300 seconds', 'error');
            return;
        }
        
        if (maxResponseSize < 1024 * 1024 || maxResponseSize > 100 * 1024 * 1024) {
            this.showNotification('Max response size must be between 1 and 100 MB', 'error');
            return;
        }
        
        // Save settings
        localStorage.setItem('resterx-timeout', timeout.toString());
        localStorage.setItem('resterx-max-response-size', maxResponseSize.toString());
        localStorage.setItem('resterx-follow-redirects', followRedirects.toString());
        localStorage.setItem('resterx-validate-ssl', validateSSL.toString());
        localStorage.setItem('resterx-send-cookies', sendCookies.toString());
        
        this.showNotification('Settings saved successfully!', 'success');
        this.closeModal(document.getElementById('settingsModal'));
    }

    resetSettings() {
        // Reset to defaults
        document.getElementById('timeoutInput').value = 30;
        document.getElementById('maxResponseSize').value = 50;
        document.getElementById('followRedirects').checked = true;
        document.getElementById('validateSSL').checked = true;
        document.getElementById('sendCookies').checked = false;
        
        // Clear localStorage
        localStorage.removeItem('resterx-timeout');
        localStorage.removeItem('resterx-max-response-size');
        localStorage.removeItem('resterx-follow-redirects');
        localStorage.removeItem('resterx-validate-ssl');
        localStorage.removeItem('resterx-send-cookies');
        
        this.showNotification('Settings reset to defaults', 'info');
    }

    // Mobile Sidebar Methods
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const toggle = document.getElementById('mobileSidebarToggle');
        
        if (sidebar.classList.contains('mobile-open')) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }

    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const toggle = document.getElementById('mobileSidebarToggle');
        
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        toggle.innerHTML = '✕';
        toggle.setAttribute('aria-label', 'Close Sidebar');
        
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden';
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const toggle = document.getElementById('mobileSidebarToggle');
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        toggle.innerHTML = '📋';
        toggle.setAttribute('aria-label', 'Toggle Sidebar');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Enhanced notification system with better mobile support
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Style the notification for better mobile appearance
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            border: 2px solid var(${type === 'success' ? '--success-color' : type === 'error' ? '--error-color' : type === 'warning' ? '--warning-color' : '--info-color'});
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: var(--shadow-heavy);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: calc(100vw - 40px);
            word-wrap: break-word;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Enhanced UI Event Listeners
    setupEnhancedEventListeners() {
        // Quick Action Bar
        document.getElementById('quickSend')?.addEventListener('click', () => this.sendRequest());
        document.getElementById('quickClear')?.addEventListener('click', () => this.clearRequest());
        document.getElementById('quickSave')?.addEventListener('click', () => this.showSaveModal());
        document.getElementById('quickHistory')?.addEventListener('click', () => this.showHistoryTimelineModal());
        document.getElementById('quickExport')?.addEventListener('click', () => this.showCodeExportModal());
        document.getElementById('quickShare')?.addEventListener('click', () => this.shareRequest());

        // Template Gallery
        document.getElementById('templatesToggle')?.addEventListener('click', () => this.toggleTemplateGallery());
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTemplatesByCategory(e.target.dataset.category));
        });
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => this.loadTemplateFromCard(e.currentTarget.dataset.template));
        });

        // Response Enhancement Tools
        document.getElementById('formatJson')?.addEventListener('click', () => this.formatJsonResponse());
        document.getElementById('minifyJson')?.addEventListener('click', () => this.minifyJsonResponse());
        document.getElementById('searchResponse')?.addEventListener('click', () => this.showResponseSearch());
        document.getElementById('expandAll')?.addEventListener('click', () => this.expandAllJsonNodes());
        document.getElementById('collapseAll')?.addEventListener('click', () => this.collapseAllJsonNodes());
        document.getElementById('downloadResponse')?.addEventListener('click', () => this.downloadResponse());

        // Response Search
        document.getElementById('responseSearchInput')?.addEventListener('input', (e) => this.searchInResponse(e.target.value));
        document.getElementById('searchNext')?.addEventListener('click', () => this.searchNext());
        document.getElementById('searchPrev')?.addEventListener('click', () => this.searchPrev());
        document.getElementById('closeSearch')?.addEventListener('click', () => this.hideResponseSearch());

        // Modal Controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Code Export Modal
        document.querySelectorAll('.export-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchCodeLanguage(e.target.dataset.lang));
        });
        document.getElementById('copyExportedCode')?.addEventListener('click', () => this.copyExportedCode());

        // Performance Modal
        document.getElementById('quickSend')?.addEventListener('click', () => this.trackPerformance = true);

        // Keyboard Shortcuts Enhancement
        document.addEventListener('keydown', (e) => this.handleEnhancedKeyboardShortcuts(e));
    }

    // Template Gallery Functions
    toggleTemplateGallery() {
        const gallery = document.getElementById('templateGallery');
        const isVisible = gallery.style.display !== 'none';
        gallery.style.display = isVisible ? 'none' : 'block';
        
        const toggleBtn = document.getElementById('templatesToggle');
        toggleBtn.querySelector('.toggle-icon').textContent = isVisible ? '📁' : '📂';
    }

    filterTemplatesByCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Show/hide templates
        document.querySelectorAll('.template-card').forEach(card => {
            if (category === 'popular' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadTemplateFromCard(templateId) {
        this.loadTemplate(templateId);
        this.toggleTemplateGallery(); // Close gallery after selection
        this.showNotification('Template loaded successfully! 🚀');
    }

    // Response Enhancement Functions
    formatJsonResponse() {
        const responseBody = document.getElementById('responseBody');
        try {
            const parsed = JSON.parse(responseBody.textContent);
            responseBody.textContent = JSON.stringify(parsed, null, 2);
            this.showNotification('JSON formatted! ✨');
        } catch (e) {
            this.showNotification('Unable to format: Not valid JSON', 'error');
        }
    }

    minifyJsonResponse() {
        const responseBody = document.getElementById('responseBody');
        try {
            const parsed = JSON.parse(responseBody.textContent);
            responseBody.textContent = JSON.stringify(parsed);
            this.showNotification('JSON minified! 📦');
        } catch (e) {
            this.showNotification('Unable to minify: Not valid JSON', 'error');
        }
    }

    showResponseSearch() {
        const searchBar = document.getElementById('responseSearch');
        searchBar.style.display = 'flex';
        document.getElementById('responseSearchInput').focus();
    }

    hideResponseSearch() {
        const searchBar = document.getElementById('responseSearch');
        searchBar.style.display = 'none';
        this.clearSearchHighlights();
    }

    searchInResponse(query) {
        if (!query) {
            this.clearSearchHighlights();
            document.getElementById('searchResults').textContent = '0 results';
            return;
        }

        const responseText = document.getElementById('responseBody').textContent;
        const matches = responseText.toLowerCase().split(query.toLowerCase()).length - 1;
        document.getElementById('searchResults').textContent = `${matches} results`;
        
        // Simple highlighting (in a real app, you'd want more sophisticated highlighting)
        if (matches > 0) {
            this.highlightSearchResults(query);
        }
    }

    highlightSearchResults(query) {
        // Simplified highlighting implementation
        const responseElement = document.getElementById('responseBody');
        const text = responseElement.textContent;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        responseElement.innerHTML = highlightedText;
    }

    clearSearchHighlights() {
        const responseElement = document.getElementById('responseBody');
        responseElement.innerHTML = responseElement.textContent;
    }

    downloadResponse() {
        const responseText = document.getElementById('responseBody').textContent;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `resterx-response-${timestamp}.json`;
        
        const blob = new Blob([responseText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`Response downloaded as ${filename}! 💾`);
    }

    // Code Export Functions
    showCodeExportModal() {
        document.getElementById('codeExportModal').style.display = 'flex';
        this.generateCode('curl'); // Default to cURL
    }

    switchCodeLanguage(language) {
        document.querySelectorAll('.export-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-lang="${language}"]`).classList.add('active');
        document.getElementById('currentLanguage').textContent = language.toUpperCase();
        this.generateCode(language);
    }

    generateCode(language) {
        const method = document.getElementById('methodSelect').value;
        const url = document.getElementById('urlInput').value;
        const headers = this.getHeaders();
        const body = document.getElementById('requestBody').value;
        
        let code = '';
        
        switch (language) {
            case 'curl':
                code = this.generateCurlCode(method, url, headers, body);
                break;
            case 'javascript':
                code = this.generateJavaScriptCode(method, url, headers, body);
                break;
            case 'python':
                code = this.generatePythonCode(method, url, headers, body);
                break;
            case 'nodejs':
                code = this.generateNodeJSCode(method, url, headers, body);
                break;
            case 'go':
                code = this.generateGoCode(method, url, headers, body);
                break;
            default:
                code = '// Code generation for this language is coming soon!';
        }
        
        document.getElementById('exportedCode').textContent = code;
    }

    generateCurlCode(method, url, headers, body) {
        let code = `curl -X ${method} \\\n  '${url}'`;
        
        Object.entries(headers).forEach(([key, value]) => {
            if (key && value) {
                code += ` \\\n  -H '${key}: ${value}'`;
            }
        });
        
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            code += ` \\\n  -d '${body}'`;
        }
        
        return code;
    }

    generateJavaScriptCode(method, url, headers, body) {
        const headersObj = Object.entries(headers)
            .filter(([key, value]) => key && value)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        let code = `fetch('${url}', {\n  method: '${method}',\n  headers: ${JSON.stringify(headersObj, null, 4)}`;
        
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            code += `,\n  body: ${JSON.stringify(body)}`;
        }
        
        code += `\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`;
        
        return code;
    }

    generatePythonCode(method, url, headers, body) {
        let code = `import requests\n\nurl = '${url}'\nheaders = ${JSON.stringify(headers, null, 4).replace(/"/g, "'")}`;
        
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            code += `\ndata = ${JSON.stringify(body, null, 4).replace(/"/g, "'")}`;
            code += `\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=data)`;
        } else {
            code += `\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers)`;
        }
        
        code += `\nprint(response.json())`;
        
        return code;
    }

    generateNodeJSCode(method, url, headers, body) {
        let code = `const https = require('https');\nconst http = require('http');\n\nconst options = {\n  method: '${method}',\n  headers: ${JSON.stringify(headers, null, 4)}`;
        
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            code += `,\n  body: JSON.stringify(${body})`;
        }
        
        code += `\n};\n\nconst req = ${url.startsWith('https') ? 'https' : 'http'}.request('${url}', options, (res) => {\n  let data = '';\n  res.on('data', (chunk) => data += chunk);\n  res.on('end', () => console.log(JSON.parse(data)));\n});\n\nreq.end();`;
        
        return code;
    }

    generateGoCode(method, url, headers, body) {
        let code = `package main\n\nimport (\n    "fmt"\n    "net/http"\n    "strings"\n)\n\nfunc main() {\n`;
        
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            code += `    payload := strings.NewReader(\`${body}\`)\n`;
            code += `    req, _ := http.NewRequest("${method}", "${url}", payload)\n`;
        } else {
            code += `    req, _ := http.NewRequest("${method}", "${url}", nil)\n`;
        }
        
        Object.entries(headers).forEach(([key, value]) => {
            if (key && value) {
                code += `    req.Header.Add("${key}", "${value}")\n`;
            }
        });
        
        code += `    client := &http.Client{}\n    res, err := client.Do(req)\n    if err != nil {\n        fmt.Println(err)\n        return\n    }\n    defer res.Body.Close()\n}`;
        
        return code;
    }

    copyExportedCode() {
        const code = document.getElementById('exportedCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Code copied to clipboard! 📋');
        }).catch(() => {
            this.showNotification('Failed to copy code', 'error');
        });
    }

    // Performance Functions
    showHistoryTimelineModal() {
        document.getElementById('historyTimelineModal').style.display = 'flex';
        this.renderHistoryTimeline();
    }

    renderHistoryTimeline() {
        const timeline = document.getElementById('requestTimeline');
        timeline.innerHTML = '';
        
        this.history.slice(-50).reverse().forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            const statusClass = item.status >= 200 && item.status < 300 ? 'success' : 'error';
            
            timelineItem.innerHTML = `
                <div class="timeline-method method-badge ${item.method.toLowerCase()}">${item.method}</div>
                <div class="timeline-url">${item.url}</div>
                <div class="timeline-status ${statusClass}">${item.status || 'Failed'}</div>
                <div class="timeline-time">${new Date(item.timestamp).toLocaleTimeString()}</div>
            `;
            
            timelineItem.addEventListener('click', () => {
                this.loadRequestFromHistory(item);
                this.closeModal(document.getElementById('historyTimelineModal'));
            });
            
            timeline.appendChild(timelineItem);
        });
    }

    // Utility Functions
    clearRequest() {
        document.getElementById('urlInput').value = '';
        document.getElementById('requestBody').value = '';
        document.getElementById('methodSelect').value = 'GET';
        
        // Clear headers
        const headerRows = document.querySelectorAll('.header-row');
        headerRows.forEach((row, index) => {
            if (index === 0) {
                row.querySelector('.header-key').value = '';
                row.querySelector('.header-value').value = '';
            } else {
                row.remove();
            }
        });
        
        this.showNotification('Request cleared! 🧹');
    }

    shareRequest() {
        const requestData = {
            method: document.getElementById('methodSelect').value,
            url: document.getElementById('urlInput').value,
            headers: this.getHeaders(),
            body: document.getElementById('requestBody').value
        };
        
        const encoded = btoa(JSON.stringify(requestData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?request=${encoded}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showNotification('Request URL copied to clipboard! 🔗');
        }).catch(() => {
            this.showNotification('Failed to copy share URL', 'error');
        });
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    handleEnhancedKeyboardShortcuts(e) {
        // Enhanced keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'e':
                    e.preventDefault();
                    this.showCodeExportModal();
                    break;
                case 'p':
                    e.preventDefault();
                    document.getElementById('performanceModal').style.display = 'flex';
                    break;
                case 'f':
                    if (!e.shiftKey) {
                        e.preventDefault();
                        this.showResponseSearch();
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    e.preventDefault();
                    const tabIndex = parseInt(e.key) - 1;
                    const tabs = document.querySelectorAll('.tab-btn');
                    if (tabs[tabIndex]) {
                        tabs[tabIndex].click();
                    }
                    break;
            }
        }
        
        // ESC key to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
            this.hideResponseSearch();
        }
        
        // Question mark for shortcuts
        if (e.key === '?') {
            e.preventDefault();
            document.getElementById('shortcutsModal').style.display = 'flex';
        }
    }
    loadSharedRequest(requestData) {
        // Load shared request data into the UI
        document.getElementById('methodSelect').value = requestData.method || 'GET';
        document.getElementById('urlInput').value = requestData.url || '';
        document.getElementById('requestBody').value = requestData.body || '';
        
        // Load headers
        if (requestData.headers) {
            const headerRows = document.querySelectorAll('.header-row');
            Object.entries(requestData.headers).forEach(([key, value], index) => {
                if (index === 0) {
                    headerRows[0].querySelector('.header-key').value = key;
                    headerRows[0].querySelector('.header-value').value = value;
                } else {
                    this.addHeaderRow();
                    const newRow = document.querySelectorAll('.header-row')[index];
                    newRow.querySelector('.header-key').value = key;
                    newRow.querySelector('.header-value').value = value;
                }
            });
        }
        
        this.showNotification('Shared request loaded! 🔗', 'success');
    }

    // Mobile-specific enhancements
    setupMobileEnhancements() {
        // Add touch event support for better mobile interaction
        this.addTouchSupport();
        
        // Add mobile-specific keyboard shortcuts
        this.addMobileKeyboardSupport();
        
        // Add mobile gesture support
        this.addMobileGestureSupport();
        
        // Optimize for mobile viewport
        this.optimizeMobileViewport();
    }

    addTouchSupport() {
        // Add active states for touch devices
        const touchElements = document.querySelectorAll('button, .tab-btn, .response-tab-btn, .quick-action-btn');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            });
        });
    }

    addMobileKeyboardSupport() {
        // Handle virtual keyboard on mobile
        const inputs = document.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Scroll element into view when focused
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }

    addMobileGestureSupport() {
        // Add swipe support for sidebar
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Minimum swipe distance
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                const sidebar = document.querySelector('.sidebar');
                
                if (diffX > 0 && sidebar.classList.contains('mobile-open')) {
                    // Swipe left - close sidebar
                    this.closeMobileSidebar();
                } else if (diffX < 0 && !sidebar.classList.contains('mobile-open') && startX < 50) {
                    // Swipe right from edge - open sidebar
                    this.openMobileSidebar();
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }

    optimizeMobileViewport() {
        // Add meta viewport if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(viewport);
        }
        
        // Add PWA theme color
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeColor = document.createElement('meta');
            themeColor.name = 'theme-color';
            themeColor.content = '#1e90ff';
            document.head.appendChild(themeColor);
        }
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Force layout recalculation
                document.body.style.height = window.innerHeight + 'px';
                setTimeout(() => {
                    document.body.style.height = '';
                }, 100);
            }, 100);
        });
        
        // Handle window resize for mobile keyboards
        let initialHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDiff = initialHeight - currentHeight;
            
            // If height decreased significantly, likely virtual keyboard is open
            if (heightDiff > 150) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
        
        // Optimize for mobile performance
        this.optimizeMobilePerformance();
    }

    optimizeMobilePerformance() {
        // Debounce scroll events for better performance
        let scrollTimeout;
        const handleScroll = () => {
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = requestAnimationFrame(() => {
                // Handle any scroll-related updates here
                this.updateScrollPosition();
            });
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Use passive event listeners for touch events
        const touchElements = document.querySelectorAll('.tabs, .response-tabs, .quick-actions');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {}, { passive: true });
            element.addEventListener('touchmove', () => {}, { passive: true });
        });
        
        // Lazy load images and heavy content
        this.lazyLoadContent();
        
        // Preload critical resources
        this.preloadCriticalResources();
    }

    lazyLoadContent() {
        // Use Intersection Observer for lazy loading if available
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Load content when it becomes visible
                        const element = entry.target;
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                        observer.unobserve(element);
                    }
                });
            });
            
            // Observe elements that need lazy loading
            const lazyElements = document.querySelectorAll('[data-src]');
            lazyElements.forEach(element => observer.observe(element));
        }
    }

    preloadCriticalResources() {
        // Preload fonts and critical CSS
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    updateScrollPosition() {
        // Update UI based on scroll position if needed
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.header');
        
        if (scrollTop > 100 && window.innerWidth <= 768) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Enhanced mobile sidebar methods
    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const toggle = document.getElementById('mobileSidebarToggle');
        
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        toggle.innerHTML = '✕';
        toggle.setAttribute('aria-label', 'Close Sidebar');
        
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden';
        
        // Add animation class for better mobile experience
        sidebar.style.transform = 'translateX(0)';
        overlay.style.opacity = '1';
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        const toggle = document.getElementById('mobileSidebarToggle');
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        toggle.innerHTML = '📋';
        toggle.setAttribute('aria-label', 'Toggle Sidebar');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Add animation for better mobile experience
        sidebar.style.transform = 'translateX(100%)';
        overlay.style.opacity = '0';
    }

    // Enhanced mobile notification system
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Enhanced mobile styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            color: var(--text-primary);
            border: 2px solid var(${type === 'success' ? '--success-color' : type === 'error' ? '--error-color' : type === 'warning' ? '--warning-color' : '--info-color'});
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: var(--shadow-heavy);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: calc(100vw - 40px);
            word-wrap: break-word;
            transform: translateX(-50%) translateY(-100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.style.transform = 'translateX(-50%) translateY(0)', 100);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(-100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RESTerX();
    window.app = app;
    
    // Check for shared request in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedRequest = urlParams.get('request');
    if (sharedRequest) {
        try {
            const requestData = JSON.parse(atob(sharedRequest));
            app.loadSharedRequest(requestData);
        } catch (e) {
            console.warn('Invalid shared request URL');
        }
    }
});