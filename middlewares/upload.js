const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const uniqueName = originalName + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName); 
  }
});

const upload = multer({ storage: storage });

module.exports = upload;