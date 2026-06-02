import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <p>Ask a question about the document to start the conversation.</p>
        </div>
      ) : (
        <div className="message-list">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isLoading && <MessageBubble isTyping={true} />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
