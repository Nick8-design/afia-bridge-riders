const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads' folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Creates a unique name: timestamp-filename.extension
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

module.exports = upload;