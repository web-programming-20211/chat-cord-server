var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");

const firebase= admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://chat-web-67d25.appspot.com',
});

const uploadFile = (file) => {
    if(!file) {
        return new error("Error: No files found")
    } 
    const blob = admin.storage().bucket().file(file.originalname)
    const blobWriter = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    })
    blobWriter.on('error', (err) => {
        return new err
    })
    blobWriter.on('finish', () => {
        return "File uploaded"
    })
    blobWriter.end(file.buffer)
}

module.exports = { uploadFile}