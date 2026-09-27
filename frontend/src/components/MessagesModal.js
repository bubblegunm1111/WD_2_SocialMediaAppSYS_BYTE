import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MessagesModal.css';

const MessagesModal = ({ onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await messageService.getMessages(userId);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await messageService.sendMessage(activeChat._id, newMessage);
      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage('');
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const res = await messageService.searchUsers(query);
        if (res.success) setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const startChat = (otherUser) => {
    setActiveChat(otherUser);
    setSearchQuery('');
    setSearchResults([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="messages-modal-overlay" onClick={onClose}>
      <div className="messages-modal-card" onClick={e => e.stopPropagation()}>
        <div className="messages-sidebar">
          <div className="messages-header ornate-border-bottom">
            <h3>✧ Messages ✧</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="messages-search">
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="conversations-list">
            {searchResults.length > 0 ? (
              searchResults.map(u => (
                <div key={u._id} className="conversation-item" onClick={() => startChat(u)}>
                  <img src={u.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=19142d&textColor=f7e8d5`} alt={u.username} />
                  <div className="conv-details">
                    <h4>{u.displayName || u.username}</h4>
                  </div>
                </div>
              ))
            ) : (
              conversations.map(conv => {
                const isUnread = !conv.latestMessage?.read && conv.latestMessage?.receiver === (user.id || user._id);
                const isActive = activeChat?._id === conv.user._id;
                return (
                  <div 
                    key={conv.user._id} 
                    className={`conversation-item ${isActive ? 'active ornate-card-border' : ''} ${isUnread ? 'unread' : ''}`}
                    onClick={() => startChat(conv.user)}
                  >
                    <img src={conv.user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.user.username}&backgroundColor=19142d&textColor=f7e8d5`} alt={conv.user.username} />
                    <div className="conv-details">
                      <h4>{conv.user.displayName || conv.user.username} <span>✧</span></h4>
                      <p className="latest-message">{conv.latestMessage?.content}</p>
                    </div>
                    <div className="conv-meta">
                      <span className="conv-time">
                        {conv.latestMessage ? new Date(conv.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                      {isUnread && <div className="unread-dot"></div>}
                    </div>
                  </div>
                );
              })
            )}
            
            {conversations.length === 0 && searchResults.length === 0 && !searchQuery && (
              <p className="no-conversations">No messages yet. Search to start chatting.</p>
            )}
          </div>
        </div>

        <div className="messages-chat-area">
          {activeChat ? (
            <>
              <div className="chat-header">
                <img src={activeChat.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${activeChat.username}&backgroundColor=19142d&textColor=f7e8d5`} alt={activeChat.username} />
                <h3>{activeChat.displayName || activeChat.username}</h3>
              </div>
              
              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const isMine = msg.sender === (user.id || user._id);
                  return (
                    <div key={msg._id || i} className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                      <div className="chat-bubble">
                        <p>{msg.content}</p>
                        <span className="timestamp">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Write a message..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <h3 className="ornate-title">Your Messages</h3>
              <p>Select a conversation or search for someone.</p>
              <div className="ornate-divider">
                <span className="line"></span>
                <span className="star">✧</span>
                <span className="line"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;
