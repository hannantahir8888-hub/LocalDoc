import { chatManager } from '../services/chatManager';

describe('ChatManager', () => {
  beforeEach(() => {
    chatManager.clearHistory();
  });

  it('addMessage() appends to history correctly', () => {
    chatManager.addMessage('user', 'Hello');
    const history = chatManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].role).toBe('user');
    expect(history[0].content).toBe('Hello');
  });

  it('getHistory() returns messages in order', () => {
    chatManager.addMessage('user', 'Q1');
    chatManager.addMessage('assistant', 'A1');
    const history = chatManager.getHistory();
    expect(history.length).toBe(2);
    expect(history[0].content).toBe('Q1');
    expect(history[1].content).toBe('A1');
  });

  it('clearHistory() empties the array', () => {
    chatManager.addMessage('user', 'Hello');
    expect(chatManager.getHistory().length).toBe(1);
    
    chatManager.clearHistory();
    expect(chatManager.getHistory().length).toBe(0);
  });

  it('exportChat() returns a formatted string', () => {
    chatManager.addMessage('user', 'Test Q');
    chatManager.addMessage('assistant', 'Test A');
    
    const exported = chatManager.exportChat();
    expect(exported).toContain('LocalDoc Q&A Export');
    expect(exported).toContain('You (');
    expect(exported).toContain('Test Q');
    expect(exported).toContain('LocalDoc AI (');
    expect(exported).toContain('Test A');
  });
});
