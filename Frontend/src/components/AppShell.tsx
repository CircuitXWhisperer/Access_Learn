import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Icon } from './Icons';
import { N8nChatWidget } from './N8nChatWidget';
import { useEffect, useRef, useState } from 'react';

const studentLinks = [
  ['/dashboard', 'Home', '⌂'], ['/learn', 'Daily Path', '↗'], ['/schemes', 'Scholarships', '▣'], ['/profile', 'My Profile', '●'],
];
const adminLinks = [['/admin', 'Command Centre', '⌂'], ['/admin?view=upload', 'Upload', '▣'], ['/admin?view=text', 'Reading Content', '▤'], ['/classroom', 'Live Classroom', '▣'], ['/exam-management', 'Exam Management', '✓'], ['/inclusion', 'Inclusion Roster', '♧']];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLElement | null>(null);
  const [focus, setFocus] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(textScale));
    document.documentElement.classList.toggle('focus-mode', focus);
  }, [focus, textScale]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') {
      globalThis.alert('This browser does not support the read-aloud feature.');
      return;
    }

    const text = contentRef.current?.innerText?.replace(/\s+/g, ' ').trim();

    if (!text) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')} aria-label="AccessLearn home">
        <span className="brand-mark">A</span><span>AccessLearn</span>
      </button>
      <nav className="topnav desktop-only">
        {user?.role === 'student' && <><NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/learn">My Lessons</NavLink><NavLink to="/schemes">Scholarships</NavLink></>}
        {user?.role === 'admin' && <><NavLink to="/admin">Dashboard</NavLink><NavLink to="/classroom">Classroom</NavLink><NavLink to="/exam-management">Exams</NavLink></>}
      </nav>
      <div className="top-actions">
        <button className={isReading ? 'pill-btn active read-aloud-btn' : 'pill-btn read-aloud-btn'} onClick={handleReadAloud} title={isReading ? 'Stop reading' : 'Read this page aloud'}>
          <Icon>{isReading ? '■' : '◉'}</Icon>
          <span className="desktop-only">{isReading ? 'Stop' : 'Read aloud'}</span>
        </button>
        <button className="pill-btn" onClick={() => setTextScale((v) => v >= 1.2 ? 1 : v + .1)} title="Increase text size"><Icon>TT</Icon><span className="desktop-only">Text</span></button>
        <button className={focus ? 'pill-btn active' : 'pill-btn'} onClick={() => setFocus((v) => !v)} title="Focus mode"><Icon>◐</Icon><span className="desktop-only">Focus</span></button>
        <button className="avatar" onClick={() => navigate('/profile')} aria-label="Open profile">{user?.name?.slice(0,1) ?? 'A'}</button>
        <button className="pill-btn signout-btn" type="button" onClick={async () => { await logout(); navigate('/login'); }} title="Sign out">
          <Icon>⎋</Icon>
          <span className="desktop-only">Sign out</span>
        </button>
        <button className="menu-btn" type="button" aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((value) => !value)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
    <div className="layout">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="profile-mini"><div className="avatar large">{user?.name?.slice(0,1)}</div><strong>{user?.name}</strong><span>{user?.role === 'admin' ? 'Educator / Admin' : `${user?.className} Student`}</span></div>
        <nav className="side-links">{links.map(([to, label, icon]) => <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} className={({isActive}) => isActive ? 'side-link active' : 'side-link'}><Icon>{icon}</Icon><span>{label}</span></NavLink>)}</nav>
        <div className="side-card"><small>Accessibility</small><strong>Designed for every learner</strong><span>Audio, focus, text scaling and keyboard navigation are built into the experience.</span></div>
        <button className="focus-big" onClick={() => setFocus((v) => !v)}><Icon>◐</Icon>{focus ? 'Exit Focus Mode' : 'Focus Mode'}</button>
        <button className="logout" onClick={async () => { await logout(); navigate('/login'); }}>Sign out</button>
      </aside>
      <main className="content" ref={contentRef}><div className="mobile-breadcrumb">{location.pathname.replace('/', '').replaceAll('-', ' ') || 'home'}</div><Outlet /></main>
    </div>
    <N8nChatWidget />
    <footer className="access-footer"><span>↹ Use Tab to navigate</span><span>◉ Optimized for screen readers</span><span>⌕ Accessibility settings available</span></footer>
  </div>;
}
