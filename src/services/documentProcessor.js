import { extractTextFromPDF } from '../utils/extractPdf';
import { chunkText } from '../utils/chunkText';
import { findRelevantChunks } from '../utils/findRelevantChunks';

class DocumentProcessor {
  /**
   * Processes a file and returns its text and chunks
   */
  async processFile(file) {
    if (!file) throw new Error("No file provided.");

    const fileType = file.type;
    const fileName = file.name;

    let text = '';
    let pageCount = 1;

    if (fileType === 'application/pdf') {
      const result = await extractTextFromPDF(file);
      text = result.text;
      pageCount = result.pageCount;
    } else if (fileType === 'text/plain') {
      text = await file.text();
    } else {
      throw new Error('Only PDF and TXT files are supported.');
    }

    if (!text || text.trim() === '') {
      throw new Error('No text could be extracted from this file.');
    }

    const chunks = chunkText(text);

    return { text, chunks, fileName, pageCount };
  }

  /**
   * Finds the best context for a given question
   */
  getRelevantContext(question, chunks, topN = 3) {
    return findRelevantChunks(question, chunks, topN);
  }
}

export const documentProcessor = new DocumentProcessor();
