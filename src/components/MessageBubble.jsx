import React from 'react';
import './MessageBubble.css';

const formatContent = (text) => {
  if (!text) return null;
  
  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    // If it's a code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const codeContent = part.substring(3, part.length - 3).trim();
      // Optionally extract language if specified
      const firstLineEnd = codeContent.indexOf('\n');
      let language = '';
      let code = codeContent;
      if (firstLineEnd !== -1 && !codeContent.substring(0, firstLineEnd).includes(' ')) {
        language = codeContent.substring(0, firstLineEnd);
        code = codeContent.substring(firstLineEnd + 1);
      }
      return (
        <pre key={index} className="code-block">
          <code>{code}</code>
        </pre>
      );
    }
    
    // Process bold text and newlines in normal text
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={index}>
        {boldParts.map((bp, i) => {
          if (bp.startsWith('**') && bp.endsWith('**')) {
            return <strong key={i}>{bp.substring(2, bp.length - 2)}</strong>;
          }
          // Handle newlines
          return bp.split('\n').map((line, j) => (
            <React.Fragment key={`${i}-${j}`}>
              {line}
              {j !== bp.split('\n').length - 1 && <br />}
            </React.Fragment>
          ));
        })}
      </span>
    );
  });
};

export default function MessageBubble({ message, isTyping }) {
  if (isTyping) {
    return (
      <div className="message-wrapper assistant">
        <div className="message-bubble assistant typing">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? message.content : formatContent(message.content)}
      </div>
    </div>
  );
}
