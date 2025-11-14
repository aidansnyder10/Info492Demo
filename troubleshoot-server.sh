#!/bin/bash
# Troubleshooting script - run on the server

echo "🔍 Troubleshooting server connection..."
echo ""

# Check if port is listening
echo "1️⃣ Checking if port 8002 is listening:"
ss -tlnp | grep 8002
if [ $? -ne 0 ]; then
    echo "❌ Port 8002 is NOT listening!"
else
    echo "✅ Port 8002 is listening"
fi
echo ""

# Check recent logs for errors
echo "2️⃣ Checking industry server logs (last 20 lines):"
pm2 logs industry --lines 20 --nostream
echo ""

# Test local connection
echo "3️⃣ Testing local connection:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8002/demo3.html
echo ""

# Check if server is bound to 0.0.0.0
echo "4️⃣ Checking what interface the server is bound to:"
ss -tlnp | grep 8002 | grep -E "0.0.0.0|127.0.0.1"
echo ""

# Check for any errors in logs
echo "5️⃣ Checking for errors in logs:"
pm2 logs industry --lines 50 --nostream | grep -i "error\|missing\|failed" | tail -5
echo ""

echo "✅ Troubleshooting complete!"

