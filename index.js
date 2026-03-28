// index.js - Fixed for Render.com
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
                model: "grok-4",
                messages: [{ role: "user", content: question }],
                max_tokens: 350,
                temperature: 0.7
            })
        });

        if (!grokResponse.ok) {
            throw new Error(`Grok API error: ${grokResponse.status}`);
        }

        const data = await grokResponse.json();
        const reply = data.choices?.[0]?.message?.content?.trim() 
                     || "Sorry, I couldn't think of a reply right now.";

        res.send(reply);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).send("Proxy had an error");
    }
});

// THIS IS THE IMPORTANT PART FOR RENDER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Grok proxy is running on port ${port}`);
});

module.exports = app;