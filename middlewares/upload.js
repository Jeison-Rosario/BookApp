const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const directory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(directory, { recursive: true });
const extensions = { 'image/png': '.png', 'image/jpeg': '.jpg' };
module.exports = multer({
  storage: multer.diskStorage({
    destination: directory,
    filename: (req, file, cb) => cb(null, randomUUID() + extensions[file.mimetype])
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 12 },
  fileFilter: (req, file, cb) => {
    if (extensions[file.mimetype]) return cb(null, true);
    const error = new Error('Formato de imagen no permitido');
    error.code = 'INVALID_IMAGE';
    cb(error);
  }
});
