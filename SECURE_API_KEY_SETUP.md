# Secure API Key Setup

## ⚠️ IMPORTANT: Never commit your API key to git!

## Setup Instructions

### 1. Create a `.env` file (local development)

Create a file named `.env` in the project root:

```bash
OPENROUTER_API_KEY=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
PORT=3000
```

**The `.env` file is already in `.gitignore` and will NOT be committed to git.**

### 2. On the UW Server

**Option A: Use environment variables directly (recommended for PM2)**

```bash
export OPENROUTER_API_KEY=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
pm2 delete all
PORT=3000 OPENROUTER_API_KEY=$OPENROUTER_API_KEY pm2 start local-server.js --name "industry"
OPENROUTER_API_KEY=$OPENROUTER_API_KEY pm2 start autonomous-agent.js --name "agent"
pm2 save
```

**Option B: Create a `.env` file on the server**

```bash
cd ~/teams/team2
echo "OPENROUTER_API_KEY=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" > .env
echo "PORT=3000" >> .env
chmod 600 .env  # Make it readable only by you
npm install  # Install dotenv if not already installed
pm2 restart all
```

### 3. Verify it's working

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs industry --lines 10
```

## Security Notes

- ✅ `.env` is in `.gitignore` - it will never be committed
- ✅ API key is only loaded from environment variables
- ✅ Never share your API key in chat, code, or documentation
- ✅ If your key is exposed, create a new one immediately

