import React, { useState, useEffect } from 'react';
import DropZone from './components/DropZone';
import ChatWindow from './components/ChatWindow';
import SummaryButton from './components/SummaryButton';
import ExportButton from './components/ExportButton';
import { documentProcessor } from './services/documentProcessor';
import { chatManager } from './services/chatManager';
import { groqService } from './services/groqService';
import './App.css';

function App() {
  const [documentInfo, setDocumentInfo] = useState(null); // { text, chunks, fileName, pageCount }
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState('');

  // Sync messages with chatManager on mount
  useEffect(() => {
    setMessages(chatManager.getHistory());
  }, []);

  const handleFileLoad = async (result) => {
    setError(null);
    try {
      // result is { text, pageCount, fileName } from DropZone
      // We process it using documentProcessor to get chunks
      const processed = {
        text: result.text,
        chunks: documentProcessor.getRelevantContext ? result.text : [], // Wait, let's use the processor properly.
      };
      // Let's manually get chunks since DropZone did the extraction
      const { chunkText } = await import('./utils/chunkText');
      const chunks = chunkText(result.text);

      setDocumentInfo({
        text: result.text,
        chunks,
        fileName: result.fileName,
        pageCount: result.pageCount
      });

      chatManager.clearHistory();
      const updatedMessages = chatManager.addMessage(
        'assistant', 
        `I've successfully processed **${result.fileName}**. What would you like to know about it?`
      );
      setMessages(updatedMessages);
    } catch (err) {
      setError(err.message || 'Error processing document.');
    }
  };

  const handleError = (message) => {
    setError(message);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || !documentInfo?.chunks?.length) return;

    const userMsg = question.trim();
    setQuestion('');
    setMessages(chatManager.addMessage('user', userMsg));
    setIsLoading(true);
    setError(null);

    try {
      const context = documentProcessor.getRelevantContext(userMsg, documentInfo.chunks);
      const response = await groqService.ask(userMsg, context);
      
      setMessages(chatManager.addMessage('assistant', response));
    } catch (err) {
      setError(err.message || 'An error occurred while communicating with the AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!documentInfo?.text) return;
    
    setIsLoading(true);
    setError(null);
    
    // Optional: Add user message indicating a summary request
    setMessages(chatManager.addMessage('user', 'Please summarize this document.'));

    try {
      const response = await groqService.summarize(documentInfo.text);
      setMessages(chatManager.addMessage('assistant', response));
    } catch (err) {
      setError(err.message || 'An error occurred while generating the summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    return chatManager.exportChat();
  };

  const resetSession = () => {
    setDocumentInfo(null);
    chatManager.clearHistory();
    setMessages([]);
    setError(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LocalDoc AI</h1>
        <p>Chat with your documents instantly and privately.</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        {!documentInfo ? (
          <div className="upload-section">
            <DropZone onFileLoad={handleFileLoad} onError={handleError} />
          </div>
        ) : (
          <div className="chat-section">
            <div className="document-info">
              <span className="file-badge">📄 {documentInfo.fileName}</span>
              <div className="toolbar">
                <SummaryButton onSummarize={handleSummarize} isLoading={isLoading} />
                <ExportButton onExport={handleExport} disabled={messages.length === 0} />
                <button className="action-btn reset-btn" onClick={resetSession}>Load New</button>
              </div>
            </div>
            
            <ChatWindow messages={messages} isLoading={isLoading} />
            
            <form className="question-form" onSubmit={handleAsk}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your document..."
                disabled={isLoading}
                className="question-input"
              />
              <button type="submit" disabled={isLoading || !question.trim()} className="send-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="send-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
