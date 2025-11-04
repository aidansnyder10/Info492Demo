// Demo 3 - Authentication System
// Role-Based Access Control for Hacker and Bank Admin Dashboards

// Demo credentials (in production, these would be hashed and stored securely)
// Make CREDENTIALS globally accessible for the auto-login functions
window.CREDENTIALS = {
    hacker: {
        username: 'operator',
        password: 'Campaign2024!',
        twofa: '123456',
        // Session token format: operator:Campaign2024!:123456
        sessionToken: 'operator:Campaign2024!:123456'
    },
    bank: {
        username: 's.williams',
        password: 'SecureAdmin2024!',
        twofa: '654321'
    }
};

// Session management
const AuthManager = {
    currentUser: null,
    currentRole: null,

    init() {
        // Check for auto-login first (from new tab)
        const autoLoginRole = sessionStorage.getItem('demo3_auto_login_role');
        const autoLoginUsername = sessionStorage.getItem('demo3_auto_login_username');
        
        if (autoLoginRole && autoLoginUsername) {
            // Clear the auto-login flags
            sessionStorage.removeItem('demo3_auto_login_role');
            sessionStorage.removeItem('demo3_auto_login_username');
            
            // Auto-login
            this.currentUser = autoLoginUsername;
            this.currentRole = autoLoginRole;
            this.saveSession(autoLoginUsername, autoLoginRole);
            this.showDashboard();
            return;
        }
        
        // Check for existing session
        const session = this.getSession();
        if (session) {
            this.currentUser = session.username;
            this.currentRole = session.role;
            this.showDashboard();
            return;
        }

        // Show hacker login by default
        this.showLogin('hacker');
        
        // Setup login form handlers
        this.setupLoginHandlers();
    },

    setupLoginHandlers() {
        // Hacker login form - terminal style
        const hackerForm = document.getElementById('hacker-login-form');
        if (hackerForm) {
            hackerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin('hacker');
            });
            
            // Add Enter key handler for terminal input
            const hackerTokenInput = document.getElementById('hacker-session-token');
            if (hackerTokenInput) {
                hackerTokenInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        hackerForm.dispatchEvent(new Event('submit'));
                    }
                });
            }
        }

        // Bank admin login form
        const bankForm = document.getElementById('bank-login-form');
        if (bankForm) {
            bankForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin('bank');
            });
        }

        // Add switch login functionality
        this.addLoginSwitchButtons();
    },

    addLoginSwitchButtons() {
        // Add buttons to switch between login types
        const hackerLogin = document.getElementById('hacker-login');
        const bankLogin = document.getElementById('bank-login');

        if (hackerLogin && !hackerLogin.querySelector('.switch-login')) {
            const switchBtn = document.createElement('div');
            switchBtn.className = 'switch-login';
            switchBtn.style.cssText = 'text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;';
            switchBtn.innerHTML = `
                <p style="color: #888; font-size: 13px; margin-bottom: 10px;">Need to access Bank Admin Portal?</p>
                <button onclick="AuthManager.showLogin('bank')" style="background: transparent; border: 1px solid #667eea; color: #667eea; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                    <i class="fas fa-shield-alt"></i> Switch to Bank Admin Login
                </button>
            `;
            hackerLogin.querySelector('.login-container').appendChild(switchBtn);
        }

        if (bankLogin && !bankLogin.querySelector('.switch-login')) {
            const switchBtn = document.createElement('div');
            switchBtn.className = 'switch-login';
            switchBtn.style.cssText = 'text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;';
            switchBtn.innerHTML = `
                <p style="color: #666; font-size: 13px; margin-bottom: 10px;">Need to access Campaign Control Panel?</p>
                <button onclick="AuthManager.showLogin('hacker')" style="background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                    <i class="fas fa-user-secret"></i> Switch to Hacker Dashboard Login
                </button>
            `;
            bankLogin.querySelector('.login-container').appendChild(switchBtn);
        }
    },

    showLogin(role) {
        // Hide all login screens
        document.getElementById('hacker-login').style.display = 'none';
        document.getElementById('bank-login').style.display = 'none';
        
        // Hide dashboard
        document.getElementById('demo3-container').classList.remove('active');

        // Show appropriate login screen
        if (role === 'hacker') {
            document.getElementById('hacker-login').style.display = 'flex';
        } else if (role === 'bank') {
            document.getElementById('bank-login').style.display = 'flex';
        }

        // Clear any error messages
        this.clearErrors();
    },

    handleLogin(role) {
        let username, password, twofa;
        const errorField = role === 'hacker' ? 'hacker-error' : 'bank-error';

        // Clear previous errors
        this.clearErrors();

        if (role === 'hacker') {
            // Hacker login uses session token format: username:password:2fa
            const sessionToken = document.getElementById('hacker-session-token').value.trim();
            
            if (!sessionToken) {
                this.showError(errorField, '[!] Session token required. Format: operator:Campaign2024!:123456');
                return false;
            }
            
            // Parse session token (format: username:password:2fa)
            const parts = sessionToken.split(':');
            if (parts.length !== 3) {
                this.showError(errorField, '[!] Invalid token format. Expected: username:password:2fa');
                return false;
            }
            
            username = parts[0].trim();
            password = parts[1].trim();
            twofa = parts[2].trim();
            
            // Show authenticating message
            this.updateTerminalOutput('authenticating');
        } else {
            // Bank login uses traditional form fields
            const usernameField = 'bank-username';
            const passwordField = 'bank-password';
            const twofaField = 'bank-2fa';

            username = document.getElementById(usernameField).value.trim();
            password = document.getElementById(passwordField).value;
            twofa = document.getElementById(twofaField).value.trim();
        }

        // Validate credentials
        const creds = window.CREDENTIALS[role];
        
        if (username !== creds.username) {
            if (role === 'hacker') {
                this.showError(errorField, '[!] Authentication failed: Invalid token');
                this.updateTerminalOutput('failed');
            } else {
                this.showError(errorField, 'Invalid username. Please check your credentials.');
            }
            return false;
        }

        if (password !== creds.password) {
            if (role === 'hacker') {
                this.showError(errorField, '[!] Authentication failed: Invalid token');
                this.updateTerminalOutput('failed');
            } else {
                this.showError(errorField, 'Invalid password. Please try again.');
            }
            return false;
        }

        if (twofa !== creds.twofa) {
            if (role === 'hacker') {
                this.showError(errorField, '[!] Authentication failed: Invalid token');
                this.updateTerminalOutput('failed');
            } else {
                this.showError(errorField, 'Invalid 2FA/MFA code. Please check your authenticator app.');
            }
            return false;
        }

        // Successful login
        if (role === 'hacker') {
            this.updateTerminalOutput('success');
            // Delay dashboard show to show success message
            setTimeout(() => {
                this.currentUser = username;
                this.currentRole = role;
                this.saveSession(username, role);
                this.showDashboard();
            }, 1500);
        } else {
            this.currentUser = username;
            this.currentRole = role;
            this.saveSession(username, role);
            this.showDashboard();
        }

        return true;
    },
    
    updateTerminalOutput(status) {
        const output = document.getElementById('hacker-terminal-output');
        if (!output) return;
        
        const currentContent = output.innerHTML;
        
        if (status === 'authenticating') {
            output.innerHTML = currentContent + 
                '<div class="terminal-line" style="color: #ffaa00;">[+] Validating session token...</div>' +
                '<div class="terminal-line" style="color: #888;">[+] Checking token integrity...</div>' +
                '<div class="terminal-line" style="color: #888;">[+] Verifying credentials...</div>';
        } else if (status === 'success') {
            output.innerHTML = currentContent + 
                '<div class="terminal-line" style="color: #00ff00;">[✓] Token validated</div>' +
                '<div class="terminal-line" style="color: #00ff00;">[✓] Credentials verified</div>' +
                '<div class="terminal-line" style="color: #00ff00;">[+] Initializing control panel...</div>' +
                '<div class="terminal-line" style="color: #00ff00; margin-top: 10px;">[✓] Access granted. Redirecting...</div>';
        } else if (status === 'failed') {
            output.innerHTML = currentContent + 
                '<div class="terminal-line" style="color: #ff4444;">[✗] Authentication failed</div>' +
                '<div class="terminal-line" style="color: #ff4444;">[✗] Invalid session token</div>' +
                '<div class="terminal-line" style="color: #888; margin-top: 10px;">[!] Please verify your token and try again</div>';
        }
        
        // Scroll to bottom
        output.scrollTop = output.scrollHeight;
    },

    showError(errorFieldId, message) {
        const errorDiv = document.getElementById(errorFieldId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    },

    clearErrors() {
        const hackerError = document.getElementById('hacker-error');
        const bankError = document.getElementById('bank-error');
        if (hackerError) hackerError.style.display = 'none';
        if (bankError) bankError.style.display = 'none';
    },

    saveSession(username, role) {
        const session = {
            username: username,
            role: role,
            timestamp: Date.now()
        };
        sessionStorage.setItem('demo3_session', JSON.stringify(session));
    },

    getSession() {
        try {
            const sessionStr = sessionStorage.getItem('demo3_session');
            if (!sessionStr) return null;
            
            const session = JSON.parse(sessionStr);
            // Check if session is still valid (24 hours)
            const maxAge = 24 * 60 * 60 * 1000;
            if (Date.now() - session.timestamp > maxAge) {
                this.clearSession();
                return null;
            }
            return session;
        } catch (e) {
            return null;
        }
    },

    clearSession() {
        sessionStorage.removeItem('demo3_session');
        this.currentUser = null;
        this.currentRole = null;
    },

    showDashboard() {
        // Hide all login screens
        document.getElementById('hacker-login').style.display = 'none';
        document.getElementById('bank-login').style.display = 'none';

        // Show dashboard container
        document.getElementById('demo3-container').classList.add('active');

        // Update user info displays
        this.updateUserDisplays();

        // Show appropriate dashboard based on role
        if (this.currentRole === 'hacker') {
            switchDashboard('hacker');
        } else if (this.currentRole === 'bank') {
            switchDashboard('bank');
        }
    },

    updateUserDisplays() {
        if (this.currentUser) {
            const hackerDisplay = document.getElementById('hacker-username-display');
            const bankDisplay = document.getElementById('bank-username-display');
            
            if (hackerDisplay) {
                hackerDisplay.textContent = this.currentUser;
            }
            if (bankDisplay) {
                bankDisplay.textContent = this.currentUser;
            }
        }
    },

    logout() {
        this.clearSession();
        this.showLogin('hacker');
    }
};

// Global logout function
function logout(role) {
    if (confirm(`Are you sure you want to logout from the ${role === 'hacker' ? 'Campaign Control Panel' : 'Bank Admin Portal'}?`)) {
        AuthManager.logout();
    }
}

// Make AuthManager globally accessible
window.AuthManager = AuthManager;

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});
