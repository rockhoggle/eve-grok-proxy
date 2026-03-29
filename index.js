// index.js - Force Plain Text Response for SineSpace
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    console.log("Received request from SineSpace");

    try {
        const { question } = req.body;

        if (!question) {
            console.log("No question provided");
            return res.send("No question provided");
        }

        console.log("Calling Grok with question:", question);

        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "grok-4",
                messages: [{ role: "user", content: question }],
                max_tokens: 400,
                temperature: 0.7
            })
        });

        const data = await grokResponse.json();
        const reply = data.choices?.[0]?.message?.content?.trim() 
                     || "Sorry, I couldn't generate a reply.";

        console.log("Grok reply:", reply);

        // Force plain text response
        res.set('Content-Type', 'text/plain');
        res.send(reply);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.set('Content-Type', 'text/plain');
        res.send("Sorry, I had an error processing your request.");
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Grok proxy is running on port ${port}`);
});

module.exports = app;