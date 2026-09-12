import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type Player from 'video.js/dist/types/player';
import { VideoJsPlayer } from '../components/VideoJsPlayer';

export function VideoPlayer() {
  const [searchParams] = useSearchParams();
  const frameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoUrl = searchParams.get('video') || '';
  const title = searchParams.get('title') || 'Video lesson';
  const board = searchParams.get('board') || 'Board lesson';
  const subject = searchParams.get('subject') || 'Lesson';
  const description = searchParams.get('description') || 'Watch this lesson at your own pace.';
  const poster = searchParams.get('poster') || undefined;
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const interval = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        playerRef.current?.pause();
        setTimerActive(false);
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [timerActive]);

  const startTimer = () => {
    setRemaining(Math.max(1, Math.min(120, minutes)) * 60);
    setTimerActive(true);
    void playerRef.current?.play();
  };

  const toggleFullscreen = () => {
    if (!frameRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current.requestFullscreen();
  };

  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <div className="video-player-page">
      <div className="video-player-topbar">
        <div>
          <span className="eyebrow">VIDEO LECTURES</span>
          <h1>{title}</h1>
          <p>{board} · {subject}</p>
        </div>
        <div className="video-player-actions"><button className="btn primary" type="button" onClick={toggleFullscreen}>{isFullscreen ? '⛶ Exit full screen' : '⛶ Full screen'}</button><Link className="btn secondary" to="/dashboard">← Back to Dashboard</Link></div>
      </div>
      <div className="video-player-frame card" ref={frameRef}>
        {videoUrl ? <VideoJsPlayer src={videoUrl} title={title} poster={poster} onReady={(player) => { playerRef.current = player; }} /> : <div className="tutorial-empty"><strong>No video selected</strong><span>Return to the Dashboard and choose an uploaded lesson.</span></div>}
      </div>
      <div className="video-player-details"><div><span className="eyebrow">{board} · {subject}</span><h2>{title}</h2><p>{description}</p></div><div className="video-focus-control"><strong>Focus timer</strong>{timerActive ? <span className="timer-countdown">{formattedTime}</span> : <label><input type="number" min="1" max="120" value={minutes} onChange={(event) => setMinutes(Number(event.target.value) || 1)} aria-label="Focus timer minutes" /> minutes</label>}<button className="timer-button" type="button" onClick={timerActive ? () => { setTimerActive(false); setRemaining(0); } : startTimer}>{timerActive ? 'Stop timer' : 'Start focus timer'}</button></div></div>
      <p className="video-player-note">Powered by the AccessLearn player. Playback speed, captions, timeline, volume, and fullscreen are available in the player controls.</p>
    </div>
  );
}
