#!/bin/bash
# Script to check server status - run this ON THE SERVER

echo "🔍 Checking server status..."
echo ""

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status
echo ""

# Check if port is listening
echo "🔌 Port 8002 Status:"
ss -tlnp | grep 8002 || echo "❌ Port 8002 is NOT listening"
echo ""

# Check if processes are running
echo "🔄 Node Processes:"
ps aux | grep -E "node.*local-server|node.*autonomous-agent" | grep -v grep || echo "❌ No node processes found"
echo ""

# Test local connection
echo "🌐 Testing local connection:"
curl -s http://localhost:8002/demo3.html | head -5 || echo "❌ Cannot connect to localhost:8002"
echo ""

# Check logs
echo "📋 Recent PM2 Logs (industry):"
pm2 logs industry --lines 5 --nostream 2>/dev/null || echo "❌ No logs found"
echo ""

echo "📋 Recent PM2 Logs (agent):"
pm2 logs agent --lines 5 --nostream 2>/dev/null || echo "❌ No logs found"

