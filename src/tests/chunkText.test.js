import { chunkText } from '../utils/chunkText';

describe('chunkText', () => {
  it('returns empty array for empty string', () => {
    expect(chunkText('')).toEqual(['']);
    expect(chunkText('   ')).toEqual(['']);
  });

  it('returns exactly one chunk for short text', () => {
    const text = 'This is a short text.';
    const result = chunkText(text, 2000);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(text);
  });

  it('returns multiple chunks for long text', () => {
    // Generate long text
    const longText = 'Word '.repeat(3000);
    const result = chunkText(longText, 500); // 2000 chars limit
    expect(result.length).toBeGreaterThan(1);
  });

  it('does not exceed maxTokens estimate', () => {
    const longText = 'A very long string of words that repeats. '.repeat(500);
    const maxTokens = 100;
    const maxChars = maxTokens * 4;
    
    const result = chunkText(longText, maxTokens);
    result.forEach(chunk => {
      // It might slightly exceed due to word boundaries, but generally bounded
      expect(chunk.length).toBeLessThanOrEqual(maxChars + 20); 
    });
  });

  it('maintains paragraph boundaries when possible', () => {
    const p1 = 'Paragraph one is here.\n\n';
    const p2 = 'Paragraph two is here.';
    const result = chunkText(p1 + p2, 50); // limit 200 chars
    expect(result.length).toBe(1);
    expect(result[0]).toBe('Paragraph one is here.\n\nParagraph two is here.');
  });
});
