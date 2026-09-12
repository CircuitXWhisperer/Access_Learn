import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markLessonProgress, useDashboard, useMediaTutorials, useReadingContent } from '../features/api';
import { useAuth } from '../auth/AuthProvider';

function UploadedTutorialCard({ tutorial }: { tutorial: { _id?: string; title: string; description?: string; chapterTitle?: string; chapterContent?: string; className?: string; board?: string; subject?: string; thumbnailUrl?: string; videoUrl?: string; audioUrl?: string; mediaType?: string } }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive) return;
    const interval = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          videoRef.current?.pause();
          setTimerActive(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const startTimer = () => {
    const seconds = Math.max(1, Math.min(120, minutes)) * 60;
    setRemaining(seconds);
    setTimerActive(true);
    void videoRef.current?.play();
  };

  const stopTimer = () => {
    setTimerActive(false);
    setRemaining(0);
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) void videoRef.current.play();
    else videoRef.current.pause();
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void playerRef.current.requestFullscreen();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !muted;
    videoRef.current.muted = nextMuted;
    if (!nextMuted && videoRef.current.volume === 0) videoRef.current.volume = 1;
    setMuted(nextMuted);
    setVolume(nextMuted ? 0 : videoRef.current.volume || 1);
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const formatVideoTime = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const readTutorialAloud = () => {
    if (!('speechSynthesis' in window)) return;
    const text = [tutorial.subject, tutorial.title, tutorial.chapterTitle, tutorial.chapterContent, tutorial.description].filter(Boolean).join('. ');
    if (!text.trim()) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return <article className="tutorial-card card">
    <div className="custom-player" ref={playerRef}>
      {tutorial.mediaType === 'audio' ? (
        <audio controls preload="metadata" src={tutorial.audioUrl || tutorial.videoUrl || ''} aria-label={`${tutorial.title} audio`} />
      ) : (
        <>
          <video ref={videoRef} playsInline muted={muted} preload="metadata" poster={tutorial.thumbnailUrl} src={tutorial.videoUrl} aria-label={`${tutorial.title} video`} onLoadedMetadata={(event) => { event.currentTarget.volume = 1; event.currentTarget.muted = false; setMuted(false); setVolume(1); setDuration(event.currentTarget.duration); }} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onClick={togglePlayback} />
          {!playing && <button type="button" className="player-center-play" onClick={togglePlayback} aria-label="Play video">▶</button>}
          <div className="player-controls">
            <button type="button" className="player-icon-button" onClick={togglePlayback} aria-label={playing ? 'Pause video' : 'Play video'} title={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
            <button type="button" className="player-icon-button skip-button" onClick={() => skip(-10)} aria-label="Rewind 10 seconds" title="Rewind 10 seconds">↶<small>10</small></button>
            <button type="button" className="player-icon-button skip-button" onClick={() => skip(10)} aria-label="Forward 10 seconds" title="Forward 10 seconds">↷<small>10</small></button>
            <span className="player-time">{formatVideoTime(currentTime)} / {formatVideoTime(duration)}</span>
            <input className="player-progress" type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={(event) => { const value = Number(event.target.value); if (videoRef.current) videoRef.current.currentTime = value; setCurrentTime(value); }} aria-label="Video timeline" />
            <label className="player-volume"><button type="button" className="player-sound-button" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'} title={muted ? 'Unmute' : 'Mute'}>{muted || volume === 0 ? '×' : '◖'}</button><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const value = Number(event.target.value); setVolume(value); setMuted(value === 0); if (videoRef.current) { videoRef.current.volume = value; videoRef.current.muted = value === 0; } }} aria-label="Video volume" /></label>
            <select className="player-speed" value={playbackRate} onChange={(event) => changePlaybackRate(Number(event.target.value))} aria-label="Playback speed"><option value="0.75">0.75x</option><option value="1">1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select>
            <button type="button" className="player-fullscreen-button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'} title={isFullscreen ? 'Exit full screen' : 'Full screen'}><span aria-hidden="true">⛶</span><span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span></button>
          </div>
        </>
      )}
    </div>
    <div>
      <span className="tag">{tutorial.board} · {tutorial.subject}</span>
      <h3>{tutorial.title}</h3>
      <p>{tutorial.description || 'Watch this lesson at your own pace.'}</p>
      {tutorial.chapterTitle && <strong className="chapter-title">{tutorial.chapterTitle}</strong>}
      {tutorial.chapterContent && <p className="chapter-content">{tutorial.chapterContent}</p>}
      {tutorial.chapterTitle || tutorial.chapterContent || tutorial.description ? <button className="text-btn" type="button" onClick={readTutorialAloud}>🔊 Read aloud</button> : null}
      {tutorial.videoUrl && <button className="tutorial-focus-link" type="button" onClick={() => navigate(`/video-player?video=${encodeURIComponent(tutorial.videoUrl || '')}&poster=${encodeURIComponent(tutorial.thumbnailUrl || '')}&title=${encodeURIComponent(tutorial.title)}&board=${encodeURIComponent(tutorial.board || '')}&subject=${encodeURIComponent(tutorial.subject || '')}&description=${encodeURIComponent(tutorial.description || '')}`)}>Open focused player →</button>}
      <div className="focus-timer" aria-label="Video focus timer">
        <strong>Focus timer</strong>
        {timerActive ? <span className="timer-countdown" role="timer">{formattedTime}</span> : <label><span className="sr-only">Minutes</span><input type="number" min="1" max="120" value={minutes} onChange={(event) => setMinutes(Number(event.target.value) || 1)} aria-label="Focus timer minutes" /> <span>minutes</span></label>}
        <button className="timer-button" type="button" onClick={timerActive ? stopTimer : startTimer}>{timerActive ? 'Stop timer' : 'Start timer'}</button>
      </div>
    </div>
  </article>;
}

export function Dashboard() {
  const { data, isLoading } = useDashboard(); const { data: tutorials = [] } = useMediaTutorials(); const { data: readingContent = [] } = useReadingContent(); const { user } = useAuth(); const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('accesslearn-completed-lessons') || '[]'); } catch { return []; } });
  const [playingAudioTitle, setPlayingAudioTitle] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const displayName = user?.name?.trim() || 'Arjun';
  const visibleTutorials = tutorials.filter((tutorial) => !tutorial.className || tutorial.className === user?.className);
  const uploadedAudioLessons = visibleTutorials
    .filter((tutorial) => tutorial.mediaType === 'audio' || Boolean(tutorial.audioUrl))
    .map((tutorial) => ({
      title: tutorial.title,
      subject: tutorial.subject || 'General',
      duration: tutorial.description ? 'Lesson audio' : 'Audio lesson',
      tone: tutorial.subject === 'Science' ? 'orange' : tutorial.subject === 'History' ? 'blue' : 'purple',
      audioUrl: tutorial.audioUrl || tutorial.videoUrl || null,
    }));
  const visibleReading = readingContent.filter((item) => item.className === user?.className);

  const playAudioLesson = async (lesson: { title: string; audioUrl?: string | null }) => {
    if (!lesson.audioUrl) {
      return;
    }

    if (playingAudioTitle === lesson.title && audioPlayer) {
      audioPlayer.pause();
      setPlayingAudioTitle(null);
      setAudioPlayer(null);
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    const player = new Audio(lesson.audioUrl);
    player.onended = () => {
      setPlayingAudioTitle(null);
      setAudioPlayer(null);
    };
    player.onerror = () => {
      setPlayingAudioTitle(null);
      setAudioPlayer(null);
    };

    try {
      await player.play();
      setAudioPlayer(player);
      setPlayingAudioTitle(lesson.title);
    } catch {
      setPlayingAudioTitle(null);
      setAudioPlayer(null);
    }
  };
  const completedCount = data ? data.modules.filter((module) => module.status === 'completed' || completedIds.includes(module.id)).length : 0;
  const completeLesson = async (module: { id: string; title: string; subject: string }) => {
    const next = completedIds.includes(module.id) ? completedIds : [...completedIds, module.id];
    setCompletedIds(next);
    localStorage.setItem('accesslearn-completed-lessons', JSON.stringify(next));
    await markLessonProgress(user?.id || 'demo-student', module);
  };
  if (isLoading || !data) return <div className="skeleton-page"><div className="skeleton xl"/><div className="skeleton lg"/></div>;
  return <div className="dashboard-grid">
    <section className="main-col">
      <div className="hero-card card"><div><div className="eyebrow">YOUR DAILY LEARNING PATH</div><h1>Namaste, {displayName}.</h1><p>You've completed <strong>{data.completed}/{data.total}</strong> modules today. Keep going.</p></div><button className="btn secondary" onClick={()=>navigate('/learn')}>View History</button></div>
      <section><div className="section-head"><div><span className="eyebrow">AUDIO-FIRST</span><h2>NCERT Chapters</h2></div><button className="text-btn" onClick={()=>navigate('/audio')}>View all →</button></div><div className="audio-grid">{(uploadedAudioLessons.length > 0 ? uploadedAudioLessons : data.audioLessons.map((item) => ({
        title: item.title,
        subject: item.subject,
        duration: item.duration,
        tone: item.tone,
        audioUrl: null,
      }))).map((a)=><div className="audio-card card" key={a.title}><div className={'audio-icon '+(a.tone || 'orange')}>▶</div><div><button className="subject-link" type="button" onClick={()=>navigate('/audio')}>{a.subject}</button><h3>{a.title}</h3><p className="audio-time">▶ {a.duration || 'Audio lesson'} audio</p><button className="text-btn" type="button" disabled={!a.audioUrl} onClick={() => void playAudioLesson(a)}>{playingAudioTitle===a.title ? 'Pause audio' : 'Lesson audio'}</button></div></div>)}</div></section>
      <section className="tutorial-section">
        <div className="section-head"><div><span className="eyebrow">MY VIDEO LESSONS</span><h2>Lessons for {user?.className || 'your class'}</h2><p className="muted">Short, focused videos shared by your educator.</p></div></div>
        {visibleTutorials.length > 0 ? <div className="tutorial-grid">{visibleTutorials.map((tutorial) => <UploadedTutorialCard tutorial={tutorial} key={tutorial._id || tutorial.title} />)}</div> : <div className="tutorial-empty"><strong>No video lessons yet</strong><span>Your educator’s uploaded lessons for this class will appear here.</span></div>}
      </section>
      <section className="reading-section">
        <div className="section-head"><div><span className="eyebrow">READING CONTENT</span><h2>Reading for {user?.className || 'your class'}</h2><p className="muted">Short, clear reading lessons selected by your educator.</p></div></div>
        {visibleReading.length > 0 ? <div className="reading-grid">{visibleReading.map((item) => <article className="reading-card card" key={item.id}><span className="tag">{item.board} · {item.subject}</span><h3>{item.title}</h3>{item.chapterTitle && <strong>{item.chapterTitle}</strong>}<p>{item.description}</p><div className="reading-actions"><button className="text-btn" type="button" onClick={() => { const text = item.content || item.description || item.chapterTitle || item.title; if (!('speechSynthesis' in window)) return; if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; } const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 0.95; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); }}>🔊 Read chapter aloud</button><details><summary>Read lesson</summary><div className="reading-body">{item.content}</div></details></div></article>)}</div> : <div className="tutorial-empty"><strong>No reading lessons yet</strong><span>Your educator’s class-specific reading content will appear here.</span></div>}
      </section>
    </section>
    <aside className="right-col"><div className="card"><div className="section-head"><h2>Alerts Center</h2><span className="alert-dot">3</span></div><div className="alert danger"><b>Scholarship Deadline</b><span>Pre-Matric Scholarship portal closes in 2 days.</span><button>APPLY NOW</button></div><div className="alert info"><b>Government Update</b><span>New disability grant forms are available.</span><button>READ MORE</button></div><div className="alert success"><b>Assignment Graded</b><span>Math Homework 3: You scored 9/10.</span></div></div><div className="card path-card"><div className="section-head"><div><span className="eyebrow">TODAY</span><h2>Daily Learning Path</h2></div><span className="progress-badge">{data.modules.length ? Math.round((completedCount/data.modules.length)*100) : 0}%</span></div><div className="timeline">{data.modules.map((m) => { const completed = m.status === 'completed' || completedIds.includes(m.id); const locked = m.status === 'locked' && !completed; return <div className={'timeline-item '+(completed ? 'completed' : locked ? 'locked' : 'current')} key={m.id}><div className="timeline-dot">{completed ? '✓' : locked ? '🔒' : '▶'}</div><div className="timeline-line"/><div className="module-card"><div className="module-top"><div><span className="tag">{m.subject}</span><h3>{m.title}</h3><span className="muted">{m.time}</span></div><strong>{completed ? 100 : m.progress}%</strong></div>{!locked && <><div className="progress"><span style={{width:`${completed ? 100 : m.progress}%`}}/></div><button className="btn primary" onClick={() => { void completeLesson(m); navigate('/lesson'); }}>{completed ? 'Review Lesson' : 'Continue Learning'} →</button></>}</div></div>; })}</div></div><div className="card streak"><div><h3>Daily Streak</h3><span>🔥</span></div><div className="bars">{[55,75,65,90,25].map((h,i)=><div key={i}><i style={{height:`${h}%`}}/><small>{['M','T','W','T','F'][i]}</small></div>)}</div><strong>4 Day Streak! Keep it up!</strong></div></aside>
  </div>;
}
