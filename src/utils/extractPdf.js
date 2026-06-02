import * as pdfjsLib from 'pdfjs-dist';

// Setting worker path for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export class ExtractError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExtractError';
  }
}

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      text: fullText.trim(),
      pageCount: pageCount,
      fileName: file.name
    };
  } catch (error) {
    if (error.name === 'PasswordException') {
      throw new ExtractError('This PDF is password protected and cannot be read.');
    }
    throw new ExtractError('Failed to extract text from the PDF. The file may be corrupted.');
  }
}
