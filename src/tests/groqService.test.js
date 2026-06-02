import { groqService, GroqAPIError } from '../services/groqService';
import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn();

describe('GroqService', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Simulate setting API key
    groqService.apiKey = 'test-key';
  });

  it('ask() returns a string on successful mock response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Mocked response' } }]
      })
    });

    const response = await groqService.ask('question', 'context');
    expect(response).toBe('Mocked response');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('ask() throws GroqAPIError when API returns 401', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({})
    });

    await expect(groqService.ask('question', 'context'))
      .rejects.toThrow(GroqAPIError);
    await expect(groqService.ask('question', 'context'))
      .rejects.toThrow('Invalid API key');
  });

  it('summarize() includes expected prompt structure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Summary' } }]
      })
    });

    await groqService.summarize('Long document text');
    
    const fetchCallArgs = fetch.mock.calls[0][1];
    const body = JSON.parse(fetchCallArgs.body);
    expect(body.messages[0].content).toContain('Summarize');
  });
});
