const admin = require("firebase-admin");
const path = require("path");

// Load service account key from project root
const serviceAccount = require(path.resolve(__dirname, "../../serviceAccountKey.json"));

let _adminInstance = null;
let _dbInstance = null;

function getAdmin() {
  if (!_adminInstance) {
    _adminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    _dbInstance = admin.firestore();
  }
  return { admin: _adminInstance, db: _dbInstance };
}

module.exports = { getAdmin };