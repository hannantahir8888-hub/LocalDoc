export class GroqAPIError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'GroqAPIError';
    this.status = status;
  }
}

class GroqService {
  constructor() {
    this.apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY : process?.env?.VITE_GROQ_API_KEY;
    this.model = 'llama-3.3-70b-versatile';
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async ask(question, context) {
    const systemPrompt = `You are a helpful assistant that answers questions
about documents. Answer based only on the provided document context.
If the answer is not in the document, say so clearly.
Be concise and specific.`;

    const userPrompt = `Document context:
${context}

Question: ${question}

Answer:`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return this._callAPI(messages);
  }

  async summarize(text) {
    const userPrompt = `Summarize the following document in 5-7 bullet points.
Focus on the main ideas, key facts, and important conclusions.

Document:
${text.substring(0, 8000)}

Summary:`;

    const messages = [
      { role: 'user', content: userPrompt }
    ];

    return this._callAPI(messages);
  }

  async _callAPI(messages, retries = 1) {
    if (!this.apiKey) {
      throw new GroqAPIError(401, 'Invalid API key. Check your .env file.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 1024,
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new GroqAPIError(401, 'Invalid API key. Check your .env file.');
        }
        if (response.status === 429) {
          if (retries > 0) {
            await this._handleRateLimit();
            return this._callAPI(messages, retries - 1);
          }
          throw new GroqAPIError(429, 'Rate limit hit. Please try again later.');
        }
        if (response.status >= 500) {
           throw new GroqAPIError(500, 'Groq service is temporarily unavailable. Try again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new GroqAPIError(response.status, errorData.error?.message || 'Unknown API error');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new GroqAPIError(408, 'Request timed out. Check your internet connection.');
      }
      if (error instanceof GroqAPIError) {
        throw error;
      }
      throw new GroqAPIError(500, error.message || 'Failed to communicate with Groq API');
    }
  }

  async _handleRateLimit() {
    console.warn('Rate limit hit. Retrying in 5 seconds...');
    return new Promise(resolve => setTimeout(resolve, 5000));
  }
}

export const groqService = new GroqService();
