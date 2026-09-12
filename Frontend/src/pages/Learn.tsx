import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../features/api';

export function Learn() {
  const { data } = useDashboard();
  const navigate = useNavigate();

  const readModuleAloud = (module: { subject: string; title: string; time: string }) => {
    if (!('speechSynthesis' in window)) return;

    const text = `Learn by listening. Subject: ${module.subject}. Lesson: ${module.title}. Time: ${module.time}.`;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return <div><div className="page-heading"><div><span className="eyebrow">LEARNING PATH</span><h1>My Lessons</h1><p>Continue where you left off, with accessible learning tools on every lesson.</p></div><button className="btn primary" onClick={()=>navigate('/lesson')}>Open current lesson</button></div><div className="filters"><button className="chip active">All</button><button className="chip">Mathematics</button><button className="chip">Science</button><button className="chip">History</button><button className="chip">Audio-first</button></div><div className="course-list">{data?.modules.map((m)=><div className="card course-row" key={m.id}><div className="course-icon">{m.icon}</div><div className="course-main"><span className="tag">{m.subject}</span><h2>{m.title}</h2><p className="muted">Learn by listening • {m.time} • Read aloud available</p><div className="progress"><span style={{width:`${m.progress}%`}}/></div></div><div className="course-side"><strong>{m.progress}%</strong><button className="text-btn" type="button" onClick={() => readModuleAloud(m)}>🔊 Read aloud</button><button className="btn secondary" disabled={m.status==='locked'} onClick={()=>navigate('/lesson')}>{m.status==='locked'?'Locked':'Open'}</button></div></div>)}</div></div>;
}
