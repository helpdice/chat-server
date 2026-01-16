const admin = require('firebase-admin');

// Replace with your serviceAccountKey.json path
const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
