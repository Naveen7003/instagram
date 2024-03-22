const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const mongoose = require('mongoose');
const { Readable } = require('stream');

async function uploadFileToGridFS(filename, filePath) {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'  // Specify the correct bucket name
    });

    const uploadStream = bucket.openUploadStream(filename);
    const fileStream = fs.createReadStream(filePath);

    fileStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
        uploadStream.on('finish', (file) => {
            resolve(file);
        });

        uploadStream.on('error', (error) => {
            reject(error);
        });
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads');
    },
    filename: function (req, file, cb) {
        const unique = uuidv4();
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = { upload, uploadFileToGridFS };
