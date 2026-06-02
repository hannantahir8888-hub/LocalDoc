export function chunkText(text, maxTokens = 2000) {
  if (!text || text.trim() === '') return [''];

  const maxChars = maxTokens * 4;
  const overlapChars = Math.min(100 * 4, Math.floor(maxChars / 4));
  const chunks = [];

  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds the limit
    if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Calculate overlap from the end of the current chunk
      let overlapText = '';
      if (currentChunk.length > overlapChars) {
        // Try to find a sentence boundary within the overlap region
        const overlapRegion = currentChunk.substring(currentChunk.length - overlapChars);
        const sentenceMatch = overlapRegion.match(/[.!?]\s+(.*)$/);
        
        if (sentenceMatch) {
          overlapText = sentenceMatch[1];
        } else {
          // If no sentence boundary found, just take the overlap region
          overlapText = overlapRegion;
        }
      } else {
        overlapText = currentChunk;
      }
      
      currentChunk = overlapText + (overlapText ? ' ' : '') + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }

    // If a single paragraph is longer than maxChars, we need to split it by sentences
    while (currentChunk.length > maxChars) {
      // Find a sentence boundary near the maxChars limit
      let splitIndex = currentChunk.lastIndexOf('. ', maxChars);
      if (splitIndex === -1) splitIndex = currentChunk.lastIndexOf('? ', maxChars);
      if (splitIndex === -1) splitIndex = currentChunk.lastIndexOf('! ', maxChars);
      
      // If no sentence boundary, fallback to a space
      if (splitIndex <= 0 || splitIndex < maxChars / 2) {
         splitIndex = currentChunk.lastIndexOf(' ', maxChars);
      }
      
      // If still no space, just hard break
      if (splitIndex <= 0) splitIndex = maxChars;
      else splitIndex += 1; // Include the punctuation/space

      chunks.push(currentChunk.substring(0, splitIndex).trim());
      
      const remainingText = currentChunk.substring(splitIndex).trim();
      if (!remainingText || remainingText.length >= currentChunk.length) {
        break; // Prevent infinite loop if we couldn't split
      }
      
      // Setup overlap for the next part of the long paragraph
      let overlapText = '';
      const recentText = currentChunk.substring(0, splitIndex);
      if (recentText.length > overlapChars) {
        const overlapRegion = recentText.substring(recentText.length - overlapChars);
        const sentenceMatch = overlapRegion.match(/[.!?]\s+(.*)$/);
        if (sentenceMatch) {
          overlapText = sentenceMatch[1];
        } else {
          overlapText = overlapRegion;
        }
      } else {
        overlapText = recentText;
      }
      
      currentChunk = overlapText + (overlapText ? ' ' : '') + remainingText;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // Ensure chunks are unique and not just empty due to trailing newlines
  return chunks.length > 0 ? chunks : [''];
}
