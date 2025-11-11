const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const fileMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(req.file);
    next();
  });
};

exports.fileMiddleware = fileMiddleware;