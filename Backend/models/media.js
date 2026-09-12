import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    chapterTitle: { type: String, default: '' },
    chapterContent: { type: String, default: '' },
    className: { type: String, default: 'Class 10' },
    board: { type: String, default: 'CBSE' },
    subject: { type: String, default: 'General' },
    thumbnailUrl: { type: String, default: null },
    imageUrl: { type: String },   // for image upload
    videoUrl: { type: String },   // for video upload
    audioUrl: { type: String, default: null }, // for optional audio upload
    publicId: { type: String },   // needed for deletion
    mediaType: { type: String, enum: ['image', 'video', 'audio'] },
  },
  { timestamps: true }
);

export const Media = mongoose.model('Media', mediaSchema);