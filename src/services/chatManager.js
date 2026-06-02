class ChatManager {
  constructor() {
    this.messages = [];
  }

  addMessage(role, content) {
    const newMessage = { role, content, timestamp: new Date() };
    this.messages.push(newMessage);
    return [...this.messages]; // Return copy for React state
  }

  getHistory() {
    return [...this.messages];
  }

  clearHistory() {
    this.messages = [];
    return [];
  }

  exportChat() {
    if (this.messages.length === 0) return '';
    
    let exportText = 'LocalDoc Q&A Export\n';
    exportText += '===================\n\n';
    
    this.messages.forEach(msg => {
      const roleName = msg.role === 'user' ? 'You' : 'LocalDoc AI';
      exportText += `${roleName} (${msg.timestamp.toLocaleString()}):\n`;
      exportText += `${msg.content}\n\n`;
      exportText += '-------------------\n\n';
    });
    
    return exportText;
  }
}

export const chatManager = new ChatManager();
