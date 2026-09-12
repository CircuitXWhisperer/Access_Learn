import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const progressPath = fileURLToPath(new URL('../data/learning-progress.json', import.meta.url));

async function readProgress() {
  try { return JSON.parse(await fs.readFile(progressPath, 'utf8')); } catch { return []; }
}

async function writeProgress(items) {
  await fs.writeFile(progressPath, JSON.stringify(items, null, 2));
}

router.get('/', async (req, res) => {
  const studentId = req.query.studentId || 'demo-student';
  const items = await readProgress();
  res.json(items.filter((item) => item.studentId === studentId));
});

router.post('/:moduleId', async (req, res) => {
  const studentId = req.body.studentId || 'demo-student';
  const items = await readProgress();
  const record = { studentId, moduleId: req.params.moduleId, title: req.body.title || '', subject: req.body.subject || '', progress: Math.max(0, Math.min(100, Number(req.body.progress ?? 100))), completed: Boolean(req.body.completed ?? true), updatedAt: new Date().toISOString() };
  const next = items.filter((item) => !(item.studentId === studentId && item.moduleId === req.params.moduleId));
  next.push(record);
  await fs.mkdir(path.dirname(progressPath), { recursive: true });
  await writeProgress(next);
  res.json({ success: true, data: record });
});

export default router;
