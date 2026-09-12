exports.uploadMedia = async (req, res) => {
  console.log('req.files:', req.files); // ← check this
  console.log('req.body:', req.body); // ← check this

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Add your upload logic here
    return res.status(200).json({ message: 'Files uploaded successfully', files: req.files });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Server error while uploading media', error: error.message });
  }
};