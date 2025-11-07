/**
 * Phishing Risk Scorer
 * Based on patterns from Seven Phishing Email Datasets
 * https://figshare.com/articles/dataset/Seven_Phishing_Email_Datasets/25432108
 * 
 * This module implements risk scoring based on features commonly found in phishing emails:
 * - Subject line analysis
 * - Body content analysis
 * - URL/link analysis
 * - Sender analysis
 * - Urgency indicators
 * - Social engineering tactics
 */

class PhishingRiskScorer {
    constructor() {
        // High-risk keywords based on phishing email datasets
        this.highRiskKeywords = {
            urgent: ['urgent', 'immediate', 'critical', 'asap', 'action required', 'verify now', 'confirm immediately'],
            credentials: ['password', 'credentials', 'login', 'account', 'verify account', 'update account', 'suspended', 'locked'],
            financial: ['payment', 'invoice', 'refund', 'transaction', 'wire transfer', 'unauthorized charge', 'billing'],
            security: ['security breach', 'unauthorized access', 'suspicious activity', 'fraud detected', 'verify identity'],
            threats: ['account closed', 'terminate', 'expire', 'delete', 'permanent', 'legal action'],
            callsToAction: ['click here', 'verify', 'confirm', 'update', 'reactivate', 'restore', 'unlock']
        };

        // Suspicious URL patterns
        this.suspiciousUrlPatterns = [
            /bit\.ly|tinyurl|t\.co|goo\.gl|short\.link/i,  // URL shorteners
            /http[^s]/i,  // Non-HTTPS links
            /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,  // IP addresses
            /[a-z0-9]+-[a-z0-9]+\.(com|net|org)/i  // Suspicious domain patterns
        ];

        // Suspicious sender patterns
        this.suspiciousSenderPatterns = [
            /noreply|no-reply|donotreply/i,
            /support[0-9]|security[0-9]|admin[0-9]/i,
            /[a-z]+[0-9]+@/i,  // Alphanumeric sender names
            /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i  // Generic email patterns
        ];

        // Professional indicators (reduce risk)
        this.professionalIndicators = [
            'please', 'thank you', 'sincerely', 'best regards', 'regards',
            'company name', 'contact us', 'customer service'
        ];

        // Social engineering tactics
        this.socialEngineeringTactics = {
            authority: ['bank', 'irs', 'fbi', 'government', 'court', 'legal', 'police'],
            scarcity: ['limited time', 'expires soon', 'last chance', 'only today'],
            reciprocity: ['free', 'bonus', 'reward', 'prize', 'winner'],
            consistency: ['your account', 'your profile', 'your information', 'we noticed']
        };
    }

    /**
     * Calculate risk score for an email based on phishing indicators
     * @param {Object} emailData - Email data containing subject, content, sender, etc.
     * @param {Object} options - Optional parameters (senderEmail, urls, etc.)
     * @returns {number} Risk score from 0-100
     */
    calculateRiskScore(emailData, options = {}) {
        let score = 50; // Base score
        const subject = (emailData.subject || '').toLowerCase();
        const content = (emailData.content || '').toLowerCase();
        const sender = (emailData.sender || options.senderEmail || '').toLowerCase();
        const urls = emailData.urls || this.extractUrls(content) || [];

        // Subject line analysis (weight: 25%)
        score += this.analyzeSubject(subject);

        // Body content analysis (weight: 40%)
        score += this.analyzeContent(content);

        // URL/Link analysis (weight: 20%)
        score += this.analyzeUrls(urls, content);

        // Sender analysis (weight: 10%)
        score += this.analyzeSender(sender);

        // Social engineering tactics (weight: 5%)
        score += this.analyzeSocialEngineering(subject + ' ' + content);

        // Professional indicators (reduce risk)
        score -= this.analyzeProfessionalIndicators(content);

        // Urgency analysis
        score += this.analyzeUrgency(subject + ' ' + content);

        // Grammar and spelling (professional emails usually have better grammar)
        score += this.analyzeGrammarAndSpelling(content);

        // Normalize to 0-100 range
        return Math.min(100, Math.max(0, Math.round(score)));
    }

    /**
     * Analyze subject line for phishing indicators
     */
    analyzeSubject(subject) {
        let riskScore = 0;

        // Urgency indicators in subject
        for (const keyword of this.highRiskKeywords.urgent) {
            if (subject.includes(keyword)) {
                riskScore += 15;
                break;
            }
        }

        // Credential-related keywords
        for (const keyword of this.highRiskKeywords.credentials) {
            if (subject.includes(keyword)) {
                riskScore += 12;
                break;
            }
        }

        // Security-related keywords
        for (const keyword of this.highRiskKeywords.security) {
            if (subject.includes(keyword)) {
                riskScore += 10;
                break;
            }
        }

        // All caps in subject (often used in phishing)
        if (subject === subject.toUpperCase() && subject.length > 10) {
            riskScore += 8;
        }

        // Excessive punctuation
        const punctuationCount = (subject.match(/[!?]{2,}/g) || []).length;
        if (punctuationCount > 0) {
            riskScore += 5 * punctuationCount;
        }

        return Math.min(25, riskScore);
    }

    /**
     * Analyze email content for phishing indicators
     */
    analyzeContent(content) {
        let riskScore = 0;

        // Credential requests
        for (const keyword of this.highRiskKeywords.credentials) {
            if (content.includes(keyword)) {
                riskScore += 15;
                break;
            }
        }

        // Financial keywords
        for (const keyword of this.highRiskKeywords.financial) {
            if (content.includes(keyword)) {
                riskScore += 12;
                break;
            }
        }

        // Threat indicators
        for (const keyword of this.highRiskKeywords.threats) {
            if (content.includes(keyword)) {
                riskScore += 10;
                break;
            }
        }

        // Calls to action
        let callToActionCount = 0;
        for (const keyword of this.highRiskKeywords.callsToAction) {
            if (content.includes(keyword)) {
                callToActionCount++;
            }
        }
        if (callToActionCount > 2) {
            riskScore += 12;
        } else if (callToActionCount > 0) {
            riskScore += 8;
        }

        // Excessive urgency in content
        let urgencyCount = 0;
        for (const keyword of this.highRiskKeywords.urgent) {
            const matches = content.match(new RegExp(keyword, 'gi'));
            if (matches) {
                urgencyCount += matches.length;
            }
        }
        if (urgencyCount > 3) {
            riskScore += 10;
        } else if (urgencyCount > 1) {
            riskScore += 5;
        }

        // Suspicious patterns
        if (content.includes('click the link below') || content.includes('click here to')) {
            riskScore += 8;
        }

        if (content.includes('verify your identity') || content.includes('confirm your account')) {
            riskScore += 10;
        }

        return Math.min(40, riskScore);
    }

    /**
     * Analyze URLs for suspicious patterns
     */
    analyzeUrls(urls, content) {
        let riskScore = 0;

        if (urls.length === 0 && content.includes('http')) {
            // URLs might be in content but not extracted
            const urlMatches = content.match(/https?:\/\/[^\s]+/gi) || [];
            urls = urlMatches;
        }

        if (urls.length === 0) {
            return 0; // No URLs to analyze
        }

        // Multiple URLs (suspicious)
        if (urls.length > 2) {
            riskScore += 8;
        }

        // Check each URL for suspicious patterns
        for (const url of urls) {
            // URL shorteners
            for (const pattern of this.suspiciousUrlPatterns) {
                if (pattern.test(url)) {
                    riskScore += 10;
                    break;
                }
            }

            // Non-HTTPS
            if (url.startsWith('http://')) {
                riskScore += 8;
            }

            // IP addresses in URLs
            if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(url)) {
                riskScore += 12;
            }

            // Mismatched domains (e.g., claiming to be from bank but URL is different)
            if (url.includes('bank') || url.includes('secure') || url.includes('verify')) {
                // Check if domain looks suspicious
                const domainMatch = url.match(/https?:\/\/([^\/]+)/i);
                if (domainMatch) {
                    const domain = domainMatch[1].toLowerCase();
                    if (domain.includes('free') || domain.includes('click') || 
                        domain.includes('link') || domain.length < 10) {
                        riskScore += 15;
                    }
                }
            }
        }

        return Math.min(20, riskScore);
    }

    /**
     * Analyze sender email for suspicious patterns
     */
    analyzeSender(sender) {
        let riskScore = 0;

        if (!sender) {
            return 0;
        }

        // Suspicious sender patterns
        for (const pattern of this.suspiciousSenderPatterns) {
            if (pattern.test(sender)) {
                riskScore += 5;
                break;
            }
        }

        // Generic sender addresses
        if (sender.includes('noreply') || sender.includes('no-reply')) {
            riskScore += 3;
        }

        // Suspicious domain patterns
        if (sender.match(/[0-9]{4,}/)) {
            riskScore += 4; // Many numbers in domain
        }

        return Math.min(10, riskScore);
    }

    /**
     * Analyze social engineering tactics
     */
    analyzeSocialEngineering(text) {
        let riskScore = 0;
        const lowerText = text.toLowerCase();

        // Authority impersonation
        for (const keyword of this.socialEngineeringTactics.authority) {
            if (lowerText.includes(keyword)) {
                riskScore += 3;
                break;
            }
        }

        // Scarcity tactics
        for (const keyword of this.socialEngineeringTactics.scarcity) {
            if (lowerText.includes(keyword)) {
                riskScore += 4;
                break;
            }
        }

        // Reciprocity tactics (less common in credential phishing, more in scams)
        const reciprocityCount = this.socialEngineeringTactics.reciprocity.filter(
            keyword => lowerText.includes(keyword)
        ).length;
        if (reciprocityCount > 0) {
            riskScore += 2;
        }

        // Consistency tactics (referring to "your account")
        const consistencyCount = this.socialEngineeringTactics.consistency.filter(
            keyword => lowerText.includes(keyword)
        ).length;
        if (consistencyCount > 2) {
            riskScore += 3;
        }

        return Math.min(5, riskScore);
    }

    /**
     * Analyze professional indicators (reduce risk)
     */
    analyzeProfessionalIndicators(content) {
        let reduction = 0;

        for (const indicator of this.professionalIndicators) {
            if (content.includes(indicator)) {
                reduction += 2;
            }
        }

        // Proper email structure
        if (content.includes('dear') && (content.includes('sincerely') || content.includes('regards'))) {
            reduction += 5;
        }

        // Company information
        if (content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
            reduction += 3; // Phone number present
        }

        return Math.min(15, reduction);
    }

    /**
     * Analyze urgency indicators
     */
    analyzeUrgency(text) {
        let riskScore = 0;
        const lowerText = text.toLowerCase();

        // Count urgency keywords
        let urgencyCount = 0;
        for (const keyword of this.highRiskKeywords.urgent) {
            const matches = lowerText.match(new RegExp(keyword, 'gi'));
            if (matches) {
                urgencyCount += matches.length;
            }
        }

        if (urgencyCount > 4) {
            riskScore += 8;
        } else if (urgencyCount > 2) {
            riskScore += 5;
        } else if (urgencyCount > 0) {
            riskScore += 2;
        }

        // Time pressure indicators
        if (lowerText.includes('within 24 hours') || lowerText.includes('within 48 hours')) {
            riskScore += 5;
        }

        return Math.min(10, riskScore);
    }

    /**
     * Analyze grammar and spelling (poor grammar = higher risk)
     */
    analyzeGrammarAndSpelling(content) {
        let riskScore = 0;

        // Common phishing grammar mistakes
        const grammarMistakes = [
            /youre account/i,
            /your account is been/i,
            /please to click/i,
            /kindly do the needful/i,
            /urgent require/i
        ];

        for (const mistake of grammarMistakes) {
            if (mistake.test(content)) {
                riskScore += 5;
            }
        }

        // Excessive spelling errors (simple heuristic)
        const words = content.split(/\s+/);
        if (words.length > 50) {
            // Check for repeated character patterns (common in spam)
            const repeatedChars = content.match(/(.)\1{3,}/g);
            if (repeatedChars && repeatedChars.length > 2) {
                riskScore += 3;
            }
        }

        return Math.min(8, riskScore);
    }

    /**
     * Extract URLs from text content
     */
    extractUrls(text) {
        if (!text) return [];
        
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
        const matches = text.match(urlRegex) || [];
        return matches;
    }

    /**
     * Get detailed risk breakdown for debugging
     */
    getRiskBreakdown(emailData, options = {}) {
        const subject = (emailData.subject || '').toLowerCase();
        const content = (emailData.content || '').toLowerCase();
        const sender = (emailData.sender || options.senderEmail || '').toLowerCase();
        const urls = emailData.urls || this.extractUrls(content) || [];

        return {
            subject: this.analyzeSubject(subject),
            content: this.analyzeContent(content),
            urls: this.analyzeUrls(urls, content),
            sender: this.analyzeSender(sender),
            socialEngineering: this.analyzeSocialEngineering(subject + ' ' + content),
            professional: -this.analyzeProfessionalIndicators(content),
            urgency: this.analyzeUrgency(subject + ' ' + content),
            grammar: this.analyzeGrammarAndSpelling(content),
            total: this.calculateRiskScore(emailData, options)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhishingRiskScorer;
}

