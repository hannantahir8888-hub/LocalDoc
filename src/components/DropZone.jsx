import React, { useState, useRef } from 'react';
import { extractTextFromPDF } from '../utils/extractPdf';
import './DropZone.css';

export default function DropZone({ onFileLoad, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onError('File is too large. Please use a file under 10MB.');
      return;
    }

    const fileType = file.type;
    const fileName = file.name;

    setIsLoading(true);
    setFileInfo(null);

    try {
      if (fileType === 'application/pdf') {
        const result = await extractTextFromPDF(file);
        if (!result.text || result.text.trim() === '') {
          throw new Error('No text could be extracted from this file.');
        }
        setFileInfo({ name: fileName, info: `${result.pageCount} pages` });
        onFileLoad(result);
      } else if (fileType === 'text/plain') {
        const text = await file.text();
        if (!text || text.trim() === '') {
          throw new Error('No text could be extracted from this file.');
        }
        setFileInfo({ name: fileName, info: `${text.length} characters` });
        onFileLoad({ text, pageCount: 1, fileName });
      } else {
        onError('Only PDF and TXT files are supported.');
      }
    } catch (err) {
      onError(err.message || 'Error processing file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`drop-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''} ${fileInfo ? 'loaded' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept=".pdf,.txt" 
        style={{ display: 'none' }} 
      />
      
      {isLoading ? (
        <div className="spinner"></div>
      ) : fileInfo ? (
        <div className="file-info">
          <svg className="icon file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <div className="file-details">
            <div className="file-name">{fileInfo.name}</div>
            <div className="file-meta">{fileInfo.info}</div>
          </div>
        </div>
      ) : (
        <div className="upload-prompt">
          <svg className="icon upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <p>Drag & drop a PDF or TXT file here</p>
          <span>or click to browse</span>
        </div>
      )}
    </div>
  );
}
