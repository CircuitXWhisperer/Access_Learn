import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './components/RequireAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Learn } from './pages/Learn';
import { Lesson } from './pages/Lesson';
import { Audio } from './pages/Audio';
import { Schemes } from './pages/Schemes';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Classroom } from './pages/Classroom';
import { ExamHall } from './pages/ExamHall';
import { ExamManagement } from './pages/ExamManagement';
import { Inclusion } from './pages/Inclusion';
import { VideoPlayer } from './pages/VideoPlayer';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export default function App(){ return <QueryClientProvider client={queryClient}><BrowserRouter><AuthProvider><ErrorBoundary><Routes><Route path="/login" element={<Login/>}/><Route element={<RequireAuth><AppShell/></RequireAuth>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/video-player" element={<VideoPlayer/>}/><Route path="/learn" element={<Learn/>}/><Route path="/lesson" element={<Lesson/>}/><Route path="/audio" element={<Audio/>}/><Route path="/schemes" element={<Schemes/>}/><Route path="/profile" element={<Profile/>}/><Route path="/admin" element={<RequireAuth role="admin"><Admin/></RequireAuth>}/><Route path="/classroom" element={<RequireAuth role="admin"><Classroom/></RequireAuth>}/><Route path="/exam-management" element={<RequireAuth role="admin"><ExamManagement/></RequireAuth>}/><Route path="/inclusion" element={<RequireAuth role="admin"><Inclusion/></RequireAuth>}/><Route path="/exam" element={<ExamHall/>}/></Route><Route path="*" element={<Navigate to="/login" replace/>}/></Routes></ErrorBoundary></AuthProvider></BrowserRouter></QueryClientProvider> }
