// index.js - Fixed for plain text response
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.send("No question provided");
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

        const data = await grokResponse.json();
        const reply = data.choices?.[0]?.message?.content?.trim() 
                     || "Sorry, I couldn't generate a reply.";

        res.send(reply);   // ← Plain text, no JSON

    } catch (error) {
        console.error(error);
        res.send("Sorry, I had an error.");
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Grok proxy running on port ${port}`);
});

module.exports = app;