#!/bin/bash
# Fix port 3000 conflict

echo "🔍 Finding what's using port 3000..."
ss -tlnp | grep 3000

echo ""
echo "🔍 Finding process ID..."
lsof -ti:3000 || fuser 3000/tcp 2>/dev/null || echo "Could not find process"

echo ""
echo "📋 To fix, run on server:"
echo "   # Find and kill process on port 3000"
echo "   kill -9 \$(lsof -ti:3000) 2>/dev/null || fuser -k 3000/tcp"
echo ""
echo "   # Or find the PID manually:"
echo "   ss -tlnp | grep 3000"
echo "   kill -9 <PID>"
echo ""
echo "   # Then restart PM2"
echo "   export OPENROUTER_API_KEY=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"
echo "   pm2 delete industry"
echo "   PORT=3000 OPENROUTER_API_KEY=\$OPENROUTER_API_KEY pm2 start local-server.js --name \"industry\""
echo "   pm2 save"

