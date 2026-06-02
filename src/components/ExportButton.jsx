import React from 'react';

export default function ExportButton({ onExport, disabled }) {
  const handleExport = () => {
    const exportText = onExport();
    if (!exportText) return;

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LocalDoc_Export.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleExport} 
      disabled={disabled}
      className="action-btn export-btn"
      title="Export Chat History"
    >
      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      Export
    </button>
  );
}
