import express from 'express';
import { upload } from '../config/cloudinary.js';
import {
  uploadMedia,
  getAllMedia,
  deleteMedia,
} from '../controllers/mediaController.js';

const router = express.Router();

// Upload single file:  upload.single('file')
// Upload multiple files: upload.array('files', 10)

router.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'videoFile', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadMedia);
router.get('/', getAllMedia);
router.delete('/:id', deleteMedia);

export default router;