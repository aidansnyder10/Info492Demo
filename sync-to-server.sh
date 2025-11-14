#!/bin/bash
# Instructions for syncing to UW server
# Run these commands AFTER you SSH into the server

echo "📋 To sync your code to the UW server, SSH in and run:"
echo ""
echo "   ssh aidan10@is-info492.ischool.uw.edu"
echo "   cd ~/teams/team2"
echo ""
echo "   # If you cloned the repo on the server:"
echo "   git pull origin main"
echo ""
echo "   # OR if you need to clone it first:"
echo "   git clone https://github.com/aidansnyder10/Info492Demo.git ."
echo ""
echo "   # Then install dependencies:"
echo "   npm install"
echo ""
echo "   # Make sure PM2 is running your services:"
echo "   pm2 status"
echo "   pm2 restart all"
echo ""

