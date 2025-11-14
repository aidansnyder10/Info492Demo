#!/bin/bash
# Simple script to sync files to UW server
# Usage: ./sync-server.sh

NETID="aidan10"
SERVER="is-info492.ischool.uw.edu"
TEAM_DIR="~/teams/team2"

echo "📤 Syncing files to server..."

# Use scp to copy files (excluding node_modules, .git, etc.)
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude '*.log' \
           --exclude '.DS_Store' \
           --exclude '.vercel' \
           --exclude 'bank-inbox.json' \
           --exclude 'agent-metrics.json' \
           --exclude 'agent.log' \
           --exclude 'evaluation-metrics.json' \
           --exclude 'daily-report.json' \
           ./ ${NETID}@${SERVER}:${TEAM_DIR}/

echo ""
echo "✅ Files synced!"
echo ""
echo "📋 Now SSH in and restart services:"
echo "   ssh ${NETID}@${SERVER}"
echo "   cd ~/teams/team2"
echo "   npm install  # if needed"
echo "   pm2 restart all"

