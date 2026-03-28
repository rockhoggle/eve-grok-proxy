// index.js - Clean Grok Proxy for SineSpace
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).send("No question provided");
        }

        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "grok-4",           // or grok-beta if you prefer
                messages: [{ role: "user", content: question }],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        const data = await grokResponse.json();
        const reply = data.choices?.[0]?.message?.content?.trim() 
                     || "Sorry, I couldn't generate a reply.";

        res.send(reply);   // Send plain text back to SineSpace

    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).send("Proxy error - check Vercel logs");
    }
});

// For Vercel serverless
module.exports = app;