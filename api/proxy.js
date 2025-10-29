// Vercel serverless function to proxy Hugging Face API calls
// This bypasses CORS restrictions by making the call from the server

export default async function handler(req, res) {
    // Enable CORS (locked to allowed origin when provided)
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { provider, model, inputs, parameters, token, claudeToken } = req.body;
        
        // Handle Claude API requests
        if (provider === 'claude') {
            if (!claudeToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Claude API token required',
                    message: 'Please add your Claude API token in the token manager.',
                    status: 401
                });
            }

            console.log('Vercel proxy: Handling Claude API request');
            
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': claudeToken,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model || 'claude-3-haiku-20240307',
                    max_tokens: 150,
                    messages: [
                        {
                            role: 'user',
                            content: inputs
                        }
                    ]
                })
            });

            const data = await response.json();
            
            return res.status(response.status).json({
                success: response.ok,
                data: data,
                status: response.status
            });
        }
        
        // Handle OpenRouter API requests
        if (provider === 'openrouter') {
            const openRouterKey = process.env.OPENROUTER_API_KEY;
            if (!openRouterKey) {
                return res.status(500).json({
                    success: false,
                    error: 'Server missing OpenRouter API key',
                    message: 'OPENROUTER_API_KEY is not configured on the server.',
                    status: 500
                });
            }

            const refererHeader = req.headers.origin || process.env.APP_REFERER || 'http://localhost:8000';
            const appTitle = process.env.APP_TITLE || 'AI Phishing Demo';

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': refererHeader,
                    'X-Title': appTitle
                },
                body: JSON.stringify({
                    model: model || 'meta-llama/llama-3.1-8b-instruct',
                    messages: [
                        { role: 'user', content: inputs }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return res.status(response.status).json({
                success: response.ok,
                data,
                response: data.choices?.[0]?.message?.content,
                status: response.status
            });
        }

        // Handle Hugging Face API requests (original logic)
        if (!model || !inputs) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Hugging Face requires authentication for Inference API
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // If no token provided, return helpful error
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Hugging Face Inference API requires a valid token. Please add your Hugging Face token in the token manager.',
                status: 401
            });
            return;
        }
        
        const requestBody = {
            inputs: inputs,
            ...(parameters && { parameters })
        };
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        let data;
        try {
            const responseText = await response.text();
            if (responseText.trim()) {
                data = JSON.parse(responseText);
            } else {
                data = { error: 'Empty response' };
            }
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            data = { 
                error: 'Invalid JSON response',
                rawResponse: await response.text().catch(() => 'Could not read response')
            };
        }
        
        res.status(response.status).json({
            success: response.ok,
            data: data,
            status: response.status
        });
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
