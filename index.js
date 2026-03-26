const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).send('No question provided');
  }

  try {
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
        // model: 'grok-4-0709',
        // model: 'grok-4.20-0309-non-reasoning',
	// model: 'grok-4.20-non-reasoning',   // Fast and reliable for general chat
        // model: 'grok-4',
        messages: [{ role: 'user', content: question }],
        max_tokens: 400,
        temperature: 0.8
      })
    });

    if (!grokResponse.ok) {
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    const data = await grokResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, no reply received.';

    res.send(reply);
  } catch (err) {
    console.error(err);
    res.status(500).send('Proxy error. Please try again later.');
  }
});

module.exports = app;