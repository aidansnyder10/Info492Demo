// Demo 3 - Hacker Dashboard Controller
class HackerDashboard {
    constructor() {
        this.campaigns = [];
        this.currentCampaign = null;
        this.selectedTargets = [];
        this.generatedEmails = [];
        this.personas = [];
        
        this.init();
    }

    init() {
        this.loadPersonas();
        this.loadCampaigns();
        this.setupEventListeners();
        this.updateKPIs();
        this.generateActivityChart();
        this.updateQuickStats();
    }

    loadPersonas() {
        // Use the same personas from the phishing demo
        this.personas = [
            {
                id: 1,
                name: "John Doe",
                role: "System Administrator",
                department: "Information Technology",
                company: "First National Bank",
                email: "john.doe@firstnational.com",
                background: "5 years experience managing core banking systems and server infrastructure"
            },
            {
                id: 2,
                name: "Jane Smith",
                role: "Network Administrator",
                department: "Information Technology",
                company: "Metropolitan Credit Union",
                email: "jane.smith@metrocu.org",
                background: "10 years managing network infrastructure, firewalls, and security systems"
            },
            {
                id: 3,
                name: "Michael Chen",
                role: "Database Administrator",
                department: "Information Technology",
                company: "Regional Financial Corp",
                email: "m.chen@regionalfinance.com",
                background: "CISSP certified, manages customer data and transaction databases"
            },
            {
                id: 4,
                name: "Sarah Williams",
                role: "Security Administrator",
                department: "Information Security",
                company: "Prestige Investment Group",
                email: "s.williams@prestige-invest.com",
                background: "Certified security professional, manages access controls and security policies"
            },
            {
                id: 5,
                name: "David Rodriguez",
                role: "IT Operations Administrator",
                department: "Operations",
                company: "Community Trust Bank",
                email: "d.rodriguez@communitytrust.com",
                background: "8 years managing IT operations, backup systems, and disaster recovery"
            },
            {
                id: 6,
                name: "Lisa Thompson",
                role: "Application Administrator",
                department: "Information Technology",
                company: "Capital City Bank",
                email: "l.thompson@capitalcity.bank",
                background: "MBA in IT, 12 years managing banking applications and user access"
            },
            {
                id: 7,
                name: "Robert Kim",
                role: "Infrastructure Administrator",
                department: "Information Technology",
                company: "United Financial Services",
                email: "r.kim@unitedfinancial.com",
                background: "Certified cloud architect, manages server infrastructure and virtualization"
            },
            {
                id: 8,
                name: "Amanda Foster",
                role: "Compliance Administrator",
                department: "Risk & Compliance",
                company: "Heritage Bank & Trust",
                email: "a.foster@heritagebank.com",
                background: "7 years managing regulatory compliance systems and audit trails"
            },
            {
                id: 9,
                name: "James Wilson",
                role: "Security Operations Administrator",
                department: "Information Security",
                company: "SecureFirst Bank",
                email: "j.wilson@securefirst.com",
                background: "Former cybersecurity analyst, manages SIEM and incident response systems"
            },
            {
                id: 10,
                name: "Maria Garcia",
                role: "User Access Administrator",
                department: "Information Technology",
                company: "Friendly Neighborhood Bank",
                email: "m.garcia@friendlybank.com",
                background: "15 years managing user accounts, permissions, and identity management systems"
            }
        ];

        this.displayTargets();
    }

    displayTargets() {
        const targetGrid = document.getElementById('targetGrid');
        targetGrid.innerHTML = '';

        this.personas.forEach(persona => {
            const targetCard = document.createElement('div');
            targetCard.className = 'target-persona';
            targetCard.innerHTML = `
                <input type="checkbox" id="target_${persona.id}" onchange="hackerDashboard.toggleTarget(${persona.id})">
                <label for="target_${persona.id}" style="cursor: pointer; color: #e0e0e0;">
                    <strong>${persona.name}</strong><br>
                    <small>${persona.role}</small><br>
                    <small style="color: #888;">${persona.company}</small>
                </label>
            `;
            targetGrid.appendChild(targetCard);
        });
    }

    toggleTarget(personaId) {
        const checkbox = document.getElementById(`target_${personaId}`);
        const persona = this.personas.find(p => p.id === personaId);
        
        if (checkbox.checked) {
            if (!this.selectedTargets.find(t => t.id === personaId)) {
                this.selectedTargets.push(persona);
                document.querySelector(`#target_${personaId}`).closest('.target-persona').classList.add('selected');
            }
        } else {
            this.selectedTargets = this.selectedTargets.filter(t => t.id !== personaId);
            document.querySelector(`#target_${personaId}`).closest('.target-persona').classList.remove('selected');
        }

        this.updateSelectedCount();
        this.updateExecuteButton();
    }

    updateSelectedCount() {
        document.getElementById('selectedCount').textContent = this.selectedTargets.length;
        this.updateKPIs();
    }

    updateExecuteButton() {
        const executeBtn = document.getElementById('executeBtn');
        executeBtn.disabled = this.selectedTargets.length === 0 || !this.currentCampaign;
        
        const statusEl = document.getElementById('campaignStatus');
        if (statusEl) {
            if (this.currentCampaign) {
                statusEl.textContent = this.currentCampaign.emails.length > 0 ? 'Deployed' : 'Ready';
                statusEl.style.color = this.currentCampaign.emails.length > 0 ? '#00ff88' : '#ffaa00';
            } else {
                statusEl.textContent = 'No Active Campaign';
                statusEl.style.color = '#888';
            }
        }
    }
    
    updateKPIs() {
        const activeCampaigns = this.campaigns.filter(c => c.emails.length > 0 || c === this.currentCampaign).length;
        const totalEmails = this.campaigns.reduce((sum, c) => sum + c.emails.length, 0);
        const targets = this.selectedTargets.length;
        
        document.getElementById('kpi-active-campaigns').textContent = activeCampaigns;
        document.getElementById('kpi-emails-sent').textContent = totalEmails;
        document.getElementById('kpi-targets').textContent = targets;
        
        // Update change indicators
        document.getElementById('kpi-campaigns-change').textContent = `+${activeCampaigns} active`;
        document.getElementById('kpi-emails-change').textContent = `${totalEmails} total`;
        document.getElementById('kpi-targets-change').textContent = targets > 0 ? `${targets} selected` : '0 active';
        
        // Success rate (simulated - in real scenario this would track actual responses)
        const successRate = totalEmails > 0 ? Math.floor(Math.random() * 15 + 5) : 0;
        document.getElementById('kpi-success-rate').textContent = `${successRate}%`;
        document.getElementById('kpi-success-change').textContent = totalEmails > 0 ? 'Monitoring...' : 'Pending';
    }
    
    generateActivityChart() {
        const chartContainer = document.getElementById('activityChart');
        if (!chartContainer) return;
        
        // Generate 24 bars for last 24 hours
        const hours = 24;
        const bars = [];
        
        for (let i = 0; i < hours; i++) {
            // Random activity level, with some spikes
            const baseLevel = Math.random() * 30;
            const spike = Math.random() < 0.1 ? Math.random() * 50 + 30 : 0;
            const height = Math.min(100, baseLevel + spike);
            
            bars.push(`<div class="chart-bar" style="height: ${height}%;" title="Hour ${i}: ${Math.round(height)} events"></div>`);
        }
        
        chartContainer.innerHTML = bars.join('');
    }
    
    updateQuickStats() {
        const totalEmails = this.campaigns.reduce((sum, c) => sum + c.emails.length, 0);
        document.getElementById('stat-total-emails').textContent = totalEmails;
        
        if (totalEmails > 0) {
            const allEmails = this.campaigns.flatMap(c => c.emails);
            const avgRisk = Math.round(allEmails.reduce((sum, e) => sum + (e.riskScore || 50), 0) / allEmails.length);
            document.getElementById('stat-avg-risk').textContent = `${avgRisk}/100`;
            
            const lastEmail = allEmails[allEmails.length - 1];
            if (lastEmail && lastEmail.timestamp) {
                const lastDeploy = new Date(lastEmail.timestamp);
                const now = new Date();
                const diffMinutes = Math.floor((now - lastDeploy) / 60000);
                let timeText;
                if (diffMinutes < 1) timeText = 'Just now';
                else if (diffMinutes < 60) timeText = `${diffMinutes}m ago`;
                else if (diffMinutes < 1440) timeText = `${Math.floor(diffMinutes/60)}h ago`;
                else timeText = lastDeploy.toLocaleDateString();
                document.getElementById('stat-last-deploy').textContent = timeText;
            }
        } else {
            document.getElementById('stat-avg-risk').textContent = '-';
            document.getElementById('stat-last-deploy').textContent = 'Never';
        }
    }

    setupEventListeners() {
        // Campaign name input
        document.getElementById('campaignName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createCampaign();
            }
        });
    }

    createCampaign() {
        const campaignName = document.getElementById('campaignName').value.trim();
        
        if (!campaignName) {
            alert('Please enter a campaign name');
            return;
        }

        const campaign = {
            id: Date.now(),
            name: campaignName,
            createdAt: new Date().toISOString(),
            status: 'active',
            targets: [],
            emails: []
        };

        this.campaigns.push(campaign);
        this.currentCampaign = campaign;
        this.saveCampaigns();
        this.displayCampaigns();
        document.getElementById('campaignName').value = '';
        this.updateExecuteButton();
        this.updateKPIs();
    }

    loadCampaigns() {
        const saved = localStorage.getItem('demo3_campaigns');
        if (saved) {
            this.campaigns = JSON.parse(saved);
            if (this.campaigns.length > 0) {
                this.currentCampaign = this.campaigns.find(c => c.status === 'active') || this.campaigns[0];
            }
            this.displayCampaigns();
        }
    }

    saveCampaigns() {
        localStorage.setItem('demo3_campaigns', JSON.stringify(this.campaigns));
    }

    displayCampaigns() {
        const campaignList = document.getElementById('campaignList');
        campaignList.innerHTML = '';

        if (this.campaigns.length === 0) {
            campaignList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No campaigns yet. Create one above.</p>';
            return;
        }

        this.campaigns.forEach(campaign => {
            const status = campaign.emails.length > 0 ? 'completed' : 'pending';
            const statusClass = campaign.emails.length > 0 ? 'status-completed' : 'status-pending';
            const statusText = campaign.emails.length > 0 ? 'Deployed' : 'Ready';
            
            const campaignItem = document.createElement('div');
            campaignItem.className = `campaign-item ${campaign.id === this.currentCampaign?.id ? 'active' : ''}`;
            campaignItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <strong style="color: #ff4444;">${campaign.name}</strong>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div style="font-size: 12px; color: #888; margin-bottom: 5px;">
                            <i class="fas fa-calendar"></i> ${new Date(campaign.createdAt).toLocaleDateString()} 
                            <span style="margin-left: 15px;"><i class="fas fa-envelope"></i> ${campaign.emails.length} emails</span>
                        </div>
                        <div style="font-size: 11px; color: #666;">
                            Created: ${new Date(campaign.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                    <button onclick="hackerDashboard.selectCampaign(${campaign.id})" style="background: #ff4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; white-space: nowrap;">
                        <i class="fas fa-check"></i> Select
                    </button>
                </div>
            `;
            campaignList.appendChild(campaignItem);
        });
        
        this.updateKPIs();
    }

    selectCampaign(campaignId) {
        this.currentCampaign = this.campaigns.find(c => c.id === campaignId);
        this.displayCampaigns();
        this.updateExecuteButton();
    }

    async executeAttack() {
        if (this.selectedTargets.length === 0) {
            alert('Please select at least one target');
            return;
        }

        if (!this.currentCampaign) {
            alert('Please create or select a campaign first');
            return;
        }

        const model = document.getElementById('attackModel').value;
        const attackLevel = document.getElementById('attackLevel').value;
        const urgencyLevel = document.getElementById('urgencyLevel').value;

        const statusDiv = document.getElementById('attackStatus');
        statusDiv.textContent = 'Generating phishing emails...';
        statusDiv.style.color = '#ffaa00';

        const executeBtn = document.getElementById('executeBtn');
        executeBtn.disabled = true;

        this.generatedEmails = [];
        let successCount = 0;
        let failCount = 0;

        // Generate email for each selected target
        for (let i = 0; i < this.selectedTargets.length; i++) {
            const persona = this.selectedTargets[i];
            statusDiv.textContent = `Generating email ${i + 1}/${this.selectedTargets.length} for ${persona.name}...`;

            try {
                const email = await this.generateEmailForPersona(persona, model, attackLevel, urgencyLevel);
                if (email) {
                    this.generatedEmails.push(email);
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Error generating email for ${persona.name}:`, error);
                failCount++;
            }

            // Small delay between generations
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Save emails to campaign and localStorage
        if (this.generatedEmails.length > 0) {
            this.currentCampaign.emails.push(...this.generatedEmails);
            this.saveCampaigns();
            this.saveEmailsToBankInbox();
            this.displayResults();
            this.updateKPIs();
            this.updateQuickStats();
            this.generateActivityChart(); // Refresh chart with new activity
        }

        statusDiv.textContent = `Attack completed! Generated ${successCount} emails successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}`;
        statusDiv.style.color = successCount > 0 ? '#00ff88' : '#ff4444';

        executeBtn.disabled = false;
        this.updateExecuteButton();
    }

    async generateEmailForPersona(persona, model, attackLevel, urgencyLevel) {
        const urgencyText = {
            'low': 'slight',
            'medium': 'moderate',
            'high': 'high',
            'critical': 'extreme'
        }[urgencyLevel] || 'moderate';

        const attackLevelText = {
            'basic': 'Create a basic professional email',
            'advanced': 'Create a sophisticated, convincing professional email with detailed context',
            'expert': 'Create an expertly crafted, highly personalized email with advanced social engineering techniques'
        }[attackLevel] || 'Create a professional email';

        const prompt = `${attackLevelText} for educational cybersecurity training.

Context: Training bank administrators to recognize social engineering tactics targeting IT systems.

Target: ${persona.name}, ${persona.role} at ${persona.company}
Background: ${persona.background}
Urgency Level: ${urgencyText}

Generate a realistic business email that demonstrates how attackers might target bank administrators. Focus on admin-specific threats like:
- Fake system maintenance requests
- Fraudulent vendor invoices for IT services
- Fake security breach notifications
- Phony software license renewals
- False emergency system updates
- Fake compliance audit requests

Requirements:
- Use the recipient's actual name: ${persona.name}
- Reference their specific admin role: ${persona.role}
- Mention their company: ${persona.company}
- Create ${urgencyText} urgency around system security or compliance
- Include admin-specific technical details
- Keep it professional and believable
- Include a clear call-to-action (clicking links, providing credentials, approving invoices)

IMPORTANT: You must respond with ONLY valid JSON, no additional text before or after. Use this exact format:
{
    "subject": "Urgent: System Maintenance Required - ${persona.company}",
    "content": "Dear ${persona.name},\\n\\nAs ${persona.role} at ${persona.company}, we need immediate access to your admin systems for critical maintenance. Please review the attached documentation and provide your administrative credentials.\\n\\nBest regards,\\nIT Operations Team",
    "sender": "IT Operations Team"
}

Return ONLY the JSON object, nothing else.`;

        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'openrouter',
                    model: model,
                    inputs: prompt
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.response || data.choices?.[0]?.message?.content || data.content || '';
            
            if (!aiResponse || aiResponse.trim().length < 10) {
                console.error('Empty or invalid AI response:', data);
                throw new Error('Empty response from AI');
            }

            // Parse JSON response with multiple fallback strategies
            let emailData = null;
            let parseError = null;
            
            // Strategy 1: Direct JSON parse
            try {
                emailData = JSON.parse(aiResponse.trim());
            } catch (e) {
                parseError = e;
            }
            
            // Strategy 2: Extract JSON from markdown code blocks
            if (!emailData) {
                try {
                    const markdownMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                    if (markdownMatch) {
                        emailData = JSON.parse(markdownMatch[1].trim());
                    }
                } catch (e) {
                    parseError = e;
                }
            }
            
            // Strategy 3: Find JSON object in the response (handle nested braces)
            if (!emailData) {
                try {
                    // Find the first { and match until the last } (handles nested objects)
                    const firstBrace = aiResponse.indexOf('{');
                    const lastBrace = aiResponse.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        const jsonStr = aiResponse.substring(firstBrace, lastBrace + 1);
                        emailData = JSON.parse(jsonStr);
                    }
                } catch (e) {
                    parseError = e;
                }
            }
            
            // Strategy 4: Try to extract fields manually if JSON parsing fails
            if (!emailData) {
                console.warn('Could not parse JSON, attempting manual extraction:', aiResponse);
                // Try to match JSON fields with escaped strings (handles multi-line content)
                const subjectMatch = aiResponse.match(/"subject"\s*:\s*"((?:[^"\\]|\\.)*)"/) || 
                                   aiResponse.match(/subject["\s]*:["\s]*([^\n,"}]+)/i);
                
                // For content, try to match the full string including escaped newlines
                let contentMatch = aiResponse.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                if (!contentMatch) {
                    // Try without quotes (in case quotes are missing)
                    contentMatch = aiResponse.match(/"content"\s*:\s*([^,}]+)/);
                }
                if (!contentMatch) {
                    // Try case-insensitive
                    contentMatch = aiResponse.match(/content["\s]*:["\s]*([^\n,"}]+)/i);
                }
                
                const senderMatch = aiResponse.match(/"sender"\s*:\s*"((?:[^"\\]|\\.)*)"/) || 
                                  aiResponse.match(/sender["\s]*:["\s]*([^\n,"}]+)/i);
                
                if (subjectMatch && contentMatch) {
                    emailData = {
                        subject: subjectMatch[1].trim().replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                        content: contentMatch[1].trim().replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                        sender: senderMatch ? senderMatch[1].trim().replace(/\\"/g, '"') : 'IT Operations'
                    };
                }
            }
            
            // Strategy 5: If still no emailData, create a fallback from the raw response
            if (!emailData) {
                console.warn('Using fallback email generation from raw response');
                console.log('Raw AI response:', aiResponse);
                
                // Try to extract subject from the response
                const lines = aiResponse.split('\n').filter(l => l.trim());
                let subject = 'System Maintenance Required';
                let content = aiResponse;
                
                // Look for subject line
                const subjectLine = lines.find(l => 
                    l.toLowerCase().includes('subject') || 
                    l.includes('Subject:') ||
                    l.match(/^subject\s*:/i)
                );
                
                if (subjectLine) {
                    subject = subjectLine.replace(/.*subject.*:.*/i, '').trim().replace(/^["']|["']$/g, '');
                    // Remove subject line from content
                    content = aiResponse.replace(/.*subject.*:.*\n/i, '').trim();
                } else if (lines.length > 0) {
                    // Use first line as subject if it's short
                    const firstLine = lines[0].trim();
                    if (firstLine.length < 100 && !firstLine.includes('{') && !firstLine.includes('}')) {
                        subject = firstLine.replace(/^["']|["']$/g, '');
                        content = lines.slice(1).join('\n').trim() || aiResponse;
                    }
                }
                
                // Clean up content
                content = content
                    .replace(/^\{.*?\}/s, '') // Remove JSON wrapper if present
                    .replace(/```json?/gi, '') // Remove markdown code blocks
                    .replace(/```/g, '')
                    .trim();
                
                // If content is still too long or empty, use a default
                if (!content || content.length < 10) {
                    content = `Dear ${persona.name},\n\nThis is a system maintenance notification from ${persona.company}. Please review the attached documentation.\n\nBest regards,\nIT Operations Team`;
                }
                
                emailData = {
                    subject: subject || 'System Maintenance Required',
                    content: content.substring(0, 1000), // Limit to 1000 chars
                    sender: 'IT Operations Team'
                };
            }

            if (!emailData || !emailData.subject || !emailData.content) {
                console.error('Failed to parse email data. Raw response:', aiResponse);
                console.error('Parse error:', parseError);
                throw new Error(`Invalid email format. Could not extract subject and content from AI response.`);
            }

            // Calculate risk score
            const riskScore = this.calculateRiskScore(emailData);

            return {
                id: `email_${Date.now()}_${persona.id}`,
                campaignId: this.currentCampaign.id,
                targetPersona: persona,
                subject: emailData.subject,
                content: emailData.content,
                sender: emailData.sender || 'Unknown Sender',
                senderEmail: this.generateSenderEmail(emailData.sender || 'IT Operations'),
                timestamp: new Date().toISOString(),
                model: model,
                attackLevel: attackLevel,
                urgencyLevel: urgencyLevel,
                riskScore: riskScore,
                status: 'delivered'
            };

        } catch (error) {
            console.error('Email generation error:', error);
            return null;
        }
    }

    calculateRiskScore(emailData) {
        let score = 50; // Base score
        
        const content = (emailData.content || '').toLowerCase();
        const subject = (emailData.subject || '').toLowerCase();

        // High urgency indicators
        if (subject.includes('urgent') || subject.includes('critical') || subject.includes('immediate')) {
            score += 20;
        }
        if (content.includes('immediately') || content.includes('asap') || content.includes('right away')) {
            score += 15;
        }

        // Suspicious keywords
        if (content.includes('credentials') || content.includes('password') || content.includes('login')) {
            score += 15;
        }
        if (content.includes('click here') || content.includes('verify') || content.includes('confirm')) {
            score += 10;
        }

        // Professional indicators (reduce risk slightly)
        if (content.includes('please') || content.includes('thank you')) {
            score -= 5;
        }

        return Math.min(100, Math.max(0, score));
    }

    generateSenderEmail(senderName) {
        const domains = ['operations@securebank.com', 'it-support@banking-services.com', 'security@firstnational.com', 'compliance@financialcorp.com'];
        return domains[Math.floor(Math.random() * domains.length)];
    }

    saveEmailsToBankInbox() {
        // Save emails to localStorage so bank admin dashboard can access them
        const existingEmails = JSON.parse(localStorage.getItem('demo3_bank_inbox') || '[]');
        const newEmails = this.generatedEmails.map(email => ({
            ...email,
            receivedAt: new Date().toISOString(),
            read: false,
            riskLevel: email.riskScore > 70 ? 'high' : email.riskScore > 40 ? 'medium' : 'low'
        }));
        
        localStorage.setItem('demo3_bank_inbox', JSON.stringify([...existingEmails, ...newEmails]));
        
        // Trigger event for bank admin dashboard to refresh
        window.dispatchEvent(new CustomEvent('newEmailsReceived', { detail: newEmails }));
    }

    displayResults() {
        const resultsPanel = document.getElementById('resultsPanel');
        const resultsDiv = document.getElementById('campaignResults');
        const resultsTable = document.getElementById('campaignResultsTable');
        
        resultsPanel.style.display = 'block';
        
        // Populate results table
        resultsTable.innerHTML = this.generatedEmails.map(email => {
            const time = new Date(email.timestamp).toLocaleTimeString();
            const riskColor = email.riskScore > 70 ? '#ff4444' : email.riskScore > 40 ? '#ff8800' : '#00aa44';
            return `
                <tr>
                    <td><strong style="color: #ff4444;">${email.targetPersona.name}</strong><br><small style="color: #666;">${email.targetPersona.company}</small></td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${email.subject}</td>
                    <td><span style="color: ${riskColor}; font-weight: bold;">${email.riskScore}</span>/100</td>
                    <td><span class="status-badge status-active">Deployed</span></td>
                    <td style="color: #888; font-size: 12px;">${time}</td>
                </tr>
            `;
        }).join('');
        
        // Detailed results view
        resultsDiv.innerHTML = `
            <div style="margin-top: 20px;">
                <h4 style="color: #ff6b6b; margin-bottom: 15px;"><i class="fas fa-list"></i> Email Details</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                    ${this.generatedEmails.map(email => `
                        <div class="email-result">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <strong style="color: #ff4444;">Target: ${email.targetPersona.name}</strong>
                                <span style="background: ${email.riskScore > 70 ? '#ff4444' : email.riskScore > 40 ? '#ff8800' : '#00aa44'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                    Risk: ${email.riskScore}
                                </span>
                            </div>
                            <div style="color: #aaa; font-size: 14px; margin-bottom: 10px;">
                                <strong>From:</strong> ${email.senderEmail}<br>
                                <strong>Subject:</strong> ${email.subject}<br>
                                <strong>Model:</strong> ${email.model.split('/').pop()}<br>
                                <strong>Level:</strong> ${email.attackLevel}
                            </div>
                            <div style="color: #888; font-size: 12px; max-height: 100px; overflow-y: auto; white-space: pre-wrap;">
                                ${email.content.substring(0, 200)}...
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #0f1529; border-radius: 8px; border-left: 4px solid #00ff88;">
                <p style="color: #00ff88; margin: 0;">
                    <i class="fas fa-check-circle"></i> <strong>Deployment Complete:</strong> ${this.generatedEmails.length} emails generated and delivered to Bank Admin inbox. 
                    Switch to Bank Admin Dashboard to view them.
                </p>
            </div>
        `;
    }
}

// Initialize hacker dashboard
let hackerDashboard;
document.addEventListener('DOMContentLoaded', () => {
    hackerDashboard = new HackerDashboard();
    
    // Global functions for onclick handlers
    window.createCampaign = () => hackerDashboard.createCampaign();
    window.executeAttack = () => hackerDashboard.executeAttack();
});
