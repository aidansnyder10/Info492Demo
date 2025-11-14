#!/bin/bash
# Deployment script for Info492 Demo
# Usage: ./deploy.sh <your_netid> <team_number>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./deploy.sh <your_netid> <team_number>"
    echo "Example: ./deploy.sh aidan10 2"
    exit 1
fi

NETID=$1
TEAM=$2
PORT=$((8000 + $TEAM))
SERVER="is-info492.ischool.uw.edu"
TEAM_DIR="~/teams/team$TEAM"

echo "🚀 Deploying to Team $TEAM (Port $PORT)"
echo "📤 Uploading files to server..."

# Upload files (excluding node_modules, .git, etc.)
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude '*.log' \
           --exclude '.DS_Store' \
           --exclude 'deploy.sh' \
           ./ ${NETID}@${SERVER}:${TEAM_DIR}/

echo ""
echo "✅ Files uploaded!"
echo ""
echo "📋 Next steps (run these on the server):"
echo "   ssh ${NETID}@${SERVER}"
echo "   cd ~/teams/team${TEAM}"
echo "   npm install"
echo "   PORT=${PORT} node local-server.js"
echo ""
echo "🌐 Your demo will be available at:"
echo "   http://${SERVER}:${PORT}/demo3.html"


