import { Media } from '../models/media.js';
import { uploadsRoot } from '../config/cloudinary.js';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const indexPath = fileURLToPath(new URL('../data/media-index.json', import.meta.url));

async function readMediaIndex() {
  try { return JSON.parse(await fs.readFile(indexPath, 'utf8')); } catch { return []; }
}

async function writeMediaIndex(items) {
  await fs.mkdir(path.dirname(indexPath), { recursive: true });
  await fs.writeFile(indexPath, JSON.stringify(items, null, 2));
}

// Upload single or multiple files
export const uploadMedia = async (req, res) => {
  try {
    const videoFile = req.files?.videoFile?.[0] ?? req.files?.file?.[0];
    const audioFile = req.files?.audioFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];
    const uploadedFile = videoFile || audioFile;

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const relativeVideoPath = videoFile ? path.relative(uploadsRoot, videoFile.path).split(path.sep).join('/') : null;
    const relativeAudioPath = audioFile ? path.relative(uploadsRoot, audioFile.path).split(path.sep).join('/') : null;
    const thumbnailPath = thumbnailFile ? `/uploads/${path.relative(uploadsRoot, thumbnailFile.path).split(path.sep).join('/')}` : null;
    const mediaType = videoFile ? 'video' : 'audio';
    const mediaData = {
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      chapterTitle: req.body.chapterTitle || '',
      chapterContent: req.body.chapterContent || '',
      className: req.body.className || 'Class 10',
      board: req.body.board || 'CBSE',
      subject: req.body.subject || 'General',
      thumbnailUrl: thumbnailPath,
      imageUrl: null,
      videoUrl: relativeVideoPath ? `/uploads/${relativeVideoPath}` : null,
      audioUrl: relativeAudioPath ? `/uploads/${relativeAudioPath}` : null,
      publicId: uploadedFile.filename,
      mediaType,
    };

    const localMedia = { id: `${Date.now()}-${uploadedFile.filename}`, ...mediaData, createdAt: new Date().toISOString() };
    const index = await readMediaIndex();
    index.unshift(localMedia);
    await writeMediaIndex(index);

    try {
      if (mongoose.connection.readyState !== 1) throw new Error('MongoDB is not connected');
      const media = await Media.create(mediaData);
      return res.status(201).json({
        success: true,
        message: 'Upload successful',
        data: { ...localMedia, ...(media.toObject?.() || {}) },
      });
    } catch (databaseError) {
      console.error('Local upload succeeded, but media metadata was not saved:', databaseError);
      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully to local storage.',
        data: localMedia,
        warning: 'Local media index saved; MongoDB metadata was not available.',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all media
export const getAllMedia = async (req, res) => {
  try {
    const localMedia = await readMediaIndex();
    try {
      const media = await Media.find().sort({ createdAt: -1 });
      return res.json([...localMedia, ...media]);
    } catch {
      return res.json(localMedia);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete media
export const deleteMedia = async (req, res) => {
  try {
    const index = await readMediaIndex();
    const localMedia = index.find((item) => item.id === req.params.id);
    if (localMedia) {
      const filePaths = [localMedia.videoUrl, localMedia.audioUrl, localMedia.thumbnailUrl].filter(Boolean);
      for (const relativePath of filePaths) await fs.rm(path.join(path.dirname(uploadsRoot), relativePath.replace('/uploads/', 'uploads/')), { force: true });
      await writeMediaIndex(index.filter((item) => item.id !== req.params.id));
      return res.json({ success: true, message: 'Deleted successfully' });
    }
    const media = await Media.findById(req.params.id).catch(() => null);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    await media.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};