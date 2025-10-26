export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, apiKey, model, messages, temperature, max_tokens } = req.body;

    // Validate required fields
    if (!endpoint || !apiKey || !model || !messages) {
      return res.status(400).json({ 
        error: 'Missing required fields: endpoint, apiKey, model, or messages' 
      });
    }

    // Make request to the AI API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature || 0.3,
        max_tokens: max_tokens || 2000,
        stream: false
      })
    });

    // Get the response
    const responseText = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response:', responseText);
      return res.status(502).json({ 
        error: 'Invalid response from AI API',
        details: responseText.substring(0, 200)
      });
    }

    // Check if the API request was successful
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || data.message || 'API request failed',
        status: response.status
      });
    }

    // Return the successful response
    return res.status(200).json(data);

  } catch (error) {
    console.error('Translation API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}