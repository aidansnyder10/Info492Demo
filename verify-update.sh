#!/bin/bash
# Script to verify code is up to date across local, GitHub, and server

echo "🔍 Verifying code synchronization..."
echo ""

# Check local vs GitHub
echo "📦 LOCAL vs GITHUB:"
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ Local is up to date with GitHub"
    echo "   Commit: ${LOCAL_COMMIT:0:7}"
else
    echo "❌ Local is NOT up to date with GitHub"
    echo "   Local:  ${LOCAL_COMMIT:0:7}"
    echo "   Remote: ${REMOTE_COMMIT:0:7}"
fi

echo ""
echo "🖥️  SERVER CHECK:"
echo "   Run these commands on the UW server:"
echo ""
echo "   ssh aidan10@is-info492.ischool.uw.edu"
echo "   cd ~/teams/team2"
echo ""
echo "   # If using git:"
echo "   git log --oneline -1"
echo "   # Should show: c13c585 Update package-lock.json..."
echo ""
echo "   # Or check file modification dates:"
echo "   ls -lht local-server.js autonomous-agent.js | head -2"
echo ""
echo "   # Check if key files exist:"
echo "   ls -la autonomous-agent.js local-server.js package.json"

