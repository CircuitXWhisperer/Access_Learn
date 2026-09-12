import { useMemo, useRef, useState } from 'react';
import { useDashboard, useMediaTutorials } from '../features/api';

type AudioCard = {
  title: string;
  subject: string;
  duration: string;
  tone: string;
  audioUrl?: string | null;
};

export function Audio() {
  const { data } = useDashboard();
  const { data: tutorials = [] } = useMediaTutorials();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioLessons = useMemo<AudioCard[]>(() => {
    const uploadedAudioLessons: AudioCard[] = tutorials
      .filter((tutorial) => tutorial.mediaType === 'audio' || Boolean(tutorial.audioUrl))
      .map((tutorial) => ({
        title: tutorial.title,
        subject: tutorial.subject || 'General',
        duration: tutorial.description ? 'Lesson audio' : 'Audio lesson',
        tone: tutorial.subject === 'Science' ? 'orange' : tutorial.subject === 'History' ? 'blue' : 'purple',
        audioUrl: tutorial.audioUrl || tutorial.videoUrl || null,
      }));

    return uploadedAudioLessons.length > 0
      ? uploadedAudioLessons
      : (data?.audioLessons ?? []).map((item) => ({
          title: item.title,
          subject: item.subject,
          duration: item.duration,
          tone: item.tone,
          audioUrl: null,
        }));
  }, [data, tutorials]);

  const featuredLesson = audioLessons.find((lesson) => lesson.title === selectedLesson) ?? audioLessons[0];

  const toggleFeaturedAudio = async () => {
    if (!featuredLesson?.audioUrl || !audioRef.current) return;

    if (audioRef.current.paused) {
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
  };

  return <div><div className="page-heading"><div><span className="eyebrow">AUDIO LIBRARY</span><h1>Learn by listening</h1><p>Short, focused audio lessons for students who prefer audio-first learning.</p></div></div><div className="audio-feature card"><div className="audio-wave">{Array.from({length:32}).map((_,i)=><i key={i} style={{height:`${25+((i*17)%70)}%`}}/>)}</div><div><span className="tag">FEATURED</span><h2>{featuredLesson?.subject || 'General'}: {featuredLesson?.title || 'No audio lesson yet'}</h2><p>{featuredLesson?.duration || 'No audio uploaded yet'} • {featuredLesson?.subject || 'General'}</p>{featuredLesson?.audioUrl ? <><audio ref={audioRef} preload="metadata" src={featuredLesson.audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} /><button className="btn primary" type="button" onClick={toggleFeaturedAudio}>{isPlaying ? '■ Pause' : '▶ Play now'}</button></> : <button className="btn primary" type="button" onClick={() => setSelectedLesson(featuredLesson?.title ?? null)}>{selectedLesson === featuredLesson?.title ? 'Lesson selected' : 'Open lesson'}</button>}</div></div><div className="audio-grid three">{audioLessons.map((a)=><div className="card audio-card" key={a.title}><div className={'audio-icon '+a.tone}>▶</div><div><span className="tag">{a.subject}</span><h3>{a.title}</h3><p>{a.duration} audio</p><button className="text-btn" type="button" onClick={() => setSelectedLesson(a.title)}>{selectedLesson===a.title ? 'Selected' : 'Play lesson →'}</button></div></div>)}</div></div> }
