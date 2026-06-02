import React, { useState } from 'react';

export default function SummaryButton({ onSummarize, isLoading }) {
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleClick = async () => {
    setIsSummarizing(true);
    await onSummarize();
    setIsSummarizing(false);
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={isLoading || isSummarizing}
      className="action-btn summarize-btn"
      title="Generate Document Summary"
    >
      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      {isSummarizing ? 'Summarizing...' : 'Summarize'}
    </button>
  );
}
