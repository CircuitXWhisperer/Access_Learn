import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const uploadsRoot = fileURLToPath(new URL('../uploads/', import.meta.url));
const safeSegment = (value, fallback) => (String(value || fallback).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || fallback);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const classFolder = safeSegment(req.body.className, 'Class-10');
    const subjectFolder = safeSegment(req.body.subject, 'General');
    const folder = path.join(uploadsRoot, classFolder, subjectFolder);
    fs.mkdirSync(folder, { recursive: true });
    callback(null, folder);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = safeSegment(path.basename(file.originalname, extension), 'lesson');
    callback(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
];
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.avi', '.mp3', '.wav', '.m4a', '.ogg', '.webm']);

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const mimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const extensionAllowed = allowedExtensions.has(extension);

  if (mimeAllowed || extensionAllowed) callback(null, true);
  else callback(new Error('Only JPG, PNG, WEBP, MP4, MOV, AVI, MP3, WAV, M4A, OGG, and WEBM files are allowed.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024 } });

export { upload, uploadsRoot };