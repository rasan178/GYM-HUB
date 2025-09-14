// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUploadFolder = (req) => {
  if (req.baseUrl.includes('trainer')) return 'uploads/trainers/';
  if (req.baseUrl.includes('class')) return 'uploads/classes/';
  if (req.baseUrl.includes('testimonial')) return 'uploads/testimonials/';
  if (req.baseUrl.includes('user')) return 'uploads/users/profile/';
  return 'uploads/';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getUploadFolder(req);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
