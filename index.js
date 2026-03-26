const express = require('express');

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).send('No question provided');
    }

    if (!process.env.GROK_API_KEY) {
      console.error('GROK_API_KEY environment variable is missing');
      return res.status(500).send('Proxy configuration error: API key not set');
    }

    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
      //  model: 'grok-4.20-0309-non-reasoning',   // Current stable model as of March 2026
        messages: [{ role: 'user', content: question }],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error(`Grok API error ${grokResponse.status}: ${errorText}`);
      return res.status(502).send(`Grok API returned ${grokResponse.status}`);
    }

    const data = await grokResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim() 
      || 'Sorry, I received no reply from Grok.';

    res.send(reply);

  } catch (err) {
    console.error('Proxy crashed:', err.message);
    res.status(500).send('Proxy internal error. Check Vercel logs for details.');
  }
});

module.exports = app;