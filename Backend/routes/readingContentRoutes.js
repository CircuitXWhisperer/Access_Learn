import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const contentPath = fileURLToPath(new URL('../data/reading-content.json', import.meta.url));
const uploadsRoot = fileURLToPath(new URL('../uploads/', import.meta.url));
const readingRoot = path.join(uploadsRoot, 'reading-content');

const safeSegment = (value, fallback) => (String(value || fallback).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || fallback);

async function readContent() {
  try { return JSON.parse(await fs.readFile(contentPath, 'utf8')); } catch { return []; }
}

async function writeContent(items) {
  await fs.mkdir(path.dirname(contentPath), { recursive: true });
  await fs.writeFile(contentPath, JSON.stringify(items, null, 2));
}

router.get('/', async (req, res) => {
  res.json(await readContent());
});

router.post('/', async (req, res) => {
  const { title, description, className, board, subject, chapterTitle, content } = req.body;
  if (!title || !className || !subject || !content) return res.status(400).json({ message: 'Title, class, subject, and reading content are required.' });

  const items = await readContent();
  const classFolder = safeSegment(className, 'Class-10');
  const subjectFolder = safeSegment(subject, 'General');
  const itemId = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const classSpecificFolder = path.join(readingRoot, classFolder, subjectFolder);

  await fs.mkdir(classSpecificFolder, { recursive: true });
  const contentFilePath = path.join(classSpecificFolder, `${itemId}.md`);
  await fs.writeFile(contentFilePath, content, 'utf8');

  const item = {
    id: itemId,
    title,
    description: description || '',
    className,
    board: board || 'CBSE',
    subject,
    chapterTitle: chapterTitle || '',
    content,
    contentFile: `/uploads/reading-content/${classFolder}/${subjectFolder}/${itemId}.md`,
    createdAt: new Date().toISOString(),
  };

  items.unshift(item);
  await writeContent(items);
  res.status(201).json({ success: true, data: item });
});

router.delete('/:id', async (req, res) => {
  const items = await readContent();
  const itemIndex = items.findIndex((item) => item.id === req.params.id);

  if (itemIndex === -1) return res.status(404).json({ message: 'Reading content not found.' });

  const item = items[itemIndex];
  if (item.contentFile) {
    const localContentPath = path.join(uploadsRoot, item.contentFile.replace(/^\/uploads\//, ''));
    await fs.rm(localContentPath, { force: true });
  }

  items.splice(itemIndex, 1);
  await writeContent(items);
  res.json({ success: true });
});

export default router;
