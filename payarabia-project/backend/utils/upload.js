const multer = require('multer');
const sharp = require('sharp');

// Configure multer memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to resize images
const resizeImage = (width, height) => {
  return async (req, res, next) => {
    if (!req.file) return next();

    try {
      req.file.buffer = await sharp(req.file.buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      req.file.mimetype = 'image/jpeg';
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  upload,
  resizeImage,
};