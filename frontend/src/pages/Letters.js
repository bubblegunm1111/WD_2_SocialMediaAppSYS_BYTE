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

        <div className="letters-container" style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', flex: 1, minHeight: 0, background: 'rgba(20, 15, 30, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(220, 200, 150, 0.2)', overflow: 'hidden' }}>
          <div className="messages-sidebar" style={{ width: '300px', borderRight: '1px solid rgba(220, 200, 150, 0.2)', display: 'flex', flexDirection: 'column' }}>
            <div className="messages-header ornate-border-bottom" style={{ padding: '20px', borderBottom: '1px solid rgba(220, 200, 150, 0.2)' }}>
              <h3 style={{ color: '#caa77d', margin: 0 }}>✧ Conversations ✧</h3>
            </div>
            
            <div className="user-search" style={{ padding: '15px' }}>
              <input 
                type="text" 
                placeholder="Find a companion..." 
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220, 200, 150, 0.2)', padding: '10px 15px', borderRadius: '12px', color: '#eee5dc', outline: 'none' }}
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

          <div className="messages-chat-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(10, 5, 20, 0.5)' }}>
            {activeChat ? (
              <>
                <div className="chat-header ornate-border-bottom" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid rgba(220, 200, 150, 0.2)' }}>
                  <div className="chat-avatar" style={{ backgroundImage: `url(${activeChat.profilePicture})`, width: '40px', height: '40px', borderRadius: '50%', backgroundSize: 'cover' }}></div>
                  <h3 style={{ color: '#eee5dc', margin: 0 }}>{activeChat.displayName || activeChat.username}</h3>
                </div>
                
                <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {messages.map((msg, i) => {
                    const isMine = msg.sender === user.id || msg.sender === user._id || msg.sender?._id === user.id || msg.sender?._id === user._id;
                    return (
                      <div key={msg._id || i} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`} style={{ maxWidth: '70%', padding: '12px 18px', borderRadius: '18px', background: isMine ? '#caa77d' : 'rgba(255,255,255,0.05)', color: isMine ? '#070a1d' : '#eee5dc', alignSelf: isMine ? 'flex-end' : 'flex-start', borderBottomRightRadius: isMine ? '4px' : '18px', borderBottomLeftRadius: isMine ? '18px' : '4px' }}>
                        {msg.content}
                        <div className="msg-time" style={{ fontSize: '10px', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid rgba(220, 200, 150, 0.2)', display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Write a letter..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220, 200, 150, 0.2)', padding: '12px 20px', borderRadius: '24px', color: '#eee5dc', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: '#caa77d', color: '#070a1d', border: 'none', padding: '0 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer' }}>Send ✧</button>
                </form>
              </>
            ) : (
              <div className="empty-chat-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                <div className="empty-chat-icon" style={{ fontSize: '48px', marginBottom: '15px', color: 'rgba(220, 200, 150, 0.5)' }}>✉</div>
                <h3 style={{ color: '#caa77d' }}>Select a conversation</h3>
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
