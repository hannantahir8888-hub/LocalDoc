export function findRelevantChunks(question, chunks, topN = 3) {
  if (!chunks || chunks.length === 0) return '';
  if (chunks.length <= topN) return chunks.join('\n\n');

  // Basic stopwords to ignore
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'where', 'when',
    'who', 'why', 'how', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
    'but', 'it', 'this', 'that', 'these', 'those', 'as', 'by', 'with'
  ]);

  // Extract clean keywords from the question
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // If no keywords found (e.g. "What is the?"), fallback to all chunks
  if (keywords.length === 0) {
    return chunks.slice(0, topN).join('\n\n');
  }

  // Score each chunk
  const scoredChunks = chunks.map(chunk => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    
    // Simple count of keyword occurrences
    for (const keyword of keywords) {
      // Regex to count full word matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = chunkLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    
    return { chunk, score };
  });

  // Sort by score descending
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return top N chunks joined
  return scoredChunks
    .slice(0, topN)
    .map(sc => sc.chunk)
    .join('\n\n');
}
