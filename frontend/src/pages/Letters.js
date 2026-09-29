import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SidebarNav from '../components/SidebarNav';
import catGif from '../cat.gif';
import '../Dashboard.css';
import '../components/MessagesModal.css';

const Letters = () => {
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
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <aside className="sidebar-left">
        <div className="brand-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" strokeDasharray="1 3"/>
            <path d="M14 6C10 6 7 9 7 13C7 16.5 9.5 19.5 13 20C9.5 19 7.5 16 7.5 12C7.5 8.5 10 6.5 14 6Z" fill="currentColor"/>
            <path d="M12 2V4M12 20V22M2 12H4M20 12H22"/>
          </svg>
          LUNARIA
        </div>
        
        <SidebarNav />
        
        <div className="companion-ornate-card">
          <img src={catGif} className="companion-cat-top" alt="Companion Cat" />
          <div className="companion-text">A quiet mind creates a<br/>beautiful world. ✦</div>
          <div className="companion-symbol">✧</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-feed" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="main-header" style={{ marginBottom: '20px' }}>
          <div>
            <h1 className="greeting">Letters ✉</h1>
            <p className="greeting-sub">Whispers across the stars.</p>
          </div>
        </header>

        <div className="messages-modal-card" style={{ position: 'relative', width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
          <div className="messages-sidebar">
            <div className="messages-header ornate-border-bottom">
              <h3>✧ Conversations ✧</h3>
            </div>
            
            <div className="user-search">
              <input 
                type="text" 
                placeholder="Find a companion..." 
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map(u => (
                    <div key={u._id} className="search-result-item" onClick={() => startChat(u)}>
                      <div className="search-avatar" style={{ backgroundImage: `url(${u.profilePicture})` }}></div>
                      <span>{u.displayName || u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="conversation-list">
              {conversations.map(conv => {
                const otherParticipant = conv.participants.find(p => p._id !== user.id && p._id !== user._id);
                return (
                  <div 
                    key={conv._id} 
                    className={`conversation-item ${activeChat?._id === otherParticipant?._id ? 'active' : ''}`}
                    onClick={() => startChat(otherParticipant)}
                  >
                    <div className="conv-avatar" style={{ backgroundImage: `url(${otherParticipant?.profilePicture})` }}></div>
                    <div className="conv-info">
                      <h4>{otherParticipant?.displayName || otherParticipant?.username}</h4>
                      <p>{conv.lastMessage?.content || 'Say hello...'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="messages-chat-area">
            {activeChat ? (
              <>
                <div className="chat-header ornate-border-bottom">
                  <div className="chat-avatar" style={{ backgroundImage: `url(${activeChat.profilePicture})` }}></div>
                  <h3>{activeChat.displayName || activeChat.username}</h3>
                </div>
                
                <div className="chat-messages">
                  {messages.map((msg, i) => {
                    const isMine = msg.sender === user.id || msg.sender === user._id || msg.sender?._id === user.id || msg.sender?._id === user._id;
                    return (
                      <div key={msg._id || i} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                        {msg.content}
                        <div className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    placeholder="Write a letter..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit">Send ✧</button>
                </form>
              </>
            ) : (
              <div className="empty-chat-state">
                <div className="empty-chat-icon">✉</div>
                <h3>Select a conversation</h3>
                <p>or search for someone to send a letter to.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Letters;
