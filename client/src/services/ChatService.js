export const saveChat = (chatId, messages) => {
  const chats = loadAllChats();
  const title = messages.length > 0 ? 
    (messages[0].text.length > 30 ? messages[0].text.substring(0, 30) + '...' : messages[0].text) 
    : 'New Chat';
    
  chats[chatId] = {
    id: chatId,
    messages,
    updatedAt: new Date().toISOString(),
    title: title
  };
  localStorage.setItem('allChats', JSON.stringify(chats));
};

export const loadAllChats = () => {
  const data = localStorage.getItem('allChats');
  return data ? JSON.parse(data) : {};
};

export const loadChats = (chatId) => {
  const allChats = loadAllChats();
  return allChats[chatId]?.messages || [];
};

export const createNewChat = () => {
  const chatId = 'chat_' + Date.now();
  const chats = loadAllChats();
  chats[chatId] = {
    id: chatId,
    messages: [],
    updatedAt: new Date().toISOString(),
    title: 'New Chat'
  };
  localStorage.setItem('allChats', JSON.stringify(chats));
  return chatId;
};

export const deleteChat = (chatId) => {
  const chats = loadAllChats();
  delete chats[chatId];
  localStorage.setItem('allChats', JSON.stringify(chats));
};

export const getChatList = () => {
  const allChats = loadAllChats();
  return Object.values(allChats).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};