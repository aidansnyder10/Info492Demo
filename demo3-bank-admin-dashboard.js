// Demo 3 - Bank Admin Dashboard Controller
class BankAdminDashboard {
    constructor() {
        this.emails = [];
        this.selectedEmail = null;
        
        this.init();
    }

    init() {
        this.loadEmails();
        this.setupEventListeners();
        this.displayEmails();
        this.updateKPIs();
        this.updateSecurityStatus();
        this.addActivityLog('System initialized', 'success');
        this.currentFilter = 'all';
    }

    setupEventListeners() {
        // Listen for new emails from hacker dashboard
        window.addEventListener('newEmailsReceived', (event) => {
            this.handleNewEmails(event.detail);
        });

        // Poll for new emails (in case event didn't fire)
        setInterval(() => {
            this.loadEmails();
        }, 2000);
    }

    loadEmails() {
        const saved = localStorage.getItem('demo3_bank_inbox');
        if (saved) {
            this.emails = JSON.parse(saved).sort((a, b) => 
                new Date(b.receivedAt) - new Date(a.receivedAt)
            );
        }
        this.updateKPIs();
    }
    
    filterEmails(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.displayEmails();
    }
    
    updateKPIs() {
        const highRiskEmails = this.emails.filter(e => e.riskLevel === 'high').length;
        const mediumRiskEmails = this.emails.filter(e => e.riskLevel === 'medium').length;
        const blockedEmails = this.emails.filter(e => e.status === 'blocked' || e.status === 'reported').length;
        const activeIncidents = this.emails.filter(e => e.riskLevel === 'high' && !e.read).length;
        
        // Update KPI cards
        document.getElementById('kpi-threats').textContent = this.emails.filter(e => e.riskLevel === 'high' || e.riskLevel === 'medium').length;
        document.getElementById('kpi-threats-change').textContent = `${highRiskEmails + mediumRiskEmails} in last 24h`;
        
        document.getElementById('kpi-blocked').textContent = blockedEmails;
        document.getElementById('kpi-blocked-change').textContent = `${blockedEmails} total`;
        
        document.getElementById('kpi-incidents').textContent = activeIncidents;
        document.getElementById('kpi-incidents-change').textContent = activeIncidents > 0 ? 'Action Required' : 'All Clear';
        
        // Update card colors based on threat level
        const threatsCard = document.getElementById('kpi-threats-card');
        const incidentsCard = document.getElementById('kpi-incidents-card');
        
        if (activeIncidents > 0) {
            incidentsCard.className = 'bank-kpi-card critical';
        } else if (this.emails.length > 0) {
            incidentsCard.className = 'bank-kpi-card warning';
        } else {
            incidentsCard.className = 'bank-kpi-card';
        }
        
        if (highRiskEmails > 0) {
            threatsCard.className = 'bank-kpi-card critical';
        } else if (mediumRiskEmails > 0) {
            threatsCard.className = 'bank-kpi-card warning';
        } else {
            threatsCard.className = 'bank-kpi-card';
        }
        
        // Calculate average response time (simulated)
        if (blockedEmails > 0) {
            const avgTime = Math.floor(Math.random() * 15 + 5);
            document.getElementById('kpi-response').textContent = `${avgTime}m`;
            document.getElementById('kpi-response-change').textContent = 'Within SLA';
        }
    }
    
    updateSecurityStatus() {
        const highRiskCount = this.emails.filter(e => e.riskLevel === 'high' && !e.read).length;
        const statusDot = document.getElementById('securityStatusDot');
        const statusText = document.getElementById('securityStatusText');
        
        if (highRiskCount > 0) {
            statusDot.className = 'status-dot critical';
            statusText.textContent = 'Threats Detected - Action Required';
            statusText.style.color = '#ff4444';
        } else if (this.emails.filter(e => e.riskLevel === 'medium' && !e.read).length > 0) {
            statusDot.className = 'status-dot warning';
            statusText.textContent = 'Elevated Risk - Monitor Closely';
            statusText.style.color = '#ff8800';
        } else {
            statusDot.className = 'status-dot';
            statusText.textContent = 'All Systems Operational';
            statusText.style.color = '#00aa44';
        }
        
        // Update last update time
        document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
    }
    
    addActivityLog(message, type = 'success') {
        const activityLog = document.getElementById('activityLog');
        if (!activityLog) return;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${timeStr}</span>
            <span class="log-action ${type}">${message}</span>
        `;
        
        activityLog.insertBefore(logEntry, activityLog.firstChild);
        
        // Keep only last 10 entries
        while (activityLog.children.length > 10) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }
    
    updateThreatFeed(newEmails) {
        const threatFeed = document.getElementById('threatFeed');
        if (!threatFeed || !newEmails || newEmails.length === 0) return;
        
        const highRisk = newEmails.filter(e => e.riskLevel === 'high');
        if (highRisk.length > 0) {
            const threatItem = document.createElement('div');
            threatItem.className = 'threat-item critical';
            threatItem.innerHTML = `
                <strong>Phishing Campaign Detected</strong><br>
                <small>${highRisk.length} high-risk email${highRisk.length > 1 ? 's' : ''} targeting banking admin accounts</small>
                <div class="threat-time">Just now</div>
            `;
            threatFeed.insertBefore(threatItem, threatFeed.firstChild);
            
            // Keep only last 5 threat items
            while (threatFeed.children.length > 5) {
                threatFeed.removeChild(threatFeed.lastChild);
            }
        }
    }

    handleNewEmails(newEmails) {
        if (newEmails && newEmails.length > 0) {
            this.loadEmails();
            this.displayEmails();
            this.showSecurityAlert(newEmails);
            this.updateSecurityStatus();
            this.updateThreatFeed(newEmails);
            this.addActivityLog(`${newEmails.length} new email${newEmails.length > 1 ? 's' : ''} received`, 
                newEmails.some(e => e.riskLevel === 'high') ? 'critical' : 'warning');
        }
    }

    showSecurityAlert(newEmails) {
        const alertPanel = document.getElementById('alertPanel');
        const alertMessage = document.getElementById('alertMessage');
        
        const highRiskCount = newEmails.filter(e => e.riskLevel === 'high').length;
        const mediumRiskCount = newEmails.filter(e => e.riskLevel === 'medium').length;
        
        if (highRiskCount > 0 || mediumRiskCount > 0) {
            alertMessage.innerHTML = `
                <strong>⚠️ ${newEmails.length} new email${newEmails.length > 1 ? 's' : ''} received</strong><br>
                ${highRiskCount > 0 ? `<span style="color: #ff4444;">${highRiskCount} high-risk email${highRiskCount > 1 ? 's' : ''}</span>` : ''}
                ${mediumRiskCount > 0 ? `<span style="color: #ff8800;">${mediumRiskCount} medium-risk email${mediumRiskCount > 1 ? 's' : ''}</span>` : ''}
                <br><small>Review emails in inbox below</small>
            `;
            alertPanel.style.display = 'block';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                alertPanel.style.display = 'none';
            }, 10000);
        }
    }

    displayEmails() {
        const emailInbox = document.getElementById('emailInbox');
        
        if (this.emails.length === 0) {
            emailInbox.innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">No emails received yet. Emails will appear here when generated from the Hacker Dashboard.</p>';
            return;
        }

        // Filter emails based on current filter
        let filteredEmails = this.emails;
        if (this.currentFilter === 'high') {
            filteredEmails = this.emails.filter(e => e.riskLevel === 'high');
        } else if (this.currentFilter === 'medium') {
            filteredEmails = this.emails.filter(e => e.riskLevel === 'medium');
        } else if (this.currentFilter === 'low') {
            filteredEmails = this.emails.filter(e => e.riskLevel === 'low');
        }

        if (filteredEmails.length === 0) {
            emailInbox.innerHTML = `<p style="color: #666; text-align: center; padding: 40px;">No ${this.currentFilter === 'all' ? '' : this.currentFilter + ' risk '}emails found.</p>`;
            return;
        }

        emailInbox.innerHTML = filteredEmails.map(email => {
            const riskClass = email.riskLevel === 'high' ? 'suspicious' : email.riskLevel === 'medium' ? 'high-risk' : '';
            const riskBadgeClass = `risk-${email.riskLevel}`;
            const timeAgo = this.getTimeAgo(email.receivedAt);
            
            return `
                <div class="email-item ${riskClass}" onclick="bankAdminDashboard.selectEmail('${email.id}')">
                    <div class="email-header">
                        <div>
                            <span class="email-sender">${email.sender}</span>
                            <span class="risk-badge ${riskBadgeClass}">${email.riskLevel.toUpperCase()}</span>
                        </div>
                        <span class="email-time">${timeAgo}</span>
                    </div>
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-preview">
                        ${email.content.substring(0, 150)}${email.content.length > 150 ? '...' : ''}
                    </div>
                    ${!email.read ? '<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-top: 8px; display: inline-block;">NEW</span>' : ''}
                </div>
            `;
        }).join('');
    }

    selectEmail(emailId) {
        this.selectedEmail = this.emails.find(e => e.id === emailId);
        if (this.selectedEmail) {
            if (!this.selectedEmail.read) {
                this.selectedEmail.read = true;
                this.saveEmails();
                this.addActivityLog(`Viewed email: ${this.selectedEmail.subject}`, 'success');
            }
            this.displayEmailDetail();
        }
    }

    displayEmailDetail() {
        if (!this.selectedEmail) return;

        const emailInbox = document.getElementById('emailInbox');
        const emailIndex = this.emails.findIndex(e => e.id === this.selectedEmail.id);
        
        // Replace the email item with detailed view
        const emailItem = emailInbox.children[emailIndex];
        const riskClass = this.selectedEmail.riskLevel === 'high' ? 'suspicious' : this.selectedEmail.riskLevel === 'medium' ? 'high-risk' : '';
        const riskBadgeClass = `risk-${this.selectedEmail.riskLevel}`;
        const timeAgo = this.getTimeAgo(this.selectedEmail.receivedAt);

        emailItem.outerHTML = `
            <div class="email-item ${riskClass}" style="background: white; border: 2px solid ${this.selectedEmail.riskLevel === 'high' ? '#ff4444' : this.selectedEmail.riskLevel === 'medium' ? '#ff8800' : '#667eea'};">
                <div style="margin-bottom: 15px;">
                    <button onclick="bankAdminDashboard.backToInbox()" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-bottom: 15px;">
                        <i class="fas fa-arrow-left"></i> Back to Inbox
                    </button>
                </div>
                
                <div class="email-header">
                    <div>
                        <span class="email-sender">${this.selectedEmail.sender}</span>
                        <span class="risk-badge ${riskBadgeClass}">${this.selectedEmail.riskLevel.toUpperCase()}</span>
                    </div>
                    <span class="email-time">${timeAgo}</span>
                </div>
                
                <div style="color: #666; font-size: 14px; margin-bottom: 10px;">
                    <strong>From:</strong> ${this.selectedEmail.senderEmail}<br>
                    <strong>To:</strong> ${this.selectedEmail.targetPersona.email}<br>
                    <strong>Risk Score:</strong> ${this.selectedEmail.riskScore}/100
                </div>
                
                <div class="email-subject" style="font-size: 18px; margin: 15px 0;">${this.selectedEmail.subject}</div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap; line-height: 1.6; color: #333;">
                    ${this.selectedEmail.content}
                </div>

                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff4444;">
                    <h4 style="margin-top: 0; color: #ff4444;"><i class="fas fa-exclamation-triangle"></i> Security Analysis</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #666;">
                        ${this.selectedEmail.riskScore > 70 ? '<li><strong>High Risk:</strong> Contains urgent language and credential requests</li>' : ''}
                        ${this.selectedEmail.subject.toLowerCase().includes('urgent') || this.selectedEmail.subject.toLowerCase().includes('critical') ? '<li><strong>Urgency Indicators:</strong> Subject line uses urgent language</li>' : ''}
                        ${this.selectedEmail.content.toLowerCase().includes('credentials') || this.selectedEmail.content.toLowerCase().includes('password') ? '<li><strong>Suspicious:</strong> Requests sensitive information</li>' : ''}
                        <li><strong>Sender Verification:</strong> Domain does not match known vendors</li>
                    </ul>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-block" onclick="bankAdminDashboard.blockEmail('${this.selectedEmail.id}')">
                        <i class="fas fa-ban"></i> Block Sender
                    </button>
                    <button class="btn btn-report" onclick="bankAdminDashboard.reportPhishing('${this.selectedEmail.id}')">
                        <i class="fas fa-flag"></i> Report Phishing
                    </button>
                    ${this.selectedEmail.riskLevel !== 'low' ? '' : `
                        <button class="btn btn-approve" onclick="bankAdminDashboard.approveEmail('${this.selectedEmail.id}')">
                            <i class="fas fa-check"></i> Mark as Safe
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    backToInbox() {
        this.displayEmails();
        this.selectedEmail = null;
    }

    blockEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (email && confirm(`Block emails from ${email.senderEmail}?`)) {
            email.status = 'blocked';
            this.saveEmails();
            this.updateKPIs();
            this.updateSecurityStatus();
            this.addActivityLog(`Blocked sender: ${email.senderEmail}`, 'success');
            this.displayEmails();
            alert(`Emails from ${email.senderEmail} have been blocked.`);
            this.backToInbox();
        }
    }

    reportPhishing(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (email) {
            email.status = 'reported';
            this.saveEmails();
            
            // Log to security team (simulated)
            const securityLog = JSON.parse(localStorage.getItem('demo3_security_log') || '[]');
            securityLog.push({
                emailId: email.id,
                subject: email.subject,
                sender: email.senderEmail,
                target: email.targetPersona.name,
                reportedAt: new Date().toISOString(),
                riskScore: email.riskScore
            });
            localStorage.setItem('demo3_security_log', JSON.stringify(securityLog));
            
            this.updateKPIs();
            this.updateSecurityStatus();
            this.addActivityLog(`Reported phishing: ${email.subject}`, 'critical');
            this.displayEmails();
            
            alert('Phishing email reported to security team. Incident ticket created.');
            this.backToInbox();
        }
    }

    approveEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (email && confirm('Mark this email as safe and legitimate?')) {
            email.status = 'approved';
            this.saveEmails();
            this.addActivityLog(`Approved email: ${email.subject}`, 'success');
            this.displayEmails();
            alert('Email marked as safe.');
            this.backToInbox();
        }
    }

    saveEmails() {
        localStorage.setItem('demo3_bank_inbox', JSON.stringify(this.emails));
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
}

// Initialize bank admin dashboard
let bankAdminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the bank admin dashboard view
    if (document.getElementById('bank-admin-dashboard')) {
        bankAdminDashboard = new BankAdminDashboard();
        // Make it globally accessible
        window.bankAdminDashboard = bankAdminDashboard;
    }
});
