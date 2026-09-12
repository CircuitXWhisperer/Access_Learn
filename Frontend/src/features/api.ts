import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../lib/api/client';
import { env } from '../lib/env';
import { demoUsers, modules, schemes, students, audioLessons, type Scheme, type Student, type User, type LearningModule, type AudioLesson } from '../demo/data';

type DashboardData = { modules: LearningModule[]; audioLessons: AudioLesson[]; streak: number; completed: number; total: number; alerts: number };
export type MediaTutorial = { id?: string; _id?: string; title: string; description?: string; chapterTitle?: string; chapterContent?: string; className?: string; board?: string; subject?: string; thumbnailUrl?: string; videoUrl?: string; audioUrl?: string; mediaType?: 'video' | 'audio' | string };
export type ReadingContent = { id: string; title: string; description?: string; className: string; board?: string; subject: string; chapterTitle?: string; content: string };

const demo = <T,>(value: T, delay = 180) => new Promise<T>((resolve) => setTimeout(() => resolve(value), delay));

export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      if (env.VITE_DEMO_MODE) return demo(demoUsers.student);
      return (await client.get('/user/me')).data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const response = await client.get('/dashboard');
        const payload = response.data?.data ?? response.data;
        if (payload?.modules) return payload;
      } catch {
        // Fall back to demo data when the backend is unavailable.
      }

      return demo({
        modules,
        audioLessons,
        streak: 4,
        completed: 2,
        total: modules.length,
        alerts: 3,
      });
    },
    staleTime: 60 * 1000,
  });
}

export function useSchemes() {
  return useQuery<Scheme[]>({
    queryKey: ['schemes'],
      queryFn: async () => {
        if (env.VITE_DEMO_MODE) return demo(schemes);
        try { return (await client.get('/schemes')).data.data; } catch { return demo(schemes); }
      },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ['students'],
      queryFn: async () => {
        if (env.VITE_DEMO_MODE) return demo(students);
        try { return (await client.get('/students')).data.data; } catch { return demo(students); }
      },
    staleTime: 60 * 1000,
  });
}

export function useMediaTutorials() {
  return useQuery<MediaTutorial[]>({
    queryKey: ['media-tutorials'],
    queryFn: async () => {
      try {
        const items = await client.get('/media').then((response) => response.data.data ?? response.data);
        return items.map((item: MediaTutorial) => ({
          ...item,
          thumbnailUrl: item.thumbnailUrl?.startsWith('http') ? item.thumbnailUrl : item.thumbnailUrl ? `${env.VITE_API_BASE_URL}${item.thumbnailUrl}` : item.thumbnailUrl,
          videoUrl: item.videoUrl?.startsWith('http') ? item.videoUrl : item.videoUrl ? `${env.VITE_API_BASE_URL}${item.videoUrl}` : item.videoUrl,
          audioUrl: item.audioUrl?.startsWith('http') ? item.audioUrl : item.audioUrl ? `${env.VITE_API_BASE_URL}${item.audioUrl}` : item.audioUrl,
        }));
      } catch { return []; }
    },
    staleTime: 60 * 1000,
  });
}

export async function deleteMediaTutorial(id: string) {
  return client.delete(`/media/${encodeURIComponent(id)}`);
}

export function useReadingContent() {
  return useQuery<ReadingContent[]>({ queryKey: ['reading-content'], queryFn: async () => { try { return (await client.get('/reading-content')).data; } catch { return []; } }, staleTime: 30 * 1000 });
}

export async function createReadingContent(content: Omit<ReadingContent, 'id'>) {
  return client.post('/reading-content', content);
}

export async function deleteReadingContent(id: string) {
  return client.delete(`/reading-content/${encodeURIComponent(id)}`);
}

export async function markLessonProgress(studentId: string, module: { id: string; title: string; subject: string }, completed = true) {
  return client.post(`/learning-progress/${encodeURIComponent(module.id)}`, { studentId, title: module.title, subject: module.subject, progress: completed ? 100 : 65, completed });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; className: string; language: string; support: string }) => {
      if (env.VITE_DEMO_MODE) return demo(body);
      return (await client.patch('/user/me', body)).data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}
