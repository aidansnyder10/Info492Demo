// Metrics Collection Script
// Collects and analyzes metrics from the autonomous agent and industry system

const fs = require('fs');
const path = require('path');

const METRICS_DIR = './metrics';
const AGENT_METRICS_FILE = './agent-metrics.json';
const INDUSTRY_METRICS_FILE = './evaluation-metrics.json';
const COLLECTED_METRICS_FILE = path.join(METRICS_DIR, 'collected-metrics.json');

// Ensure metrics directory exists
if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
}

function loadJSONFile(filePath, defaultValue = null) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
    return defaultValue;
}

function collectMetrics() {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    
    // Load agent metrics
    const agentMetrics = loadJSONFile(AGENT_METRICS_FILE, {
        totalCycles: 0,
        totalEmailsGenerated: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        startTime: timestamp,
        cyclesByDay: {},
        performanceHistory: []
    });

    // Load industry metrics
    const industryMetrics = loadJSONFile(INDUSTRY_METRICS_FILE, {
        totalSent: 0,
        detected: 0,
        bypassed: 0,
        detectionRate: 0,
        bypassRate: 0,
        timestamp: timestamp
    });

    // Calculate daily statistics
    const todayStats = agentMetrics.cyclesByDay[date] || {
        cycles: 0,
        emails: 0,
        successes: 0,
        failures: 0
    };

    // Calculate uptime
    const startTime = new Date(agentMetrics.startTime);
    const uptime = Date.now() - startTime.getTime();
    const uptimeDays = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const uptimeHours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Calculate performance trends
    const recentPerformance = agentMetrics.performanceHistory.slice(-10);
    const avgCycleDuration = recentPerformance.length > 0
        ? recentPerformance.reduce((sum, p) => sum + (p.cycleDuration || 0), 0) / recentPerformance.length
        : 0;

    const successRate = agentMetrics.totalEmailsGenerated > 0
        ? (agentMetrics.successfulGenerations / (agentMetrics.successfulGenerations + agentMetrics.failedGenerations) * 100)
        : 0;

    // Create collected metrics entry
    const collectedMetrics = {
        timestamp,
        date,
        agent: {
            totalCycles: agentMetrics.totalCycles,
            totalEmailsGenerated: agentMetrics.totalEmailsGenerated,
            successfulGenerations: agentMetrics.successfulGenerations,
            failedGenerations: agentMetrics.failedGenerations,
            successRate: successRate.toFixed(2),
            uptime: {
                days: uptimeDays,
                hours: uptimeHours,
                totalMs: uptime
            },
            today: todayStats,
            avgCycleDuration: Math.round(avgCycleDuration)
        },
        industry: {
            totalEmails: industryMetrics.totalSent || 0,
            detected: industryMetrics.detected || 0,
            bypassed: industryMetrics.bypassed || 0,
            detectionRate: industryMetrics.detectionRate || 0,
            bypassRate: industryMetrics.bypassRate || 0
        },
        effectiveness: {
            attackSuccessRate: industryMetrics.bypassRate || 0,
            detectionRate: industryMetrics.detectionRate || 0,
            emailsPerCycle: agentMetrics.totalCycles > 0
                ? (agentMetrics.totalEmailsGenerated / agentMetrics.totalCycles).toFixed(2)
                : 0
        }
    };

    // Load existing collected metrics
    let allMetrics = [];
    try {
        if (fs.existsSync(COLLECTED_METRICS_FILE)) {
            const data = fs.readFileSync(COLLECTED_METRICS_FILE, 'utf8');
            allMetrics = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading collected metrics:', error);
    }

    // Add new entry
    allMetrics.push(collectedMetrics);

    // Keep only last 10000 entries
    if (allMetrics.length > 10000) {
        allMetrics = allMetrics.slice(-10000);
    }

    // Save collected metrics
    fs.writeFileSync(COLLECTED_METRICS_FILE, JSON.stringify(allMetrics, null, 2));

    // Generate daily summary
    generateDailySummary(date, collectedMetrics, allMetrics);

    return collectedMetrics;
}

function generateDailySummary(date, currentMetrics, allMetrics) {
    // Filter metrics for today
    const todayMetrics = allMetrics.filter(m => m.date === date);
    
    if (todayMetrics.length === 0) return;

    // Calculate daily totals
    const dailySummary = {
        date,
        generated: {
            totalCycles: currentMetrics.agent.totalCycles,
            totalEmails: currentMetrics.agent.totalEmailsGenerated,
            successRate: currentMetrics.agent.successRate
        },
        industry: {
            totalEmails: currentMetrics.industry.totalEmails,
            detected: currentMetrics.industry.detected,
            bypassed: currentMetrics.industry.bypassed,
            detectionRate: currentMetrics.industry.detectionRate,
            bypassRate: currentMetrics.industry.bypassRate
        },
        uptime: currentMetrics.agent.uptime,
        samples: todayMetrics.length
    };

    // Save daily summary
    const dailySummaryFile = path.join(METRICS_DIR, `daily-${date}.json`);
    fs.writeFileSync(dailySummaryFile, JSON.stringify(dailySummary, null, 2));

    console.log(`📊 Daily summary for ${date}:`);
    console.log(`   Cycles: ${dailySummary.generated.totalCycles}`);
    console.log(`   Emails Generated: ${dailySummary.generated.totalEmails}`);
    console.log(`   Detection Rate: ${dailySummary.industry.detectionRate.toFixed(2)}%`);
    console.log(`   Bypass Rate: ${dailySummary.industry.bypassRate.toFixed(2)}%`);
    console.log(`   Uptime: ${dailySummary.uptime.days}d ${dailySummary.uptime.hours}h`);
}

function generatePerformanceReport() {
    const allMetrics = loadJSONFile(COLLECTED_METRICS_FILE, []);
    
    if (allMetrics.length === 0) {
        console.log('No metrics collected yet');
        return;
    }

    // Group by date
    const byDate = {};
    allMetrics.forEach(m => {
        if (!byDate[m.date]) {
            byDate[m.date] = [];
        }
        byDate[m.date].push(m);
    });

    // Calculate daily averages
    const dailyAverages = Object.keys(byDate).map(date => {
        const dayMetrics = byDate[date];
        const lastMetric = dayMetrics[dayMetrics.length - 1];
        
        return {
            date,
            cycles: lastMetric.agent.totalCycles,
            emailsGenerated: lastMetric.agent.totalEmailsGenerated,
            detectionRate: lastMetric.industry.detectionRate,
            bypassRate: lastMetric.industry.bypassRate,
            uptime: lastMetric.agent.uptime
        };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate improvement trends
    if (dailyAverages.length >= 2) {
        const firstDay = dailyAverages[0];
        const lastDay = dailyAverages[dailyAverages.length - 1];
        
        const improvement = {
            detectionRateChange: lastDay.detectionRate - firstDay.detectionRate,
            bypassRateChange: lastDay.bypassRate - firstDay.bypassRate,
            cyclesIncrease: lastDay.cycles - firstDay.cycles,
            emailsIncrease: lastDay.emailsGenerated - firstDay.emailsGenerated
        };

        console.log('\n📈 Performance Trends:');
        console.log(`   Detection Rate: ${firstDay.detectionRate.toFixed(2)}% → ${lastDay.detectionRate.toFixed(2)}% (${improvement.detectionRateChange >= 0 ? '+' : ''}${improvement.detectionRateChange.toFixed(2)}%)`);
        console.log(`   Bypass Rate: ${firstDay.bypassRate.toFixed(2)}% → ${lastDay.bypassRate.toFixed(2)}% (${improvement.bypassRateChange >= 0 ? '+' : ''}${improvement.bypassRateChange.toFixed(2)}%)`);
        console.log(`   Total Cycles: ${firstDay.cycles} → ${lastDay.cycles} (+${improvement.cyclesIncrease})`);
        console.log(`   Total Emails: ${firstDay.emailsGenerated} → ${lastDay.emailsGenerated} (+${improvement.emailsIncrease})`);
    }

    // Save report
    const report = {
        generated: new Date().toISOString(),
        dailyAverages,
        summary: {
            totalDays: dailyAverages.length,
            totalCycles: dailyAverages.reduce((sum, d) => sum + d.cycles, 0),
            totalEmails: dailyAverages.reduce((sum, d) => sum + d.emailsGenerated, 0),
            avgDetectionRate: dailyAverages.reduce((sum, d) => sum + d.detectionRate, 0) / dailyAverages.length,
            avgBypassRate: dailyAverages.reduce((sum, d) => sum + d.bypassRate, 0) / dailyAverages.length
        }
    };

    const reportFile = path.join(METRICS_DIR, 'performance-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return report;
}

// Run collection
if (require.main === module) {
    console.log('📊 Collecting metrics...');
    const metrics = collectMetrics();
    console.log('✅ Metrics collected');
    
    // Generate report if requested
    if (process.argv.includes('--report')) {
        console.log('\n📈 Generating performance report...');
        generatePerformanceReport();
        console.log('✅ Report generated');
    }
}

module.exports = { collectMetrics, generatePerformanceReport };

