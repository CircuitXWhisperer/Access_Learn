import { useState } from 'react';
import { createReadingContent, deleteMediaTutorial, deleteReadingContent, useMediaTutorials, useReadingContent, useStudents } from '../features/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { client } from '../lib/api/client';

export function Admin() {
  const { data } = useStudents();
  const { data: tutorials = [], refetch: refetchTutorials } = useMediaTutorials();
  const { data: readingContent = [], refetch: refetchReading } = useReadingContent();
  const navigate = useNavigate();
  const location = useLocation();
  const view = new URLSearchParams(location.search).get('view');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [videoClass, setVideoClass] = useState('Class 10');
  const [videoBoard, setVideoBoard] = useState('CBSE');
  const [videoSubject, setVideoSubject] = useState('Mathematics');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [readingTitle, setReadingTitle] = useState('');
  const [readingDescription, setReadingDescription] = useState('');
  const [readingChapter, setReadingChapter] = useState('');
  const [readingText, setReadingText] = useState('');

  const uploadFile = async () => {
    if (!videoFile && !audioFile) {
      setUploadMessage('Choose at least one video or audio file first.');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('title', videoTitle.trim() || (videoFile?.name ?? audioFile?.name ?? 'Untitled lesson'));
      formData.append('description', videoDescription.trim());
      formData.append('chapterTitle', chapterTitle.trim());
      formData.append('chapterContent', chapterContent.trim());
      formData.append('className', videoClass);
      formData.append('board', videoBoard);
      formData.append('subject', videoSubject);
      if (videoFile) {
        formData.append('videoFile', videoFile);
      }
      if (audioFile) {
        formData.append('audioFile', audioFile);
      }
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      await client.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refetchTutorials();
      const uploadType = videoFile && audioFile ? 'Video and audio lesson' : videoFile ? 'Video lesson' : 'Audio lesson';
      setUploadMessage(`${uploadType} uploaded successfully.`);
      setVideoFile(null);
      setAudioFile(null);
      setThumbnailFile(null);
    } catch (error: any) {
      setUploadMessage(error.response?.data?.message ?? 'Upload failed. Check the backend and local upload settings.');
    } finally {
      setUploading(false);
    }
  };

  const removeTutorial = async (id: string) => {
    if (!window.confirm('Remove this uploaded video? Students will no longer see it.')) return;
    setDeletingId(id);
    setUploadMessage('');
    try {
      await deleteMediaTutorial(id);
      await refetchTutorials();
      setUploadMessage('Video removed successfully.');
    } catch (error: any) {
      setUploadMessage(error.response?.data?.message ?? 'Unable to remove this video.');
    } finally {
      setDeletingId(null);
    }
  };

  const addReadingContent = async () => {
    if (!readingTitle.trim() || !readingText.trim()) { setUploadMessage('Add a reading title and content first.'); return; }
    setUploading(true);
    try {
      await createReadingContent({ title: readingTitle.trim(), description: readingDescription.trim(), className: videoClass, board: videoBoard, subject: videoSubject, chapterTitle: readingChapter.trim(), content: readingText.trim() });
      await refetchReading();
      setReadingTitle(''); setReadingDescription(''); setReadingChapter(''); setReadingText('');
      setUploadMessage('Reading content added successfully.');
    } catch (error: any) { setUploadMessage(error.response?.data?.message ?? 'Unable to add reading content.'); }
    finally { setUploading(false); }
  };

  const removeReadingContent = async (id: string) => {
    if (!window.confirm('Remove this reading lesson?')) return;
    setDeletingId(id);
    try { await deleteReadingContent(id); await refetchReading(); setUploadMessage('Reading content removed successfully.'); }
    catch (error: any) { setUploadMessage(error.response?.data?.message ?? 'Unable to remove reading content.'); }
    finally { setDeletingId(null); }
  };

  if (view === 'text') {
    return <div className="upload-page"><div className="page-heading"><div><span className="eyebrow">READING CONTENT STUDIO</span><h1>Add reading content</h1><p>Create short, class-specific reading lessons for students.</p></div></div><div className="card reading-editor"><div className="upload-form-grid"><label className="upload-field"><span>Class</span><select value={videoClass} onChange={(event) => setVideoClass(event.target.value)}><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option></select></label><label className="upload-field"><span>Board</span><select value={videoBoard} onChange={(event) => setVideoBoard(event.target.value)}><option>CBSE</option><option>ICSE</option><option>Maharashtra Board</option></select></label></div><label className="upload-field"><span>Subject</span><select value={videoSubject} onChange={(event) => setVideoSubject(event.target.value)}><option>Mathematics</option><option>Science</option><option>English</option><option>History</option><option>General</option></select></label><label className="upload-field"><span>Reading title</span><input value={readingTitle} onChange={(event) => setReadingTitle(event.target.value)} placeholder="e.g. Understanding Fractions" /></label><label className="upload-field"><span>Chapter title</span><input value={readingChapter} onChange={(event) => setReadingChapter(event.target.value)} placeholder="e.g. Chapter 2: Fractions" /></label><label className="upload-field"><span>Short description</span><input value={readingDescription} onChange={(event) => setReadingDescription(event.target.value)} placeholder="One clear sentence about this lesson" /></label><label className="upload-field"><span>Reading content</span><textarea className="reading-editor-textarea" value={readingText} onChange={(event) => setReadingText(event.target.value)} placeholder="Write the lesson in short paragraphs with clear spacing..." rows={12} /></label><button className="btn primary" type="button" disabled={uploading} onClick={addReadingContent}>{uploading ? 'Saving...' : 'Add reading lesson'}</button>{uploadMessage && <p className="upload-message" role="status">{uploadMessage}</p>}</div><section className="admin-media-library card"><div className="section-head"><div><span className="eyebrow">READING LIBRARY</span><h2>Added reading lessons</h2></div><strong>{readingContent.length} lessons</strong></div><div className="admin-media-list">{readingContent.map((item) => <div className="admin-media-row" key={item.id}><div><span className="tag">{item.className} · {item.board} · {item.subject}</span><h3>{item.title}</h3><p>{item.chapterTitle || item.description}</p></div><button className="delete-media-button" type="button" disabled={deletingId === item.id} onClick={() => removeReadingContent(item.id)}>{deletingId === item.id ? 'Removing...' : 'Remove lesson'}</button></div>)}{readingContent.length === 0 && <p className="muted">No reading lessons yet.</p>}</div></section></div>;
  }

  if (view === 'upload' || view === 'secure') {
    return (
      <div className="upload-page">
        <div className="page-heading"><div><span className="eyebrow">ADMIN CONTENT HUB</span><h1>{view === 'secure' ? 'Secure Upload' : 'Upload'}</h1><p>Add learning resources and media for your learners.</p></div></div>
        <div className="upload-grid"><div className="card upload-card"><h2>Upload Video or Audio Lesson</h2><label className="upload-field"><span>Choose video file (optional)</span><input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} /></label><label className="upload-field"><span>Choose audio file (optional)</span><input type="file" accept="audio/*" onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)} /></label><label className="upload-field"><span>Choose thumbnail image (optional)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} /></label><label className="upload-field"><span>Title</span><input value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="e.g. Introduction to Quadratic Equations" /></label><label className="upload-field"><span>Description</span><textarea value={videoDescription} onChange={(event) => setVideoDescription(event.target.value)} placeholder="Describe what students will learn" rows={3} /></label><div className="upload-form-grid"><label className="upload-field"><span>Class</span><select value={videoClass} onChange={(event) => setVideoClass(event.target.value)}><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option></select></label><label className="upload-field"><span>Board</span><select value={videoBoard} onChange={(event) => setVideoBoard(event.target.value)}><option>CBSE</option><option>ICSE</option><option>Maharashtra Board</option></select></label></div><label className="upload-field"><span>Subject</span><select value={videoSubject} onChange={(event) => setVideoSubject(event.target.value)}><option>Mathematics</option><option>Science</option><option>English</option><option>History</option><option>General</option></select></label><label className="upload-field"><span>Chapter title</span><input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="e.g. Chapter 1: Real Numbers" /></label><label className="upload-field"><span>Chapter content</span><textarea value={chapterContent} onChange={(event) => setChapterContent(event.target.value)} placeholder="Add key points, definitions, formulas, or reading notes for this chapter" rows={5} /></label><button className="btn primary full" type="button" disabled={uploading} onClick={uploadFile}>{uploading ? 'Uploading...' : 'Upload video tutorial'}</button></div>
        </div>
        {uploadMessage && <p className="upload-message" role="status">{uploadMessage}</p>}
        <section className="admin-media-library card">
          <div className="section-head"><div><span className="eyebrow">CONTENT LIBRARY</span><h2>Uploaded lessons</h2><p className="muted">Remove lessons that should no longer be visible to students.</p></div><strong>{tutorials.length} lessons</strong></div>
          <div className="admin-media-list">
            {tutorials.map((tutorial) => {
              const id = tutorial.id || tutorial._id;
              const mediaKind = tutorial.mediaType === 'audio' ? 'Audio lesson' : 'Video lesson';
              return <div className="admin-media-row" key={id || tutorial.title}><div><span className="tag">{mediaKind} · {tutorial.className} · {tutorial.board} · {tutorial.subject}</span><h3>{tutorial.title}</h3><p>{tutorial.description || 'No description added.'}</p></div><button className="delete-media-button" type="button" disabled={!id || deletingId === id} onClick={() => id && removeTutorial(id)}>{deletingId === id ? 'Removing...' : 'Remove lesson'}</button></div>;
            })}
            {tutorials.length === 0 && <p className="muted">No uploaded lessons yet.</p>}
          </div>
        </section>
      </div>
    );
  }

  return <div><div className="page-heading"><div><span className="eyebrow">EDUCATOR COMMAND CENTRE</span><h1>Good morning, Dr. Sharma.</h1><p>Monitor learning progress, accessibility support and assessment readiness from one place.</p></div><button className="btn primary" onClick={() => navigate('/classroom')}>Start live classroom</button></div><div className="stat-grid"><div className="stat card"><span>Active learners</span><strong>428</strong><small>+8.4% this month</small></div><div className="stat card"><span>Support plans</span><strong>64</strong><small>12 need review</small></div><div className="stat card"><span>Average progress</span><strong>76%</strong><small>Across Class 10</small></div><div className="stat card"><span>Upcoming exams</span><strong>3</strong><small>Next: 18 Sep</small></div></div><div className="admin-grid"><div className="card"><div className="section-head"><div><span className="eyebrow">STUDENT INCLUSION ROSTER</span><h2>Students needing attention</h2></div><button className="text-btn" onClick={() => navigate('/inclusion')}>Open roster →</button></div><div className="student-table">{data?.map((student) => <div className="student-row" key={student.name}><div className="avatar">{student.name[0]}</div><div><b>{student.name}</b><span>{student.className} • {student.support}</span></div><div className="mini-progress"><span style={{ width: `${student.progress}%` }} /></div><span className={student.status === 'On track' ? 'status good' : 'status warn'}>{student.status}</span></div>)}</div></div><div className="card command-actions"><span className="eyebrow">TOOLS</span><h2>Command Centre</h2><button onClick={() => navigate('/exam-management')}>✓ Exam Management</button><button onClick={() => navigate('/classroom')}>▣ Live Classroom</button><button onClick={() => navigate('/inclusion')}>♧ Inclusion Roster</button><button type="button">▤ NEP 2020 / RPwD Report Builder</button><button type="button">⌁ Accessible PDF Remediation</button></div></div></div>;
}