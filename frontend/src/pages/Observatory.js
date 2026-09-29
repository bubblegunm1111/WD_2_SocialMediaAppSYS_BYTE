import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import LuniarePet from '../components/LuniarePet';
import SidebarNav from '../components/SidebarNav';
import MessagesModal from '../components/MessagesModal';
import { postService, userService } from '../services/api';
import catGif from '../cat.gif';
import '../Dashboard.css';
import './Observatory.css';

/* ---------- Tonight's Sky: real moon phase ---------- */
const MOON_PHASES = [
  { name: 'New Moon', symbol: '●', advice: 'A night for beginnings and quiet intentions.' },
  { name: 'Waxing Crescent', symbol: '☽', advice: 'A good night for reflection, writing, and photography.' },
  { name: 'First Quarter', symbol: '◐', advice: 'A good night for decisions and starting projects.' },
  { name: 'Waxing Gibbous', symbol: '◕', advice: 'A good night for refining what you have made.' },
  { name: 'Full Moon', symbol: '○', advice: 'A good night for sharing your brightest work.' },
  { name: 'Waning Gibbous', symbol: '◑', advice: 'A good night for gratitude and slow thoughts.' },
  { name: 'Last Quarter', symbol: '◓', advice: 'A good night for letting go of old pages.' },
  { name: 'Waning Crescent', symbol: '☾', advice: 'A good night for rest and quiet reading.' },
];

const getMoonInfo = () => {
  const synodicMonth = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14) / 86400000; // days
  const now = Date.now() / 86400000;
  const age = ((now - knownNewMoon) % synodicMonth + synodicMonth) % synodicMonth;
  const index = Math.floor((age / synodicMonth) * 8) % 8;
  const illumination = Math.round((1 - Math.cos((age / synodicMonth) * 2 * Math.PI)) * 50);
  return { ...MOON_PHASES[index], illumination, age: age.toFixed(1) };
};

// Arranged in a circle (cx/cy in % of a 520x520 square, center at 50%,50%)
// radius ~38% for the outer ring
const CONSTELLATIONS = [
  {
    id: 'art',         name: 'ART',         cx: 50,  cy: 12,  pages: '14.2K', creators: '4.1K', active: '84',
    communities: ['Digital painting', 'Illustration', 'Character design', 'Sketchbooks'],
    keywords: ['art', 'paint', 'draw', 'illustration', 'sketch', 'doodle', 'canvas'],
  },
  {
    id: 'music',       name: 'MUSIC',       cx: 84,  cy: 28,  pages: '22.1K', creators: '7.8K', active: '230',
    communities: ['Indie music', 'Vinyl', 'Composition', 'Late night playlists'],
    keywords: ['music', 'song', 'playlist', 'vinyl', 'album', 'melody', 'piano', 'guitar'],
  },
  {
    id: 'photography', name: 'PHOTOGRAPHY', cx: 95,  cy: 64,  pages: '24.8K', creators: '8.2K', active: '143',
    communities: ['Midnight photographers', 'Landscapes', 'Street', 'Astro'],
    keywords: ['photo', 'photograph', 'moon', 'night', 'sky', 'lens', 'shot', 'camera'],
  },
  {
    id: 'writing',     name: 'WRITING',     cx: 73,  cy: 92,  pages: '31.2K', creators: '12K',  active: '400',
    communities: ['Short stories', 'Letters', 'Journaling', 'Flash fiction'],
    keywords: ['write', 'writing', 'story', 'letter', 'journal', 'prose', 'words'],
  },
  {
    id: 'film',        name: 'FILM',        cx: 27,  cy: 92,  pages: '11.4K', creators: '3.5K', active: '45',
    communities: ['Film photography', 'Cinematography', 'Short films', 'Analog'],
    keywords: ['film', 'movie', 'cinema', 'camera', '35mm', 'reel'],
  },
  {
    id: 'books',       name: 'BOOKS',       cx: 5,   cy: 64,  pages: '9.8K',  creators: '2.3K', active: '112',
    communities: ['Poetry', 'Essays', 'Book reviews', 'Marginalia'],
    keywords: ['book', 'read', 'novel', 'poem', 'poetry', 'library', 'story', 'chapter'],
  },
];

// Inner ring mid-points for cross connections
const INNER_NODES = [
  { id: 'i1', cx: 62, cy: 35 },
  { id: 'i2', cx: 82, cy: 54 },
  { id: 'i3', cx: 66, cy: 77 },
  { id: 'i4', cx: 38, cy: 77 },
  { id: 'i5', cx: 20, cy: 54 },
  { id: 'i6', cx: 34, cy: 35 },
];

const CONSTELLATION_LINKS = [
  ['art', 'music'], ['music', 'photography'], ['photography', 'writing'],
  ['writing', 'film'], ['film', 'books'], ['books', 'art'],
  // inner cross-connections
  ['art', 'writing'], ['music', 'film'], ['photography', 'books'],
];

const byId = Object.fromEntries(CONSTELLATIONS.map((c) => [c.id, c]));

/* ---------- Nightly prompts (deterministic per day) ---------- */
const PROMPTS = [
  { icon: '📷', type: 'Photography', text: 'Photograph something blue tonight.', cta: 'Take a photo' },
  { icon: '✍', type: 'Writing', text: 'Write about a place you remember but haven\'t visited in years.', cta: 'Write a page' },
  { icon: '🎨', type: 'Art', text: 'Draw something inspired by tonight\'s moon.', cta: 'Create art' },
  { icon: '📷', type: 'Photography', text: 'Capture the last light before it disappears.', cta: 'Take a photo' },
  { icon: '✍', type: 'Writing', text: 'Write a letter you will never send.', cta: 'Write a page' },
  { icon: '🌙', type: 'Reflection', text: 'Describe tonight in exactly three sentences.', cta: 'Reflect' },
  { icon: '🎨', type: 'Art', text: 'Illustrate a dream you half remember.', cta: 'Create art' },
];

const tonightsPrompt = () => PROMPTS[new Date().getDate() % PROMPTS.length];

const Observatory = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredConstellation, setHoveredConstellation] = useState(null);
  const [activeConstellation, setActiveConstellation] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [wanderResult, setWanderResult] = useState(null);
  const [isWandering, setIsWandering] = useState(false);
  const [promptModal, setPromptModal] = useState(null);
  const [promptText, setPromptText] = useState('');
  const [promptMedia, setPromptMedia] = useState('');
  const [posting, setPosting] = useState(false);
  const [followedUsers, setFollowedUsers] = useState({});
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const moon = useMemo(getMoonInfo, []);
  const prompt = useMemo(tonightsPrompt, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await postService.getPosts({ limit: 40, isNote: true });
        setPosts(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  /* Posts inside a constellation — matched by keywords in the content */
  const constellationPosts = useCallback((constellation) => {
    if (!constellation) return [];
    const matched = posts.filter((post) => {
      const text = (post.content || '').toLowerCase();
      return constellation.keywords.some((k) => text.includes(k));
    });
    return matched.length > 0 ? matched : posts.slice(0, 3);
  }, [posts]);

  /* People discovered from posts, deduplicated */
  const discoveredPeople = useMemo(() => {
    const seen = new Set();
    const people = [];
    for (const post of posts) {
      const author = post.userId;
      if (!author || seen.has(author._id)) continue;
      seen.add(author._id);
      people.push(author);
      if (people.length >= 3) break;
    }
    return people;
  }, [posts]);

  /* Tonight's pages — image posts first, then any */
  const tonightsPages = useMemo(() => {
    const withMedia = posts.filter((p) => p.mediaUrl);
    const rest = posts.filter((p) => !p.mediaUrl);
    return [...withMedia, ...rest].slice(0, 6);
  }, [posts]);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return tonightsPages;
    const q = searchQuery.toLowerCase();
    return tonightsPages.filter((p) =>
      p.content?.toLowerCase().includes(q) ||
      p.userId?.username?.toLowerCase().includes(q) ||
      p.userId?.displayName?.toLowerCase().includes(q)
    );
  }, [tonightsPages, searchQuery]);

  /* ---------- Actions ---------- */
  const handleWander = () => {
    if (posts.length === 0) return;
    setIsWandering(true);
    setTimeout(() => {
      const roll = Math.random();
      let result;
      if (roll < 0.5) {
        const post = posts[Math.floor(Math.random() * posts.length)];
        result = {
          kind: 'page',
          eyebrow: '✦ A little something for tonight',
          title: post.content?.slice(0, 70) || 'A quiet discovery',
          detail: `Posted by ${post.userId?.displayName || post.userId?.username || 'a wanderer'}`,
          post,
        };
      } else if (roll < 0.8 && discoveredPeople.length > 0) {
        const person = discoveredPeople[Math.floor(Math.random() * discoveredPeople.length)];
        result = {
          kind: 'person',
          eyebrow: '✧ A person you might like',
          title: `@${person.username}`,
          detail: person.displayName || 'A wanderer of the night',
          person,
        };
      } else {
        const c = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
        result = {
          kind: 'constellation',
          eyebrow: '☾ A corner of the sky',
          title: `The ${c.name} constellation`,
          detail: `${c.pages} pages · ${c.active} active tonight`,
          constellation: c,
        };
      }
      setWanderResult(result);
      setIsWandering(false);
    }, 900);
  };

  const handleConstellationClick = (c) => {
    setActiveConstellation(activeConstellation === c.id ? null : c.id);
  };

  const handleFollow = async (userId) => {
    try {
      if (followedUsers[userId]) {
        await userService.unfollowUser(userId);
        setFollowedUsers((f) => ({ ...f, [userId]: false }));
      } else {
        await userService.followUser(userId);
        setFollowedUsers((f) => ({ ...f, [userId]: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromptCreate = () => {
    setPromptText(`${prompt.icon} ${prompt.text}\n\n`);
    setPromptMedia('');
    setPromptModal(true);
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setPosting(true);
    try {
      const res = await postService.createPost({
        content: promptText.trim(),
        mediaUrl: promptMedia || undefined,
        isNote: true,
      });
      setPosts([res.data, ...posts]);
      setPromptModal(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handlePromptFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPromptMedia(reader.result);
    reader.readAsDataURL(file);
  };

  const avatarFor = (person) =>
    person?.profilePicture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${person?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`;

  const activeConstellationData = activeConstellation ? byId[activeConstellation] : null;

  return (
    <div className="dashboard-layout observatory-layout">
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
        <SidebarNav onLettersClick={() => setIsMessagesOpen(true)} />

        <div className="companion-ornate-card">
          <img src={catGif} className="companion-cat-top" alt="Companion Cat" />
          <div className="companion-text">Your little companion<br/>is nearby...</div>
          <div className="companion-symbol">✧</div>
        </div>
      </aside>

      {/* Main Content (Observatory) */}
      <main className="obs-main">
        <header className="obs-header">
          <div className="obs-title-area">
            <h1>OBSERVATORY</h1>
            <p>What else is out there — beyond your room</p>
          </div>

          <div className="obs-search-bar">
            <span className="obs-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search the night..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Celestial Wheel Map */}
        <div className="obs-map-container">
          <svg className="obs-lines" viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,220,100,0.35)"/>
                <stop offset="100%" stopColor="rgba(255,220,100,0)"/>
              </radialGradient>
              <filter id="starGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Outer decorative ring */}
            <circle cx="260" cy="260" r="248" className="obs-ring-outer"/>
            {/* Main rings */}
            <circle cx="260" cy="260" r="210" className="obs-ring"/>
            <circle cx="260" cy="260" r="155" className="obs-ring"/>
            <circle cx="260" cy="260" r="95"  className="obs-ring-inner"/>
            <circle cx="260" cy="260" r="38"  className="obs-ring-inner"/>

            {/* Radial divider lines (every 60°) */}
            {[0,60,120,180,240,300].map(deg => {
              const rad = (deg * Math.PI) / 180;
              return <line key={deg}
                x1={260 + Math.cos(rad)*38}  y1={260 + Math.sin(rad)*38}
                x2={260 + Math.cos(rad)*248} y2={260 + Math.sin(rad)*248}
                className="obs-radial-line"
              />;
            })}

            {/* Center ambient glow disc */}
            <circle cx="260" cy="260" r="80" fill="url(#centerGlow)" style={{pointerEvents:'none'}}/>

            {/* Center star */}
            <g filter="url(#starGlow)">
              <circle cx="260" cy="260" r="5" fill="rgba(255,223,150,0.9)"/>
              <line x1="260" y1="248" x2="260" y2="272" stroke="rgba(255,223,150,0.7)" strokeWidth="1"/>
              <line x1="248" y1="260" x2="272" y2="260" stroke="rgba(255,223,150,0.7)" strokeWidth="1"/>
            </g>

            {/* Constellation connecting lines */}
            {CONSTELLATION_LINKS.map(([a, b], i) => {
              const A = byId[a], B = byId[b];
              if (!A || !B) return null;
              const hot = activeConstellation && (activeConstellation === a || activeConstellation === b);
              const ax = (A.cx / 100) * 520, ay = (A.cy / 100) * 520;
              const bx = (B.cx / 100) * 520, by = (B.cy / 100) * 520;
              return (
                <line key={i}
                  x1={ax} y1={ay} x2={bx} y2={by}
                  className={`obs-conn-line${hot ? ' active' : ''}`}
                />
              );
            })}

            {/* Tiny inner accent dots */}
            {INNER_NODES.map(n => (
              <circle key={n.id}
                cx={(n.cx/100)*520} cy={(n.cy/100)*520}
                r="2.5"
                fill="rgba(255,223,150,0.2)"
                stroke="rgba(255,223,150,0.1)" strokeWidth="0.5"
              />
            ))}
          </svg>

          {/* Star nodes */}
          {CONSTELLATIONS.map((c) => (
            <div
              key={c.id}
              className={`obs-node ${hoveredConstellation === c.id ? 'hovered' : ''} ${activeConstellation === c.id ? 'selected' : ''}`}
              style={{ left: `${c.cx}%`, top: `${c.cy}%` }}
              onMouseEnter={() => setHoveredConstellation(c.id)}
              onMouseLeave={() => setHoveredConstellation(null)}
              onClick={() => handleConstellationClick(c)}
            >
              <div className="obs-node-star"/>
              <div className="obs-node-label">{c.name}</div>

              {(hoveredConstellation === c.id || activeConstellation === c.id) && (
                <div className="obs-node-tooltip">
                  <h4>{c.name}</h4>
                  <p>{c.pages} Pages</p>
                  <p>{c.creators} creators</p>
                  <p className="active-stat">✦ {c.active} active tonight</p>
                  <p className="obs-node-hint">{activeConstellation === c.id ? 'Selected — see below ✦' : 'Click to explore'}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="obs-wander-container">
          <button className={`obs-wander-btn ${isWandering ? 'wandering' : ''}`} onClick={handleWander} disabled={isWandering}>
            <span className="wander-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"/></svg>
            </span>
            {isWandering ? 'WANDERING...' : 'WANDER'}
          </button>
          <p>"Take me somewhere unexpected."</p>
        </div>

        {/* Constellation detail panel */}
        {activeConstellationData && (
          <section className="obs-constellation-detail">
            <div className="obs-panel-header">
              <div>
                <span className="obs-eyebrow">You are drifting through</span>
                <h3>The {activeConstellationData.name} Constellation</h3>
              </div>
              <button className="obs-close-panel" onClick={() => setActiveConstellation(null)}>✕ Close</button>
            </div>
            <div className="obs-communities">
              {activeConstellationData.communities.map((community) => (
                <span key={community} className="obs-community-chip">{community}</span>
              ))}
            </div>
            <div className="obs-constellation-posts">
              {constellationPosts(activeConstellationData).map((post) => (
                <div className="obs-mini-page" key={post._id} onClick={() => setSelectedPost(post)}>
                  <div className="obs-mini-page-thumb" style={post.mediaUrl ? { backgroundImage: `url(${post.mediaUrl})` } : undefined}>
                    {!post.mediaUrl && <span>✧</span>}
                  </div>
                  <div className="obs-mini-page-info">
                    <h5>@{post.userId?.username || 'wanderer'}</h5>
                    <p>{post.content?.slice(0, 60)}{(post.content?.length || 0) > 60 ? '...' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tonight's Sky */}
        <section className="obs-sky-section">
          <h3 className="obs-section-title">───── ☾ Tonight's Sky ─────</h3>
          <div className="obs-sky-card">
            <div className="obs-sky-moon">
              <span className="obs-moon-symbol">{moon.symbol}</span>
              <strong>{moon.name}</strong>
              <span className="obs-moon-vis">{moon.illumination}% visible</span>
            </div>
            <div className="obs-sky-advice">
              <p className="obs-sky-quote">"{moon.advice}"</p>
              <div className="obs-sky-actions">
                <button className="obs-sky-btn" onClick={handlePromptCreate}>Write a Page →</button>
              </div>
            </div>
          </div>
        </section>

        {/* Tonight's Pages */}
        <section className="obs-bottom-sections">
          <h3 className="obs-section-title">───── ✦ Tonight's Pages ─────</h3>
          {searchQuery && (
            <p className="obs-search-status">
              {filteredPages.length > 0
                ? `Found ${filteredPages.length} page${filteredPages.length === 1 ? '' : 's'} in "${searchQuery}"`
                : `Nothing in the sky matches "${searchQuery}"`}
            </p>
          )}
          <div className="obs-tonight-cards">
            {loading ? (
              <p className="obs-empty">Charting tonight's sky...</p>
            ) : filteredPages.length === 0 ? (
              <p className="obs-empty">No pages discovered tonight...</p>
            ) : (
              filteredPages.map((post, index) => (
                <div className="discovery-card" key={post._id || index} onClick={() => setSelectedPost(post)}>
                  <div
                    className={`disc-image ${post.mediaUrl ? '' : index % 2 === 0 ? 'bg-photo' : 'bg-art'}`}
                    style={post.mediaUrl ? { backgroundImage: `url(${post.mediaUrl})` } : undefined}
                  ></div>
                  <div className="disc-info">
                    <h4>@{post.userId?.username || 'wanderer'}</h4>
                    <p>"{post.content?.substring(0, 40)}{post.content?.length > 40 ? '...' : ''}"</p>
                    <span>✦ {(post.likesCount || 0) + 12} Mesmerized · Tap to enter</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Nightly Prompt */}
        <section className="obs-prompt-section">
          <h3 className="obs-section-title">───── ✧ Tonight's Prompt ─────</h3>
          <div className="obs-prompt-card">
            <span className="obs-prompt-icon">{prompt.icon}</span>
            <div className="obs-prompt-text">
              <span className="obs-eyebrow">{prompt.type}</span>
              <p>"{prompt.text}"</p>
            </div>
            <button className="obs-prompt-btn" onClick={handlePromptCreate}>{prompt.cta} →</button>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar-right obs-sidebar-right">
        {/* People along your constellation */}
        <div className="widget obs-widget">
          <div className="widget-header">
            <h3>✦ PEOPLE ALONG YOUR CONSTELLATION</h3>
          </div>
          {loading ? (
            <p className="obs-empty">Finding fellow wanderers...</p>
          ) : discoveredPeople.length === 0 ? (
            <p className="obs-empty">The night is quiet tonight...</p>
          ) : (
            <div className="obs-people">
              {discoveredPeople.map((person) => (
                <div key={person._id} className="obs-person">
                  <Link to={`/profile/${person._id}`}>
                    <img src={avatarFor(person)} alt={person.username} />
                  </Link>
                  <div style={{ flex: 1 }}>
                    <Link to={`/profile/${person._id}`} className="obs-person-link">
                      <h4>@{person.username}</h4>
                    </Link>
                    <p>✦ Shares your love of the night</p>
                  </div>
                  {person._id !== (user?._id || user?.id) && (
                    <button
                      className={`obs-follow-btn ${followedUsers[person._id] ? 'following' : ''}`}
                      onClick={() => handleFollow(person._id)}
                    >
                      {followedUsers[person._id] ? '✦ Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Constellations tonight */}
        <div className="widget obs-widget">
          <div className="widget-header">
            <h3>☾ CONSTELLATIONS TONIGHT</h3>
          </div>
          <ul className="notification-list obs-list">
            {CONSTELLATIONS.slice(0, 4).map((c) => (
              <li
                key={c.id}
                className="obs-community-row"
                onClick={() => {
                  setActiveConstellation(c.id);
                  document.querySelector('.obs-main')?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div>
                  <h4>{c.communities[0]}</h4>
                  <p>{c.creators} members · {c.active} active</p>
                </div>
                <span className="obs-community-arrow">→</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Near your orbit */}
        <div className="widget obs-widget orbit-widget">
          <div className="widget-header">
            <h3>NEAR YOUR ORBIT</h3>
          </div>
          <p className="orbit-sub">People whose worlds overlap with yours.</p>
          <div className="orbit-overlap">
            <span>Photography</span>
            <span>Books</span>
            <span>Night walks</span>
          </div>
          {discoveredPeople[0] && (
            <div className="orbit-match">
              <div className="obs-person">
                <Link to={`/profile/${discoveredPeople[0]._id}`}>
                  <img src={avatarFor(discoveredPeople[0])} alt={discoveredPeople[0].username} />
                </Link>
                <div>
                  <Link to={`/profile/${discoveredPeople[0]._id}`} className="obs-person-link">
                    <h4>@{discoveredPeople[0].username}</h4>
                  </Link>
                  <p className="overlap-stat">✦ {42 + (discoveredPeople[0].username?.length || 0) % 40}% of your interests overlap</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Post detail modal */}
      {selectedPost && (
        <div className="obs-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="obs-modal-content obs-post-modal" onClick={(e) => e.stopPropagation()}>
            <button className="obs-modal-close" onClick={() => setSelectedPost(null)}>✕</button>
            <Post post={selectedPost} onDelete={() => setSelectedPost(null)} />
          </div>
        </div>
      )}

      {/* Wander result modal */}
      {wanderResult && (
        <div className="obs-modal-overlay" onClick={() => setWanderResult(null)}>
          <div className="obs-modal-content obs-wander-modal" onClick={(e) => e.stopPropagation()}>
            <button className="obs-modal-close" onClick={() => setWanderResult(null)}>✕</button>
            <span className="obs-eyebrow">{wanderResult.eyebrow}</span>
            <h3>{wanderResult.title}</h3>
            <p>{wanderResult.detail}</p>
            <div className="obs-wander-actions">
              {wanderResult.kind === 'page' && (
                <button
                  className="obs-sky-btn"
                  onClick={() => { setSelectedPost(wanderResult.post); setWanderResult(null); }}
                >
                  Explore this page →
                </button>
              )}
              {wanderResult.kind === 'person' && (
                <button
                  className="obs-sky-btn"
                  onClick={() => { navigate(`/profile/${wanderResult.person._id}`); setWanderResult(null); }}
                >
                  Visit their room →
                </button>
              )}
              {wanderResult.kind === 'constellation' && (
                <button
                  className="obs-sky-btn"
                  onClick={() => { setActiveConstellation(wanderResult.constellation.id); setWanderResult(null); }}
                >
                  Enter the constellation →
                </button>
              )}
              <button className="obs-ghost-btn" onClick={handleWander}>Wander again ✦</button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt create modal */}
      {promptModal && (
        <div className="obs-modal-overlay" onClick={() => setPromptModal(false)}>
          <div className="obs-modal-content obs-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="obs-modal-close" onClick={() => setPromptModal(false)}>✕</button>
            <span className="obs-eyebrow">✧ Answering tonight's prompt</span>
            <form onSubmit={handlePromptSubmit}>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={6}
                maxLength={2000}
              />
              {promptMedia && (
                <div className="obs-prompt-preview">
                  <img src={promptMedia} alt="Preview" />
                  <button type="button" onClick={() => setPromptMedia('')}>✕</button>
                </div>
              )}
              <div className="obs-prompt-form-actions">
                <label className="obs-prompt-file">
                  <span>⌕ Add an image</span>
                  <input type="file" accept="image/*" onChange={handlePromptFileChange} style={{ display: 'none' }} />
                </label>
                <button type="submit" className="obs-sky-btn" disabled={posting || !promptText.trim()}>
                  {posting ? 'Sharing...' : 'Share with the night →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Luniare Pet Companion */}
      <LuniarePet />

      {/* Messages Modal */}
      {isMessagesOpen && <MessagesModal onClose={() => setIsMessagesOpen(false)} />}
    </div>
  );
};

export default Observatory;
