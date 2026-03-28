// Clean Grok Proxy for SineSpace - March 2026
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Main endpoint
app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).send("No question received");
    }

    try {
        const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "grok-4",
                messages: [{ role: "user", content: question }],
                max_tokens: 350,
                temperature: 0.75
            })
        });

        if (!grokRes.ok) {
            throw new Error(`Grok API error: ${grokRes.status}`);
        }

        const data = await grokRes.json();
        const reply = data.choices?.[0]?.message?.content?.trim() 
                     || "Sorry, I couldn't think of anything funny right now.";

        res.send(reply);        // Send plain text back to Eve

    } catch (err) {
        console.error("Proxy Error:", err.message);
        res.status(500).send("Proxy had an error. Check Vercel logs.");
    }
});

// Health check for debugging
app.get('/', (req, res) => {
    res.send("Grok proxy is running");
});

module.exports = app;