const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const directory = path.join(__dirname, '..', 'uploads');
const extensions = { 'image/png': '.png', 'image/jpeg': '.jpg' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 12 },
  fileFilter: (req, file, cb) => {
    if (extensions[file.mimetype]) return cb(null, true);
    const error = new Error('Formato de imagen no permitido'); error.code = 'INVALID_IMAGE'; cb(error);
  }
});
async function persistCover(req, res, next) {
  if (!req.file) return next();
  const data = req.file.buffer;
  const png = data.length >= 8 && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  const jpeg = data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255;
  if (!(req.file.mimetype === 'image/png' && png || req.file.mimetype === 'image/jpeg' && jpeg)) {
    return res.status(400).send('La portada no contiene una imagen PNG o JPEG válida.');
  }
  try {
    const filename = randomUUID() + extensions[req.file.mimetype];
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), data, { flag: 'wx' });
    req.file.filename = filename;
    // Un fallo de validación o de base de datos no debe dejar una portada huérfana.
    res.on('finish', () => {
      if (res.statusCode >= 400) fs.unlink(path.join(directory, filename)).catch(() => {});
    });
    next();
  } catch (error) { next(error); }
}
module.exports = upload;
module.exports.persistCover = persistCover;
