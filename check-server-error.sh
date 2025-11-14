#!/bin/bash
# Check server error logs

echo "📋 Checking industry server logs for errors:"
pm2 logs industry --lines 50 --nostream | tail -30

echo ""
echo "📋 Checking if port 3000 is accessible:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/demo3.html

echo ""
echo "📋 Checking PM2 error details:"
pm2 describe industry | grep -A 10 "error\|status\|restarts"

